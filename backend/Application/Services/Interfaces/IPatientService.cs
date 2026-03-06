using Application.Dtos;
using Domain.Enums;

namespace Application.Services.Interfaces
{
    public interface IPatientService
    {
        Task<BaseResponse<Guid>> RegsiterPatientAsync(RegisterPatientDto patientDto);
        Task<BaseResponse<PatientDto>> GetPatientByIdAsync(Guid patientId);
        Task<BaseResponse<PatientDto>> GetPatientsAsync(string? institutionId, VerificationStatus? enrollmentStatus);
        Task<BaseResponse<bool>> AddFingerprintAsync(Guid patientId, string fingerprintTemplate);
    }
}
