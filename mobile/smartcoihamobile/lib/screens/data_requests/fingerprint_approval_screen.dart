import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../models/data_request.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_request_provider.dart';
import '../../services/biometric_service.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_card.dart';

class FingerprintApprovalScreen extends StatefulWidget {
  final DataRequest request;

  const FingerprintApprovalScreen({super.key, required this.request});

  @override
  State<FingerprintApprovalScreen> createState() => _FingerprintApprovalScreenState();
}

class _FingerprintApprovalScreenState extends State<FingerprintApprovalScreen> {
  int _attempts = 0;
  bool _isLocked = false;
  bool _isSuccess = false;
  bool _isProcessing = false;
  Timer? _lockTimer;

  @override
  void dispose() {
    _lockTimer?.cancel();
    super.dispose();
  }

  Duration get _timeRemaining {
    final remaining = widget.request.expiryTimestamp.difference(DateTime.now().toUtc());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  bool get _isExpired => _timeRemaining == Duration.zero;

  Future<void> _approve() async {
    setState(() => _isProcessing = true);

    final identity = context.read<AuthProvider>().cachedIdentity;
    if (identity == null) {
      setState(() => _isProcessing = false);
      return;
    }

    final biometricService = context.read<BiometricService>();
    final patientId = identity['institutePatientId']!;

    // Step 1: Biometric auth to retrieve the stored key
    final template = await biometricService.authenticateAndGetKey(
      patientId: patientId,
      reason: 'Authenticate to approve data request from ${widget.request.requestingInstitutionName}',
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
      _handleFailedAttempt();
      return;
    }

    // Step 2: Send the key to the backend for verification
    final provider = context.read<DataRequestProvider>();
    final success = await provider.approveRequest(
      requestId: widget.request.requestId,
      institutePatientId: patientId,
      fingerprintTemplate: template,
    );

    if (!mounted) return;

    setState(() => _isProcessing = false);

    if (success) {
      setState(() => _isSuccess = true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Verification failed.'),
          backgroundColor: AppColors.error,
        ),
      );
      _handleFailedAttempt();
    }
  }

  void _handleFailedAttempt() {
    _attempts++;
    if (_attempts >= 3) {
      setState(() => _isLocked = true);
      _lockTimer = Timer(const Duration(seconds: 30), () {
        if (mounted) {
          setState(() {
            _isLocked = false;
            _attempts = 0;
          });
        }
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
                  decoration: BoxDecoration(color: AppColors.successBg, borderRadius: BorderRadius.circular(40)),
                  child: const Icon(Icons.check, size: 40, color: AppColors.success),
                ),
                const SizedBox(height: 24),
                Text('Access Approved', style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.ink)),
                const SizedBox(height: 8),
                Text(
                  'Your ${widget.request.resourceType} data has been shared with ${widget.request.requestingInstitutionName}.',
                  style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted, height: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                AppButton(
                  label: 'Back to Requests',
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final remaining = _timeRemaining;
    final minutes = remaining.inMinutes;
    final dateFormat = DateFormat('MMM d, yyyy · h:mm a');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Approve Request')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Request Details', style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 16),
                  _buildDetailRow('Institution', widget.request.requestingInstitutionName),
                  _buildDetailRow('Resource Type', widget.request.resourceType),
                  _buildDetailRow('Requested', dateFormat.format(widget.request.requestedTimestamp.toLocal())),
                  _buildDetailRow('Expires', dateFormat.format(widget.request.expiryTimestamp.toLocal())),
                  if (!_isExpired)
                    _buildDetailRow('Time Remaining', '$minutes minutes'),
                ],
              ),
            ),
            const SizedBox(height: 20),
            if (_isExpired)
              AppCard(
                child: Row(
                  children: [
                    const Icon(Icons.timer_off, color: AppColors.error),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'This request has expired and can no longer be approved.',
                        style: GoogleFonts.manrope(fontSize: 14, color: AppColors.error),
                      ),
                    ),
                  ],
                ),
              )
            else ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.warningBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline, color: Color(0xFF92400E), size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        '${widget.request.requestingInstitutionName} is requesting access to your ${widget.request.resourceType} records. '
                        'Use your fingerprint to approve this request.',
                        style: GoogleFonts.manrope(fontSize: 13, color: const Color(0xFF92400E), height: 1.5),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              // Biometric scan area
              Center(
                child: GestureDetector(
                  onTap: (_isLocked || _isProcessing) ? null : _approve,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: _isLocked
                          ? AppColors.errorBg
                          : _isProcessing
                              ? AppColors.emerald200
                              : AppColors.emerald100,
                      borderRadius: BorderRadius.circular(60),
                      border: Border.all(
                        color: _isLocked ? AppColors.error : AppColors.primary,
                        width: 2,
                      ),
                    ),
                    child: _isProcessing
                        ? const Padding(
                            padding: EdgeInsets.all(36),
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                            ),
                          )
                        : Icon(
                            _isLocked ? Icons.lock : Icons.fingerprint,
                            size: 56,
                            color: _isLocked ? AppColors.error : AppColors.primary,
                          ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  _isLocked
                      ? 'Too many failed attempts. Please wait 30 seconds.'
                      : _isProcessing
                          ? 'Verifying...'
                          : 'Tap to scan your fingerprint',
                  style: GoogleFonts.manrope(
                    fontSize: 14,
                    color: _isLocked ? AppColors.error : AppColors.muted,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),
              if (!_isLocked && !_isProcessing)
                AppButton(
                  label: 'Approve with Fingerprint',
                  onPressed: _approve,
                  icon: Icons.fingerprint,
                ),
              if (_attempts > 0 && !_isLocked)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Center(
                    child: Text(
                      'Attempt $_attempts of 3',
                      style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted),
                    ),
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: GoogleFonts.manrope(fontSize: 13, color: AppColors.muted)),
          ),
          Expanded(
            child: Text(value, style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.ink)),
          ),
        ],
      ),
    );
  }
}
