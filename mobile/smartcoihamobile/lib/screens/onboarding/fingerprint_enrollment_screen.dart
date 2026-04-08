import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../services/biometric_service.dart';
import '../../widgets/app_button.dart';

class FingerprintEnrollmentScreen extends StatefulWidget {
  final String patientId;

  const FingerprintEnrollmentScreen({super.key, required this.patientId});

  @override
  State<FingerprintEnrollmentScreen> createState() => _FingerprintEnrollmentScreenState();
}

class _FingerprintEnrollmentScreenState extends State<FingerprintEnrollmentScreen> {
  bool _isSuccess = false;
  bool _isProcessing = false;
  bool _biometricAvailable = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
  }

  Future<void> _checkBiometricAvailability() async {
    final biometricService = context.read<BiometricService>();
    final available = await biometricService.canAuthenticate();
    if (mounted) {
      setState(() => _biometricAvailable = available);
    }
  }

  Future<void> _enroll() async {
    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    final biometricService = context.read<BiometricService>();
    final authProvider = context.read<AuthProvider>();

    // Step 1: Biometric auth + generate cryptographic key
    final template = await biometricService.enrollBiometric(patientId: widget.patientId);

    if (!mounted) return;

    if (template == null) {
      setState(() {
        _isProcessing = false;
        _errorMessage = 'Biometric authentication failed or was cancelled. Please try again.';
      });
      return;
    }

    // Step 2: Send the generated key to the backend as the fingerprint template
    await authProvider.enrollFingerprint(
      patientId: widget.patientId,
      fingerprintTemplate: template,
    );

    if (!mounted) return;

    if (authProvider.error != null) {
      setState(() {
        _isProcessing = false;
        _errorMessage = authProvider.error;
      });
    } else {
      setState(() {
        _isProcessing = false;
        _isSuccess = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isSuccess) {
      return Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.successBg,
                    borderRadius: BorderRadius.circular(40),
                  ),
                  child: const Icon(Icons.check, size: 40, color: AppColors.success),
                ),
                const SizedBox(height: 24),
                Text(
                  'Fingerprint Enrolled!',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your biometric has been registered successfully. You can now approve data requests securely.',
                  style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted, height: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                AppButton(
                  label: 'Continue to Login',
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed('/login');
                  },
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Fingerprint Enrollment')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppColors.emerald100,
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Icon(Icons.fingerprint, color: AppColors.primary, size: 56),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Register Your Biometric',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Your device biometric (fingerprint or face) will be used to generate a unique secure key. '
                'This key is stored encrypted on your device and is the only way to approve data sharing requests.',
                style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted, height: 1.5),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.emerald50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.emerald200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield_outlined, size: 18, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Your biometric data never leaves your device. Only a cryptographic key is sent to the server.',
                        style: GoogleFonts.manrope(fontSize: 12, color: AppColors.primary, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              if (!_biometricAvailable) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.errorBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFECACA)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber, size: 18, color: AppColors.error),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'No biometric sensor detected or no biometrics enrolled on this device. '
                          'Please set up fingerprint or face recognition in your device settings.',
                          style: GoogleFonts.manrope(fontSize: 12, color: AppColors.error, height: 1.4),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.errorBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, size: 16, color: AppColors.error),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: GoogleFonts.manrope(fontSize: 12, color: AppColors.error),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const Spacer(),
              AppButton(
                label: 'Scan Fingerprint to Enroll',
                isLoading: _isProcessing,
                onPressed: _biometricAvailable ? _enroll : null,
                icon: Icons.fingerprint,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
