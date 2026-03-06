using Application.Dtos;

namespace Application.Services.Interfaces
{
    public interface IInstitutionService
    {
        Task<Guid> RegisterInstitutionAsync(RegisterInstitutionDto dto);
        Task<InstitutionDto> GetInstitutionByIdAsync(Guid id);
    }
}
