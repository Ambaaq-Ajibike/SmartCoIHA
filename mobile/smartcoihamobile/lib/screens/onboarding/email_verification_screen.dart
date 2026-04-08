import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_button.dart';

class EmailVerificationScreen extends StatefulWidget {
  final String patientId;
  final String institutionId;

  const EmailVerificationScreen({
    super.key,
    required this.patientId,
    required this.institutionId,
  });

  @override
  State<EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    await authProvider.verifyIdentity(
      institutePatientId: widget.patientId,
      institutionId: widget.institutionId,
      email: _emailController.text.trim(),
    );

    if (!mounted) return;

    if (authProvider.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error!),
          backgroundColor: AppColors.error,
        ),
      );
    } else {
      Navigator.of(context).pushReplacementNamed(
        '/fingerprint-enrollment',
        arguments: {
          'patientId': authProvider.cachedIdentity?['institutePatientId'] ?? widget.patientId,
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Verify Your Identity'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.emerald100,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.email_outlined, color: AppColors.primary, size: 28),
                ),
                const SizedBox(height: 24),
                Text(
                  'Confirm Your Email',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter the email address your institution used to register you. This confirms your identity.',
                  style: GoogleFonts.manrope(
                    fontSize: 14,
                    color: AppColors.muted,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.emerald50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.emerald200),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.badge_outlined, size: 16, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text(
                        'Patient ID: ${widget.patientId}',
                        style: GoogleFonts.manrope(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    hintText: 'Enter your email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Email is required';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                      return 'Enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'Verify Email',
                  isLoading: authProvider.isLoading,
                  onPressed: _verify,
                  icon: Icons.verified_outlined,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
