import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_card.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Settings')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Account',
              style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.ink),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: [
                  _buildSettingsItem(
                    icon: Icons.fingerprint,
                    title: 'Re-enroll Fingerprint',
                    subtitle: 'Update your biometric data',
                    onTap: () {
                      final identity = context.read<AuthProvider>().cachedIdentity;
                      if (identity != null) {
                        Navigator.of(context).pushNamed(
                          '/fingerprint-enrollment',
                          arguments: {'patientId': identity['institutePatientId']},
                        );
                      }
                    },
                  ),
                  const Divider(color: AppColors.emerald100, height: 1),
                  _buildSettingsItem(
                    icon: Icons.delete_outline,
                    title: 'Clear Local Data',
                    subtitle: 'Remove cached data and log out',
                    isDestructive: true,
                    onTap: () async {
                      final confirmed = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: Text('Clear Data', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600)),
                          content: Text(
                            'This will clear all local data and log you out. You will need to re-authenticate.',
                            style: GoogleFonts.manrope(),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(false),
                              child: const Text('Cancel'),
                            ),
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(true),
                              child: Text('Clear', style: TextStyle(color: AppColors.error)),
                            ),
                          ],
                        ),
                      );

                      if (confirmed == true && context.mounted) {
                        await context.read<AuthProvider>().logout();
                        if (context.mounted) {
                          Navigator.of(context).pushNamedAndRemoveUntil('/onboarding', (_) => false);
                        }
                      }
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            Text(
              'About',
              style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.ink),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: [
                  _buildSettingsItem(
                    icon: Icons.info_outline,
                    title: 'SmartCoIHA',
                    subtitle: 'Version 1.0.0',
                  ),
                  const Divider(color: AppColors.emerald100, height: 1),
                  _buildSettingsItem(
                    icon: Icons.shield_outlined,
                    title: 'Privacy',
                    subtitle: 'Your health data is never stored on this device',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required String subtitle,
    VoidCallback? onTap,
    bool isDestructive = false,
  }) {
    final color = isDestructive ? AppColors.error : AppColors.ink;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: color),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: color)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted)),
                ],
              ),
            ),
            if (onTap != null)
              const Icon(Icons.chevron_right, size: 20, color: AppColors.muted),
          ],
        ),
      ),
    );
  }
}
