using Domain.Enums;

namespace Application.Dtos
{
    public record MakeDataRequestDto(Guid RequestingInstitutionId, string PatientId, string ResourceType);
    public record DataRequestDto(string PatientInstituteName, string InstitutePatientId, string ResourceType, bool IsApproved, bool HasExpired);
    public record UpdateApprovalStatusDto(VerificationStatus Status);
    public record VerifyFingerprintDto(string FingerprintTemplate);
}
