using Application.Dtos;

namespace Application.Services.Interfaces
{
    public interface IInstitutionService
    {
        Task<BaseResponse<Guid>> RegisterInstitutionAsync(RegisterInstitutionDto dto);
        Task<BaseResponse<InstitutionDto>> GetInstitutionByIdAsync(Guid id);
        Task<BaseResponse<IEnumerable<InstitutionDto>>> GetAllInstitutionsAsync();
    }
}
