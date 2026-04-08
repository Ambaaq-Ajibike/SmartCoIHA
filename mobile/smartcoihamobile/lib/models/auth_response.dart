class AuthResponse {
  final String token;
  final String patientId;
  final String institutePatientId;
  final String name;
  final String email;
  final String institutionId;
  final String institutionName;

  AuthResponse({
    required this.token,
    required this.patientId,
    required this.institutePatientId,
    required this.name,
    required this.email,
    required this.institutionId,
    required this.institutionName,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'] as String,
      patientId: json['patientId'] as String,
      institutePatientId: json['institutePatientId'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      institutionId: json['institutionId'] as String,
      institutionName: json['institutionName'] as String,
    );
  }
}
