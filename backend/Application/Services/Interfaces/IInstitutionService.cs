using Application.Dtos;

namespace Application.Services.Interfaces
{
    public interface IInstitutionService
    {
        Task<BaseResponse<InstitutionDto>> GetInstitutionByIdAsync(Guid id);
        Task<BaseResponse<IEnumerable<InstitutionDto>>> GetAllInstitutionsAsync();
    }
}
