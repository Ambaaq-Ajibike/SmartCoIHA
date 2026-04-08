import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../services/biometric_service.dart';
import '../../widgets/app_button.dart';

class FingerprintLoginScreen extends StatefulWidget {
  const FingerprintLoginScreen({super.key});

  @override
  State<FingerprintLoginScreen> createState() => _FingerprintLoginScreenState();
}

class _FingerprintLoginScreenState extends State<FingerprintLoginScreen> {
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    // Auto-prompt biometric on screen load
    WidgetsBinding.instance.addPostFrameCallback((_) => _login());
  }

  Future<void> _login() async {
    final authProvider = context.read<AuthProvider>();
    final identity = authProvider.cachedIdentity;

    if (identity == null) {
      Navigator.of(context).pushReplacementNamed('/login');
      return;
    }

    setState(() => _isProcessing = true);

    final biometricService = context.read<BiometricService>();
    final patientId = identity['institutePatientId']!;

    // Authenticate biometric and retrieve the stored cryptographic key
    final template = await biometricService.authenticateAndGetKey(
      patientId: patientId,
      reason: 'Authenticate to log in to SmartCoIHA',
    );

    if (!mounted) return;

    if (template == null) {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Biometric authentication failed or was cancelled.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    await authProvider.login(
      institutePatientId: identity['institutePatientId']!,
      institutionId: identity['institutionId']!,
      fingerprintTemplate: template,
    );

    if (!mounted) return;

    setState(() => _isProcessing = false);

    if (authProvider.error != null) {
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
    final name = authProvider.cachedIdentity?['name'] ?? 'Patient';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: _isProcessing ? null : _login,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: _isProcessing ? AppColors.emerald200 : AppColors.emerald100,
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: _isProcessing
                      ? const Padding(
                          padding: EdgeInsets.all(28),
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                          ),
                        )
                      : const Icon(Icons.fingerprint, size: 56, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Welcome back,',
                style: GoogleFonts.manrope(fontSize: 16, color: AppColors.muted),
              ),
              const SizedBox(height: 4),
              Text(
                name,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _isProcessing
                    ? 'Verifying your identity...'
                    : 'Tap the fingerprint icon to log in',
                style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted),
              ),
              const SizedBox(height: 40),
              if (!_isProcessing)
                AppButton(
                  label: 'Authenticate with Biometric',
                  onPressed: _login,
                  icon: Icons.fingerprint,
                ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  Navigator.of(context).pushReplacementNamed('/login');
                },
                child: Text(
                  'Use a different account',
                  style: GoogleFonts.manrope(color: AppColors.primary, fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
