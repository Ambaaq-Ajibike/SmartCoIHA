class DataRequest {
  final String requestId;
  final String requestingInstitutionName;
  final String resourceType;
  final DateTime requestedTimestamp;
  final DateTime expiryTimestamp;
  final String institutionApprovalStatus;
  final bool patientApproved;
  final bool isExpired;
  final String status;

  DataRequest({
    required this.requestId,
    required this.requestingInstitutionName,
    required this.resourceType,
    required this.requestedTimestamp,
    required this.expiryTimestamp,
    required this.institutionApprovalStatus,
    required this.patientApproved,
    required this.isExpired,
    required this.status,
  });

  factory DataRequest.fromJson(Map<String, dynamic> json) {
    return DataRequest(
      requestId: json['requestId'] as String,
      requestingInstitutionName: json['requestingInstitutionName'] as String,
      resourceType: json['resourceType'] as String,
      requestedTimestamp: DateTime.parse(json['requestedTimestamp'] as String),
      expiryTimestamp: DateTime.parse(json['expiryTimestamp'] as String),
      institutionApprovalStatus: json['institutionApprovalStatus'] as String,
      patientApproved: json['patientApproved'] as bool,
      isExpired: json['isExpired'] as bool,
      status: json['status'] as String,
    );
  }
}
