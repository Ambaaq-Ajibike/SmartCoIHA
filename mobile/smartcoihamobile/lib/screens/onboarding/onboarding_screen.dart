import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/app_colors.dart';
import '../../widgets/app_button.dart';

class OnboardingScreen extends StatelessWidget {
  final String? patientId;
  final String? institutionId;

  const OnboardingScreen({
    super.key,
    this.patientId,
    this.institutionId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Icon(
                  Icons.health_and_safety,
                  size: 56,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                'Welcome to SmartCoIHA',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Take control of your health data. Review and approve data requests from healthcare institutions with secure biometric verification.',
                style: GoogleFonts.manrope(
                  fontSize: 15,
                  color: AppColors.muted,
                  height: 1.6,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              _buildFeatureRow(Icons.fingerprint, 'Biometric Security',
                  'Approve data sharing with your fingerprint'),
              const SizedBox(height: 16),
              _buildFeatureRow(Icons.notifications_outlined, 'Real-time Alerts',
                  'Get notified when your data is requested'),
              const SizedBox(height: 16),
              _buildFeatureRow(Icons.shield_outlined, 'Full Control',
                  'You decide who accesses your health records'),
              const Spacer(),
              if (patientId != null && institutionId != null)
                AppButton(
                  label: 'Verify Your Identity',
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed(
                      '/email-verification',
                      arguments: {
                        'patientId': patientId,
                        'institutionId': institutionId,
                      },
                    );
                  },
                )
              else
                Column(
                  children: [
                    AppButton(
                      label: 'Get Started',
                      onPressed: () {
                        Navigator.of(context).pushReplacementNamed('/login');
                      },
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'You need to be registered by your institution first',
                      style: GoogleFonts.manrope(
                        fontSize: 12,
                        color: AppColors.muted,
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.emerald100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: AppColors.primary, size: 22),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.manrope(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
              ),
              Text(
                subtitle,
                style: GoogleFonts.manrope(
                  fontSize: 12,
                  color: AppColors.muted,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
