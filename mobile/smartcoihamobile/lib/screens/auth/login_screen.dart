import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';
import '../../services/biometric_service.dart';
import '../../widgets/app_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _patientIdController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  List<Map<String, dynamic>> _institutions = [];
  String? _selectedInstitutionId;
  bool _loadingInstitutions = true;
  bool _biometricCaptured = false;
  String? _capturedTemplate;

  @override
  void initState() {
    super.initState();
    _loadInstitutions();
  }

  @override
  void dispose() {
    _patientIdController.dispose();
    super.dispose();
  }

  Future<void> _loadInstitutions() async {
    try {
      final authService = context.read<AuthService>();
      final institutions = await authService.getVerifiedInstitutions();
      if (mounted) {
        setState(() {
          _institutions = institutions;
          _loadingInstitutions = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingInstitutions = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load institutions: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  Future<void> _captureBiometric() async {
    if (_patientIdController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your Patient ID first'), backgroundColor: AppColors.error),
      );
      return;
    }

    final biometricService = context.read<BiometricService>();
    final patientId = _patientIdController.text.trim();

    final template = await biometricService.authenticateAndGetKey(
      patientId: patientId,
      reason: 'Authenticate to log in to SmartCoIHA',
    );

    if (!mounted) return;

    if (template != null) {
      setState(() {
        _biometricCaptured = true;
        _capturedTemplate = template;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Biometric authentication failed. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedInstitutionId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an institution'), backgroundColor: AppColors.error),
      );
      return;
    }
    if (!_biometricCaptured || _capturedTemplate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please scan your fingerprint first'), backgroundColor: AppColors.error),
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    await authProvider.login(
      institutePatientId: _patientIdController.text.trim(),
      institutionId: _selectedInstitutionId!,
      fingerprintTemplate: _capturedTemplate!,
    );

    if (!mounted) return;

    if (authProvider.error != null) {
      // Reset biometric state on failure so they can re-scan
      setState(() {
        _biometricCaptured = false;
        _capturedTemplate = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(authProvider.error!), backgroundColor: AppColors.error),
      );
    } else {
      Navigator.of(context).pushReplacementNamed('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.health_and_safety, color: Colors.white, size: 28),
                ),
                const SizedBox(height: 24),
                Text(
                  'Patient Login',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Select your institution, enter your Patient ID, then verify with your fingerprint.',
                  style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted, height: 1.5),
                ),
                const SizedBox(height: 32),
                Text('Institution', style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink)),
                const SizedBox(height: 8),
                _loadingInstitutions
                    ? const Center(child: CircularProgressIndicator())
                    : DropdownButtonFormField<String>(
                        decoration: const InputDecoration(
                          hintText: 'Select your institution',
                          prefixIcon: Icon(Icons.business_outlined),
                        ),
                        items: _institutions.map((inst) {
                          return DropdownMenuItem(
                            value: inst['id'] as String,
                            child: Text(inst['name'] as String),
                          );
                        }).toList(),
                        onChanged: (value) => setState(() => _selectedInstitutionId = value),
                        validator: (value) => value == null ? 'Please select an institution' : null,
                      ),
                const SizedBox(height: 20),
                Text('Institute Patient ID', style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink)),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _patientIdController,
                  decoration: const InputDecoration(
                    hintText: 'Enter your patient ID',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Patient ID is required';
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                Text('Biometric Verification', style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: _captureBiometric,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    decoration: BoxDecoration(
                      color: _biometricCaptured ? AppColors.successBg : AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _biometricCaptured ? AppColors.success : AppColors.slate200,
                        width: _biometricCaptured ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _biometricCaptured ? Icons.check_circle : Icons.fingerprint,
                          size: 44,
                          color: _biometricCaptured ? AppColors.success : AppColors.primary,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _biometricCaptured ? 'Fingerprint verified' : 'Tap to scan fingerprint',
                          style: GoogleFonts.manrope(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: _biometricCaptured ? AppColors.success : AppColors.primary,
                          ),
                        ),
                        if (!_biometricCaptured)
                          Text(
                            'Use your device biometric to authenticate',
                            style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                AppButton(
                  label: 'Login',
                  isLoading: authProvider.isLoading,
                  onPressed: _biometricCaptured ? _login : null,
                  icon: Icons.login,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
