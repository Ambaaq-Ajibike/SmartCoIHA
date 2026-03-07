using Domain.Enums;

namespace Application.Dtos
{
    public record RegisterPatientDto(string Name, string Email, Guid InstitutionId);
    public record PatientDto(string Name, string Email, string Institution, VerificationStatus EnrollmentStatus);
    public record AddFingerprintDto(Guid PatientId, string FingerprintTemplate);


    public record BulkUploadResultDto(
        int TotalRecords,
        int SuccessCount,
        int FailedCount,
        List<string> Errors);
    public record PatientCsvDto(string Name, string Email);
}
