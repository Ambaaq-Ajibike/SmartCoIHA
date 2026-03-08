using Application.Dtos;
using Application.Messaging.Interfaces;
using Application.Messaging.Models;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;

namespace Application.Services.Implementations
{
    public class FHIREndpointService(
        IGenericRepository<InstituteBaserUrl> _endpointRepository,
        IGenericRepository<Institution> _institutionRepository,
        IGenericRepository<FhirResourceStatus> _resourceStatusRepository,
        IMessagePublisher _messagePublisher) : IFHIREndpointService
    {
        public async Task<BaseResponse<Guid>> AddEndpointAsync(AddEndPointRequestDto request)
        {
            // Validate request
            var validator = new AddEndpointValidator();
            var validationResult = await validator.ValidateAsync(request);

            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return new BaseResponse<Guid>(false, errors, Guid.Empty);
            }


            // Check if endpoint already exists for this institution
            var institution = await _institutionRepository.GetByIdAsync(request.InstitutionId);

            if (institution is null)
            {
                return new BaseResponse<Guid>(
                    false,
                    "Institution not found.",
                    Guid.Empty);
            }

            var existingEndpoint = await _endpointRepository.GetByExpressionAsync(e => e.InstitutionID == request.InstitutionId);

            // Normalize URL (remove trailing slash)
            var normalizedUrl = request.Url.TrimEnd('/');
            var endpointId = Guid.NewGuid();

            if (existingEndpoint is not null)
            {
                endpointId = existingEndpoint.Id;

                // Remove all existing resource status entries for this endpoint FIRST
                var existingResourceStatuses = await _resourceStatusRepository.GetAllAsync(r => r.InstituteBaseUrlId == endpointId);

                foreach (var resourceStatus in existingResourceStatuses)
                {
                    _resourceStatusRepository.Delete(resourceStatus);
                }

                // Update endpoint URL
                await existingEndpoint.UpdateUrl(normalizedUrl);
                _endpointRepository.Update(existingEndpoint);

                // Save both deletions and endpoint update together
                await _endpointRepository.SaveChangesAsync();
            }
            else
            {
                // Create new endpoint
                var endpoint = new InstituteBaserUrl(normalizedUrl, request.InstitutionId);
                var createdEndpoint = await _endpointRepository.AddAsync(endpoint);
                endpointId = createdEndpoint.Id;

                // Save the new endpoint so it exists before adding resource statuses
                await _endpointRepository.SaveChangesAsync();
            }

            // Create new resource status entries
            foreach (var resourceName in request.SupportedResources.Distinct())
            {
                var resourceStatus = new FhirResourceStatus(resourceName, endpointId);
                await _resourceStatusRepository.AddAsync(resourceStatus);
            }

            // Save the new resource statuses
            await _resourceStatusRepository.SaveChangesAsync();

            // Enqueue validation message to RabbitMQ
            var validationMessage = new FhirEndpointValidationMessage
            {
                EndpointId = endpointId,
                BaseUrl = normalizedUrl,
                SupportedResources = request.SupportedResources.Distinct().ToList(),
                TestingPatientId = request.TestingPatientId
            };

            await _messagePublisher.PublishAsync(validationMessage, "fhir-validation-queue");

            return new BaseResponse<Guid>(
                true,
                "FHIR endpoint upserted successfully. Validation is in progress.",
                endpointId);
        }

        public async Task<BaseResponse<FHIREndpointDto>> GetEndpointByInstitutionIdAsync(Guid institutionId)
        {
            // Validate institution exists
            var institution = await _institutionRepository.GetByIdAsync(institutionId);
            if (institution == null)
            {
                return new BaseResponse<FHIREndpointDto>(
                    false,
                    "Institution not found.",
                    null!);
            }

            // Get endpoint for institution
            var endpoint = await _endpointRepository.GetByExpressionAsync(e => e.InstitutionID == institutionId);

            if (endpoint is null)
            {
                return new BaseResponse<FHIREndpointDto>(
                    false,
                    "No FHIR endpoint found for this institution.",
                    null!);
            }

            // Get resource statuses
            var resourceStatuses = await _resourceStatusRepository.GetAllAsync(r => r.InstituteBaseUrlId == endpoint.Id);

            var resourceDtos = resourceStatuses.Select(r => new ResourceStatusDto(
                r.ResourceName,
                r.IsVerified,
                r.ErrorMessage)).ToList();

            var endpointDto = new FHIREndpointDto(
                endpoint.Id,
                endpoint.Url,
                resourceDtos);

            return new BaseResponse<FHIREndpointDto>(
                true,
                "FHIR endpoint retrieved successfully.",
                endpointDto);
        }
    }
}
