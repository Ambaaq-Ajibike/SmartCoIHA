import '../config/api_constants.dart';
import '../models/auth_response.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  final ApiService _apiService;
  final StorageService _storageService;

  AuthService(this._apiService, this._storageService);

  Future<AuthResponse> verifyIdentity({
    required String institutePatientId,
    required String institutionId,
    required String email,
  }) async {
    final response = await _apiService.post(ApiConstants.verifyIdentity, {
      'institutePatientId': institutePatientId,
      'institutionId': institutionId,
      'email': email,
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Identity verification failed.');
    }

    final authResponse = AuthResponse.fromJson(response['data']);

    await _storageService.saveToken(authResponse.token);
    await _storageService.savePatientIdentity(
      patientId: authResponse.patientId,
      institutePatientId: authResponse.institutePatientId,
      institutionId: authResponse.institutionId,
      email: authResponse.email,
      name: authResponse.name,
      institutionName: authResponse.institutionName,
    );

    return authResponse;
  }

  Future<AuthResponse> login({
    required String institutePatientId,
    required String institutionId,
    required String fingerprintTemplate,
  }) async {
    final response = await _apiService.post(ApiConstants.login, {
      'institutePatientId': institutePatientId,
      'institutionId': institutionId,
      'fingerprintTemplate': fingerprintTemplate,
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Login failed.');
    }

    final authResponse = AuthResponse.fromJson(response['data']);

    await _storageService.saveToken(authResponse.token);
    await _storageService.savePatientIdentity(
      patientId: authResponse.patientId,
      institutePatientId: authResponse.institutePatientId,
      institutionId: authResponse.institutionId,
      email: authResponse.email,
      name: authResponse.name,
      institutionName: authResponse.institutionName,
    );

    return authResponse;
  }

  Future<void> enrollFingerprint({
    required String patientId,
    required String fingerprintTemplate,
  }) async {
    final response = await _apiService.post(ApiConstants.enrollFingerprint, {
      'patientId': patientId,
      'fingerprintTemplate': fingerprintTemplate,
    });

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Fingerprint enrollment failed.');
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await _storageService.getToken();
    return token != null;
  }

  Future<bool> hasCachedIdentity() async {
    final identity = await _storageService.getPatientIdentity();
    return identity != null;
  }

  Future<Map<String, String>?> getCachedIdentity() async {
    return await _storageService.getPatientIdentity();
  }

  Future<void> logout() async {
    await _storageService.clearAll();
  }

  Future<List<Map<String, dynamic>>> getVerifiedInstitutions() async {
    final response = await _apiService.get(ApiConstants.verifiedInstitutions);

    if (response['success'] != true) {
      throw Exception(response['message'] ?? 'Failed to load institutions.');
    }

    final data = response['data'] as List<dynamic>;
    return data.cast<Map<String, dynamic>>();
  }
}
