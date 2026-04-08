import 'package:flutter/foundation.dart';
import '../config/api_constants.dart';
import '../models/notification.dart';
import '../services/api_service.dart';

class NotificationProvider extends ChangeNotifier {
  final ApiService _apiService;

  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  String? _error;

  NotificationProvider(this._apiService);

  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  Future<void> fetchNotifications() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(ApiConstants.notifications);

      if (response['success'] == true) {
        final data = response['data'] as List<dynamic>;
        _notifications = data
            .map((json) => NotificationModel.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        _error = response['message'] as String?;
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      final endpoint = ApiConstants.markNotificationRead(notificationId);
      await _apiService.put(endpoint);

      final index = _notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        final old = _notifications[index];
        _notifications[index] = NotificationModel(
          id: old.id,
          title: old.title,
          message: old.message,
          type: old.type,
          isRead: true,
          createdAt: old.createdAt,
          dataRequestId: old.dataRequestId,
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
