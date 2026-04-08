import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../models/patient.dart';
import '../../services/api_service.dart';
import '../../config/api_constants.dart';
import '../../widgets/app_card.dart';
import '../../widgets/bottom_nav.dart';
import '../../widgets/status_badge.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Patient? _patient;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final apiService = context.read<ApiService>();
      final response = await apiService.get(ApiConstants.profile);

      if (response['success'] == true && mounted) {
        setState(() {
          _patient = Patient.fromJson(response['data'] as Map<String, dynamic>);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profile')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _patient == null
              ? Center(
                  child: Text('Failed to load profile', style: GoogleFonts.manrope(color: AppColors.muted)),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.emerald100,
                          borderRadius: BorderRadius.circular(40),
                        ),
                        child: Center(
                          child: Text(
                            _patient!.name.isNotEmpty ? _patient!.name[0].toUpperCase() : 'P',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _patient!.name,
                        style: GoogleFonts.spaceGrotesk(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.ink),
                      ),
                      const SizedBox(height: 4),
                      StatusBadge(status: _patient!.enrollmentStatus),
                      const SizedBox(height: 28),
                      AppCard(
                        child: Column(
                          children: [
                            _buildInfoRow(Icons.email_outlined, 'Email', _patient!.email),
                            const Divider(color: AppColors.emerald100, height: 24),
                            _buildInfoRow(Icons.business_outlined, 'Institution', _patient!.institution),
                            const Divider(color: AppColors.emerald100, height: 24),
                            _buildInfoRow(Icons.badge_outlined, 'Patient ID', _patient!.institutionPatientId),
                            const Divider(color: AppColors.emerald100, height: 24),
                            _buildInfoRow(Icons.verified_user_outlined, 'Status', _patient!.enrollmentStatus),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
      bottomNavigationBar: BottomNav(
        currentIndex: 3,
        onTap: (index) {
          if (index == 0) Navigator.of(context).pushReplacementNamed('/home');
          if (index == 1) Navigator.of(context).pushReplacementNamed('/data-requests');
          if (index == 2) Navigator.of(context).pushReplacementNamed('/notifications');
        },
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.muted),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted)),
              const SizedBox(height: 2),
              Text(value, style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink)),
            ],
          ),
        ),
      ],
    );
  }
}
