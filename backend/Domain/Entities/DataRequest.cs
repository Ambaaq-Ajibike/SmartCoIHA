using Domain.Enums;

namespace Domain.Entities
{
    public class DataRequest(
        string patientId,
        string resourceType,
        DateTime requestedTimestamp,
        VerificationStatus institutionApprovedStatus,
        bool fingerprintValidationSuccess)
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string PatientId { get; private set; } = patientId;
        public string ResourceType { get; private set; } = resourceType;
        public DateTime RequestedTimestamp { get; private set; } = requestedTimestamp;
        public DateTime ExpiryTimestamp { get; private set; } = requestedTimestamp + TimeSpan.FromHours(2);
        public VerificationStatus InstitutionApprovedStatus { get; private set; } = institutionApprovedStatus;
        public bool FingerprintValidationSuccess { get; private set; } = fingerprintValidationSuccess;

        public bool IsExpired() => DateTime.UtcNow > ExpiryTimestamp;

        public bool IsApproved() => InstitutionApprovedStatus == VerificationStatus.Verified && FingerprintValidationSuccess;

        public async Task UpdateInstitutionApprovalStatus(VerificationStatus newStatus)
        {
            InstitutionApprovedStatus = newStatus;
        }
    }
}
