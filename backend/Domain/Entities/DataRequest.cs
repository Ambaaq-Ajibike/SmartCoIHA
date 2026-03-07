using Domain.Enums;

namespace Domain.Entities
{
    public class DataRequest(
        Guid requestingInstitutionId,
        string institutePatientId,
        string resourceType)
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid RequestingInstitutionId { get; private set; } = requestingInstitutionId;
        public string InstitutePatientId { get; private set; } = institutePatientId;
        public string ResourceType { get; private set; } = resourceType;
        public DateTime RequestedTimestamp { get; private set; } = DateTime.Now;
        public DateTime ExpiryTimestamp { get; private set; } = DateTime.Now + TimeSpan.FromHours(2);
        public VerificationStatus InstitutionApprovedStatus { get; private set; } = VerificationStatus.Pending;
        public bool FingerprintValidationSuccess { get; private set; } = false;

        public bool IsExpired() => DateTime.UtcNow > ExpiryTimestamp;

        public bool IsApproved() => InstitutionApprovedStatus == VerificationStatus.Verified && FingerprintValidationSuccess;

        public async Task UpdateInstitutionApprovalStatus(VerificationStatus newStatus)
        {
            InstitutionApprovedStatus = newStatus;

        }
        public async Task UpdateFingerprintValidationResult(bool isSuccess)
        {
            FingerprintValidationSuccess = isSuccess;
        }
    }
}
