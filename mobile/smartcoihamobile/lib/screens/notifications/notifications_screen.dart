import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/notification_provider.dart';
import '../../widgets/app_card.dart';
import '../../widgets/bottom_nav.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'DataRequestCreated':
        return Icons.description_outlined;
      case 'InstitutionApproved':
        return Icons.check_circle_outline;
      case 'InstitutionDenied':
        return Icons.cancel_outlined;
      case 'PatientApproved':
        return Icons.verified_outlined;
      case 'RequestExpired':
        return Icons.timer_off_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'DataRequestCreated':
        return AppColors.accent;
      case 'InstitutionApproved':
        return AppColors.warning;
      case 'InstitutionDenied':
        return AppColors.error;
      case 'PatientApproved':
        return AppColors.success;
      case 'RequestExpired':
        return AppColors.slate500;
      default:
        return AppColors.muted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NotificationProvider>();
    final dateFormat = DateFormat('MMM d · h:mm a');

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Notifications')),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : provider.notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_off_outlined, size: 48, color: AppColors.slate300),
                      const SizedBox(height: 12),
                      Text('No notifications yet', style: GoogleFonts.manrope(color: AppColors.muted)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => provider.fetchNotifications(),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(20),
                    itemCount: provider.notifications.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final notification = provider.notifications[index];
                      final iconColor = _getColorForType(notification.type);
                      final icon = _getIconForType(notification.type);

                      return AppCard(
                        onTap: () {
                          if (!notification.isRead) {
                            provider.markAsRead(notification.id);
                          }
                          if (notification.dataRequestId != null) {
                            Navigator.of(context).pushNamed('/data-requests');
                          }
                        },
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: iconColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(icon, color: iconColor, size: 20),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          notification.title,
                                          style: GoogleFonts.manrope(
                                            fontSize: 14,
                                            fontWeight: notification.isRead ? FontWeight.w400 : FontWeight.w700,
                                            color: AppColors.ink,
                                          ),
                                        ),
                                      ),
                                      if (!notification.isRead)
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: AppColors.secondary,
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    notification.message,
                                    style: GoogleFonts.manrope(fontSize: 13, color: AppColors.muted, height: 1.4),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    dateFormat.format(notification.createdAt.toLocal()),
                                    style: GoogleFonts.manrope(fontSize: 11, color: AppColors.slate400),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
      bottomNavigationBar: BottomNav(
        currentIndex: 2,
        onTap: (index) {
          if (index == 0) Navigator.of(context).pushReplacementNamed('/home');
          if (index == 1) Navigator.of(context).pushReplacementNamed('/data-requests');
          if (index == 3) Navigator.of(context).pushReplacementNamed('/profile');
        },
      ),
    );
  }
}
