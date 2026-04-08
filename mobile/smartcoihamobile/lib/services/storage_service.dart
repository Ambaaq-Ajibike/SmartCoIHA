import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();

  static const _tokenKey = 'jwt_token';
  static const _patientIdKey = 'patient_id';
  static const _institutePatientIdKey = 'institute_patient_id';
  static const _institutionIdKey = 'institution_id';
  static const _emailKey = 'email';
  static const _nameKey = 'name';
  static const _institutionNameKey = 'institution_name';

  // Token
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  // Patient identity
  Future<void> savePatientIdentity({
    required String patientId,
    required String institutePatientId,
    required String institutionId,
    required String email,
    required String name,
    required String institutionName,
  }) async {
    await _storage.write(key: _patientIdKey, value: patientId);
    await _storage.write(key: _institutePatientIdKey, value: institutePatientId);
    await _storage.write(key: _institutionIdKey, value: institutionId);
    await _storage.write(key: _emailKey, value: email);
    await _storage.write(key: _nameKey, value: name);
    await _storage.write(key: _institutionNameKey, value: institutionName);
  }

  Future<Map<String, String>?> getPatientIdentity() async {
    final patientId = await _storage.read(key: _patientIdKey);
    final institutePatientId = await _storage.read(key: _institutePatientIdKey);
    final institutionId = await _storage.read(key: _institutionIdKey);
    final email = await _storage.read(key: _emailKey);
    final name = await _storage.read(key: _nameKey);
    final institutionName = await _storage.read(key: _institutionNameKey);

    if (patientId == null || institutePatientId == null || institutionId == null) {
      return null;
    }

    return {
      'patientId': patientId,
      'institutePatientId': institutePatientId,
      'institutionId': institutionId,
      'email': email ?? '',
      'name': name ?? '',
      'institutionName': institutionName ?? '',
    };
  }

  // Biometric key (per-patient cryptographic secret bound to biometrics)
  static const _biometricKeyPrefix = 'biometric_key_';

  Future<void> saveBiometricKey(String patientId, String key) async {
    await _storage.write(key: '$_biometricKeyPrefix$patientId', value: key);
  }

  Future<String?> getBiometricKey(String patientId) async {
    return await _storage.read(key: '$_biometricKeyPrefix$patientId');
  }

  Future<void> deleteBiometricKey(String patientId) async {
    await _storage.delete(key: '$_biometricKeyPrefix$patientId');
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
