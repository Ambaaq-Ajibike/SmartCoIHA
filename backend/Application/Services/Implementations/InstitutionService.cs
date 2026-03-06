using Application.Dtos;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;
using FluentValidation;

namespace Application.Services.Implementations
{
    public class InstitutionService(IGenericRepository<Institution> _institutionRepository) : IInstitutionService
    {

        public async Task<Guid> RegisterInstitutionAsync(RegisterInstitutionDto dto)
        {
            var validator = new RegisterInstitutionValidator();
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var institution = new Institution(dto.Name, dto.Address, dto.RegistrationId);

            var createdInstitution = await _institutionRepository.AddAsync(institution);

            return createdInstitution.Id;
        }

        public async Task<InstitutionDto> GetInstitutionByIdAsync(Guid id)
        {
            var institution = await _institutionRepository.GetByIdAsync(id);

            return institution == null
                ? throw new KeyNotFoundException($"Institution with ID {id} not found.")
                : new InstitutionDto(institution.Id, institution.Name, institution.Address, institution.RegistrationId, institution.VerificationStatus);
        }
    }
}
