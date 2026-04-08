import 'package:flutter/foundation.dart';
import '../models/auth_response.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService;

  AuthResponse? _authResponse;
  Map<String, String>? _cachedIdentity;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;
  bool _hasCachedIdentity = false;

  AuthProvider(this._authService);

  AuthResponse? get authResponse => _authResponse;
  Map<String, String>? get cachedIdentity => _cachedIdentity;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;
  bool get hasCachedIdentity => _hasCachedIdentity;

  String get patientName => _cachedIdentity?['name'] ?? _authResponse?.name ?? '';

  Future<void> checkAuthState() async {
    _isLoading = true;
    notifyListeners();

    try {
      _isAuthenticated = await _authService.isLoggedIn();
      _hasCachedIdentity = await _authService.hasCachedIdentity();
      _cachedIdentity = await _authService.getCachedIdentity();
    } catch (e) {
      _isAuthenticated = false;
      _hasCachedIdentity = false;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> verifyIdentity({
    required String institutePatientId,
    required String institutionId,
    required String email,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _authResponse = await _authService.verifyIdentity(
        institutePatientId: institutePatientId,
        institutionId: institutionId,
        email: email,
      );
      _isAuthenticated = true;
      _hasCachedIdentity = true;
      _cachedIdentity = await _authService.getCachedIdentity();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> login({
    required String institutePatientId,
    required String institutionId,
    required String fingerprintTemplate,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _authResponse = await _authService.login(
        institutePatientId: institutePatientId,
        institutionId: institutionId,
        fingerprintTemplate: fingerprintTemplate,
      );
      _isAuthenticated = true;
      _hasCachedIdentity = true;
      _cachedIdentity = await _authService.getCachedIdentity();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> enrollFingerprint({
    required String patientId,
    required String fingerprintTemplate,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _authService.enrollFingerprint(
        patientId: patientId,
        fingerprintTemplate: fingerprintTemplate,
      );
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    await _authService.logout();
    _authResponse = null;
    _cachedIdentity = null;
    _isAuthenticated = false;
    _hasCachedIdentity = false;
    notifyListeners();
  }
}
