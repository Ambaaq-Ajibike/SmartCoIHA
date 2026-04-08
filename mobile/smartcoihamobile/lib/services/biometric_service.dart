import 'dart:convert';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'storage_service.dart';

/// Handles biometric authentication and cryptographic key management.
///
/// Security model:
/// - On enrollment, a random 64-byte cryptographic key is generated and stored
///   in platform-secure storage (Android Keystore / iOS Keychain).
/// - This key acts as a biometric-bound secret: the user must authenticate via
///   device biometrics (fingerprint/face) before the key can be read or used.
/// - The key is sent to the backend as the "fingerprint template", where it is
///   hashed with SHA-256 + patient ID salt and stored.
/// - On verification, the same key is retrieved after biometric auth and sent
///   to the backend for hash comparison.
/// - The actual biometric data never leaves the device's secure enclave.
class BiometricService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  final StorageService _storageService;

  BiometricService(this._storageService);

  /// Check if the device supports biometric authentication.
  Future<bool> isDeviceSupported() async {
    try {
      return await _localAuth.isDeviceSupported();
    } on PlatformException {
      return false;
    }
  }

  /// Check if biometrics are currently enrolled on the device.
  Future<bool> canAuthenticate() async {
    try {
      final isSupported = await _localAuth.isDeviceSupported();
      if (!isSupported) return false;

      final canCheck = await _localAuth.canCheckBiometrics;
      if (!canCheck) return false;

      final availableBiometrics = await _localAuth.getAvailableBiometrics();
      return availableBiometrics.isNotEmpty;
    } on PlatformException {
      return false;
    }
  }

  /// Get the list of available biometric types.
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } on PlatformException {
      return [];
    }
  }

  /// Prompt biometric authentication with a reason message.
  /// Returns true if authenticated, false otherwise.
  Future<bool> authenticate({required String reason}) async {
    try {
      return await _localAuth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );
    } on PlatformException {
      return false;
    }
  }

  /// Enroll biometric for a patient.
  ///
  /// 1. Prompts biometric auth to confirm the user's identity.
  /// 2. Generates a random 64-byte cryptographic key.
  /// 3. Stores the key in secure storage keyed to the patient ID.
  /// 4. Returns the key as a base64 string (to be sent to the backend as the template).
  ///
  /// Returns null if biometric auth fails or is unavailable.
  Future<String?> enrollBiometric({required String patientId}) async {
    final canAuth = await canAuthenticate();
    if (!canAuth) return null;

    final authenticated = await authenticate(
      reason: 'Authenticate to register your biometric for SmartCoIHA',
    );
    if (!authenticated) return null;

    // Generate a cryptographically secure random key
    final random = Random.secure();
    final keyBytes = List<int>.generate(64, (_) => random.nextInt(256));
    final key = base64Encode(keyBytes);

    // Store the key in secure storage, keyed to patient ID
    await _storageService.saveBiometricKey(patientId, key);

    return key;
  }

  /// Retrieve the stored biometric key after biometric authentication.
  ///
  /// 1. Prompts biometric auth.
  /// 2. On success, retrieves the stored key for the given patient.
  /// 3. Returns the key (to be sent to the backend for verification).
  ///
  /// Returns null if auth fails or no key is stored.
  Future<String?> authenticateAndGetKey({
    required String patientId,
    required String reason,
  }) async {
    final canAuth = await canAuthenticate();
    if (!canAuth) return null;

    final authenticated = await authenticate(reason: reason);
    if (!authenticated) return null;

    return await _storageService.getBiometricKey(patientId);
  }

  /// Check if a biometric key exists for a patient.
  Future<bool> hasEnrolledKey(String patientId) async {
    final key = await _storageService.getBiometricKey(patientId);
    return key != null;
  }
}
