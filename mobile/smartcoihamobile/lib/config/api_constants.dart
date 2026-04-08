class ApiConstants {
  // Update this to your backend URL
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  // Patient Mobile endpoints
  static const String verifyIdentity = '/patient-mobile/verify-identity';
  static const String login = '/patient-mobile/login';
  static const String profile = '/patient-mobile/profile';
  static const String dataRequestHistory = '/patient-mobile/data-requests/history';
  static const String deviceToken = '/patient-mobile/device-token';

  // Notification endpoints
  static const String notifications = '/notifications/patient';
  static String markNotificationRead(String id) => '/notifications/$id/read';

  // Existing endpoints used by mobile
  static const String verifiedInstitutions = '/Institutions/verified';
  static const String enrollFingerprint = '/patients/fingerprint';
  static String verifyFingerprint(String requestId, String patientId) =>
      '/datarequest/$requestId/verify-fingerprint/$patientId';
}
