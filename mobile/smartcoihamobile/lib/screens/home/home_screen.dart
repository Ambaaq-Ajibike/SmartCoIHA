import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_request_provider.dart';
import '../../providers/notification_provider.dart';
import '../../widgets/app_card.dart';
import '../../widgets/bottom_nav.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataRequestProvider>().fetchHistory();
      context.read<NotificationProvider>().fetchNotifications();
    });
  }

  void _onTabTap(int index) {
    switch (index) {
      case 0:
        break;
      case 1:
        Navigator.of(context).pushNamed('/data-requests');
        return;
      case 2:
        Navigator.of(context).pushNamed('/notifications');
        return;
      case 3:
        Navigator.of(context).pushNamed('/profile');
        return;
    }
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final dataRequestProvider = context.watch<DataRequestProvider>();
    final notificationProvider = context.watch<NotificationProvider>();
    final name = authProvider.patientName;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.health_and_safety, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Text('SmartCoIHA', style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w700)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => Navigator.of(context).pushNamed('/settings'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.wait([
            dataRequestProvider.fetchHistory(),
            notificationProvider.fetchNotifications(),
          ]);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hello, ${name.isNotEmpty ? name : "Patient"}',
                style: GoogleFonts.spaceGrotesk(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.ink),
              ),
              const SizedBox(height: 4),
              Text(
                'Here\'s what\'s happening with your data',
                style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Pending Approval',
                      dataRequestProvider.pendingCount.toString(),
                      Icons.pending_actions,
                      AppColors.warning,
                      AppColors.warningBg,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatCard(
                      'Total Requests',
                      dataRequestProvider.allRequests.length.toString(),
                      Icons.description_outlined,
                      AppColors.accent,
                      AppColors.infoBg,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Unread Alerts',
                      notificationProvider.unreadCount.toString(),
                      Icons.notifications_outlined,
                      AppColors.error,
                      AppColors.errorBg,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Container()),
                ],
              ),
              const SizedBox(height: 28),
              if (dataRequestProvider.pendingCount > 0) ...[
                Text(
                  'Action Required',
                  style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.ink),
                ),
                const SizedBox(height: 12),
                AppCard(
                  onTap: () => Navigator.of(context).pushNamed('/data-requests'),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.warningBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.fingerprint, color: Color(0xFF92400E)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${dataRequestProvider.pendingCount} request(s) awaiting your approval',
                              style: GoogleFonts.manrope(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.ink),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Tap to review and approve with your fingerprint',
                              style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.muted),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 28),
              Text(
                'Recent Notifications',
                style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.ink),
              ),
              const SizedBox(height: 12),
              if (notificationProvider.notifications.isEmpty)
                AppCard(
                  child: Center(
                    child: Text(
                      'No notifications yet',
                      style: GoogleFonts.manrope(fontSize: 14, color: AppColors.muted),
                    ),
                  ),
                )
              else
                ...notificationProvider.notifications.take(3).map((n) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: AppCard(
                        onTap: () => Navigator.of(context).pushNamed('/notifications'),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              margin: const EdgeInsets.only(top: 6),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: n.isRead ? Colors.transparent : AppColors.secondary,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    n.title,
                                    style: GoogleFonts.manrope(
                                      fontSize: 13,
                                      fontWeight: n.isRead ? FontWeight.w400 : FontWeight.w600,
                                      color: AppColors.ink,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    n.message,
                                    style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    )),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNav(currentIndex: _currentIndex, onTap: _onTabTap),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color iconColor, Color bgColor) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(height: 12),
          Text(value, style: GoogleFonts.spaceGrotesk(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.ink)),
          const SizedBox(height: 2),
          Text(label, style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted)),
        ],
      ),
    );
  }
}
