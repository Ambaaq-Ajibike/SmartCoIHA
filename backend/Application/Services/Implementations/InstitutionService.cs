using Application.Dtos;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services.Implementations
{
    public class InstitutionService(IGenericRepository<Institution> _institutionRepository) : IInstitutionService
    {

        public async Task<BaseResponse<InstitutionDto>> GetInstitutionByIdAsync(Guid id)
        {
            var institution = await _institutionRepository.GetByIdAsync(id);

            if (institution == null)
            {
                return new BaseResponse<InstitutionDto>(false, $"Institution with ID {id} not found.", null!);
            }

            var institutionDto = new InstitutionDto(
                institution.Id,
                institution.Name,
                institution.Address,
                institution.RegistrationId,
                institution.VerificationStatus.ToString());

            return new BaseResponse<InstitutionDto>(true, "Institution retrieved successfully.", institutionDto);
        }

        public async Task<BaseResponse<IEnumerable<InstitutionDto>>> GetAllInstitutionsAsync()
        {
            var institutions = await _institutionRepository.GetAllAsync(i => true);

            if (!institutions.Any())
            {
                return new BaseResponse<IEnumerable<InstitutionDto>>(
                    true,
                    "No institutions found.",
                    []);
            }

            var institutionDtos = institutions.Select(institution => new InstitutionDto(
                institution.Id,
                institution.Name,
                institution.Address,
                institution.RegistrationId,
                institution.VerificationStatus.ToString()));

            return new BaseResponse<IEnumerable<InstitutionDto>>(
                true,
                "Institutions retrieved successfully.",
                institutionDtos);
        }

        public async Task<BaseResponse<bool>> UpdateInstitutionStatusAsync(Guid id, VerificationStatus status)
        {
            var institution = await _institutionRepository.GetByIdAsync(id);
            if (institution == null)
            {
                return new BaseResponse<bool>(false, $"Institution not found.", false);
            }

            institution.UpdateVerificationStatus(status);

            _institutionRepository.Update(institution);
            await _institutionRepository.SaveChangesAsync();

            return new BaseResponse<bool>(true, "Institution status updated successfully.", true);
        }
    }
}
