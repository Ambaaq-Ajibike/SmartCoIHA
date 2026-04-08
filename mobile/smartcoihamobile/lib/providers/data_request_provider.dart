import 'package:flutter/foundation.dart';
import '../config/api_constants.dart';
import '../models/data_request.dart';
import '../services/api_service.dart';

class DataRequestProvider extends ChangeNotifier {
  final ApiService _apiService;

  List<DataRequest> _requests = [];
  bool _isLoading = false;
  String? _error;
  String _activeFilter = 'All';

  DataRequestProvider(this._apiService);

  List<DataRequest> get requests => _getFiltered();
  List<DataRequest> get allRequests => _requests;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get activeFilter => _activeFilter;

  int get pendingCount => _requests.where((r) => r.status == 'Awaiting Your Approval').length;

  void setFilter(String filter) {
    _activeFilter = filter;
    notifyListeners();
  }

  List<DataRequest> _getFiltered() {
    if (_activeFilter == 'All') return _requests;

    return _requests.where((r) {
      switch (_activeFilter) {
        case 'Pending':
          return r.status == 'Awaiting Your Approval' || r.status == 'Awaiting Institution Review';
        case 'Approved':
          return r.status == 'Approved & Shared';
        case 'Denied':
          return r.status == 'Denied by Institution';
        case 'Expired':
          return r.status == 'Expired';
        default:
          return true;
      }
    }).toList();
  }

  Future<void> fetchHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get(ApiConstants.dataRequestHistory);

      if (response['success'] == true) {
        final data = response['data'] as List<dynamic>;
        _requests = data.map((json) => DataRequest.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        _error = response['message'] as String?;
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> approveRequest({
    required String requestId,
    required String institutePatientId,
    required String fingerprintTemplate,
  }) async {
    try {
      final endpoint = ApiConstants.verifyFingerprint(requestId, institutePatientId);
      final response = await _apiService.post(endpoint, {
        'fingerprintTemplate': fingerprintTemplate,
      });

      if (response['success'] == true) {
        await fetchHistory();
        return true;
      } else {
        _error = response['message'] as String?;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
