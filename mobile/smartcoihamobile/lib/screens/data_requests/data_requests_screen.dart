import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../config/app_colors.dart';
import '../../providers/data_request_provider.dart';
import '../../widgets/app_card.dart';
import '../../widgets/bottom_nav.dart';
import '../../widgets/status_badge.dart';

class DataRequestsScreen extends StatefulWidget {
  const DataRequestsScreen({super.key});

  @override
  State<DataRequestsScreen> createState() => _DataRequestsScreenState();
}

class _DataRequestsScreenState extends State<DataRequestsScreen> {
  final _filters = ['All', 'Pending', 'Approved', 'Denied', 'Expired'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataRequestProvider>().fetchHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DataRequestProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Data Requests')),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _filters.length,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final filter = _filters[index];
                final isActive = provider.activeFilter == filter;
                return FilterChip(
                  label: Text(filter),
                  selected: isActive,
                  onSelected: (_) => provider.setFilter(filter),
                  selectedColor: AppColors.primary,
                  labelStyle: GoogleFonts.manrope(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: isActive ? Colors.white : AppColors.ink,
                  ),
                  backgroundColor: AppColors.surface,
                  side: BorderSide(color: isActive ? AppColors.primary : AppColors.emerald200),
                  showCheckmark: false,
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: provider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : provider.requests.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inbox_outlined, size: 48, color: AppColors.slate300),
                            const SizedBox(height: 12),
                            Text('No data requests found', style: GoogleFonts.manrope(color: AppColors.muted)),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => provider.fetchHistory(),
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                          itemCount: provider.requests.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final request = provider.requests[index];
                            final dateFormat = DateFormat('MMM d, yyyy · h:mm a');
                            final canApprove = request.status == 'Awaiting Your Approval';

                            return AppCard(
                              onTap: canApprove
                                  ? () => Navigator.of(context).pushNamed(
                                        '/fingerprint-approval',
                                        arguments: request,
                                      )
                                  : null,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          request.requestingInstitutionName,
                                          style: GoogleFonts.manrope(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.ink,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      StatusBadge(status: request.status),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(Icons.medical_information_outlined, size: 14, color: AppColors.muted),
                                      const SizedBox(width: 6),
                                      Text(
                                        request.resourceType,
                                        style: GoogleFonts.manrope(fontSize: 13, color: AppColors.muted),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Icon(Icons.schedule, size: 14, color: AppColors.muted),
                                      const SizedBox(width: 6),
                                      Text(
                                        dateFormat.format(request.requestedTimestamp.toLocal()),
                                        style: GoogleFonts.manrope(fontSize: 12, color: AppColors.muted),
                                      ),
                                    ],
                                  ),
                                  if (canApprove) ...[
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        const Icon(Icons.fingerprint, size: 16, color: AppColors.primary),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Tap to approve with fingerprint',
                                          style: GoogleFonts.manrope(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNav(
        currentIndex: 1,
        onTap: (index) {
          if (index == 0) Navigator.of(context).pushReplacementNamed('/home');
          if (index == 2) Navigator.of(context).pushReplacementNamed('/notifications');
          if (index == 3) Navigator.of(context).pushReplacementNamed('/profile');
        },
      ),
    );
  }
}
