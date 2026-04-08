class Patient {
  final String institutionPatientId;
  final String name;
  final String email;
  final String institution;
  final String enrollmentStatus;

  Patient({
    required this.institutionPatientId,
    required this.name,
    required this.email,
    required this.institution,
    required this.enrollmentStatus,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      institutionPatientId: json['institutionPatientId'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      institution: json['institution'] as String,
      enrollmentStatus: json['enrollmentStatus'] as String,
    );
  }
}
