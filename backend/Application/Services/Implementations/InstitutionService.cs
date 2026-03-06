using Application.Dtos;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;

namespace Application.Services.Implementations
{
    public class InstitutionService(IGenericRepository<Institution> _institutionRepository) : IInstitutionService
    {

        public async Task<BaseResponse<Guid>> RegisterInstitutionAsync(RegisterInstitutionDto dto)
        {
            var validator = new RegisterInstitutionValidator();
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return new BaseResponse<Guid>(false, errors, Guid.Empty);
            }

            var institution = new Institution(dto.Name, dto.Address, dto.RegistrationId);

            var createdInstitution = await _institutionRepository.AddAsync(institution);
            await _institutionRepository.SaveChangesAsync();

            return new BaseResponse<Guid>(true, "Institution registered successfully.", createdInstitution.Id);
        }

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
                $"{institutions.Count} institution(s) retrieved successfully.",
                institutionDtos);
        }
    }
}
