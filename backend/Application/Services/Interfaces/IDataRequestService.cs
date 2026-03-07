using Application.Dtos;
using Domain.Enums;
using Hl7.Fhir.Model;

namespace Application.Services.Interfaces
{
    public interface IDataRequestService
    {
        Task<BaseResponse<Guid>> MakeDataRequestAsync(MakeDataRequestDto dataRequestDto);
        Task<BaseResponse<IEnumerable<DataRequestDto>>> GetDataRequestsForInstitutionAsync(Guid institutionId);
        Task<BaseResponse<bool>> UpdateInstitutionApprovalStatusAsync(Guid requestId, VerificationStatus newStatus);
        Task<BaseResponse<bool>> VerifyPatientFingerprintAsync(Guid requestId, Guid patientId, string FingerprintTemplate);
        Task<BaseResponse<Resource>> GetPatientResourceDataAsync(Guid requestId);
    }
}
