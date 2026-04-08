import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (bgColor, textColor) = _getColors(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: GoogleFonts.manrope(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }

  (Color, Color) _getColors(String status) {
    switch (status) {
      case 'Approved & Shared':
      case 'Verified':
        return (AppColors.successBg, const Color(0xFF166534));
      case 'Awaiting Your Approval':
        return (AppColors.warningBg, const Color(0xFF92400E));
      case 'Awaiting Institution Review':
      case 'Pending':
        return (AppColors.infoBg, const Color(0xFF1E3A5F));
      case 'Denied by Institution':
      case 'Denied':
      case 'Failed':
        return (AppColors.errorBg, const Color(0xFFB91C1C));
      case 'Expired':
        return (const Color(0xFFF1F5F9), const Color(0xFF475569));
      default:
        return (AppColors.slate100, AppColors.slate700);
    }
  }
}
