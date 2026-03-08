using Application.Dtos;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;
using Domain.Enums;
using Hl7.Fhir.Model;
using Hl7.Fhir.Rest;

namespace Application.Services.Implementations
{
    public class DataRequestService(
        IGenericRepository<DataRequest> _dataRequestRepository,
        IGenericRepository<Patients> _patientRepository,
        IGenericRepository<InstituteBaserUrl> _endpointRepository,
        IGenericRepository<Institution> _institutionRepository,
        ICacheService _cacheService) : IDataRequestService
    {
        public async Task<BaseResponse<Guid>> MakeDataRequestAsync(MakeDataRequestDto dataRequestDto)
        {
            // Validate using FluentValidation
            var validator = new MakeDataRequestValidator();
            var validationResult = await validator.ValidateAsync(dataRequestDto);

            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return new BaseResponse<Guid>(false, errors, Guid.Empty);
            }


            // Validate requesting institution exists
            var requestingInstitution = await _institutionRepository.GetByIdAsync(dataRequestDto.RequestingInstitutionId);
            if (requestingInstitution == null)
            {
                return new BaseResponse<Guid>(
                    false,
                    "Requesting institution not found.",
                    Guid.Empty);
            }

            // Validate patient exists
            var patient = await _patientRepository.GetByExpressionAsync(x => x.InstitutePatientId == dataRequestDto.InstitutePatientId);
            if (patient == null)
            {
                return new BaseResponse<Guid>(
                    false,
                    "Patient not found.",
                    Guid.Empty);
            }

            // Validate patient is enrolled and verified
            if (patient.EnrollmentStatus != VerificationStatus.Verified)
            {
                return new BaseResponse<Guid>(
                    false,
                    "Patient enrollment is not verified. Data request cannot be made. Download the app to verify patient",
                    Guid.Empty);
            }

            // Create data request
            var dataRequest = new DataRequest(
                dataRequestDto.RequestingInstitutionId,
                dataRequestDto.InstitutePatientId,
                dataRequestDto.ResourceType);

            var createdRequest = await _dataRequestRepository.AddAsync(dataRequest);
            await _dataRequestRepository.SaveChangesAsync();

            return new BaseResponse<Guid>(
                true,
                "Data request created successfully. Awaiting institution approval and patient fingerprint verification.",
                createdRequest.Id);
        }

        public async Task<BaseResponse<IEnumerable<DataRequestDto>>> GetDataRequestsForInstitutionAsync(Guid institutionId)
        {
            // Validate institution exists
            var institution = await _institutionRepository.GetByIdAsync(institutionId);
            if (institution == null)
            {
                return new BaseResponse<IEnumerable<DataRequestDto>>(
                    false,
                    $"Institution not found.",
                    []);
            }

            // Get all data requests where patients belong to this institution
            var allRequests = await _dataRequestRepository.GetAllAsync(dr => dr.RequestingInstitutionId == institutionId);

            var requestDtos = new List<DataRequestDto>();

            foreach (var request in allRequests)
            {
                var patient = await _patientRepository.GetByExpressionAsync(p => p.InstitutePatientId.ToLower() == request.InstitutePatientId.ToLower());

                // Filter requests for patients belonging to this institution
                if (patient != null && patient.InstitutionID == institutionId)
                {
                    var requestingInstitution = await _institutionRepository.GetByIdAsync(request.RequestingInstitutionId);

                    var dto = new DataRequestDto(
                        requestingInstitution?.Name ?? "Unknown Institution",
                        request.InstitutePatientId,
                        request.ResourceType,
                        request.IsApproved(),
                        request.IsExpired());

                    requestDtos.Add(dto);
                }
            }

            if (requestDtos.Count == 0)
            {
                return new BaseResponse<IEnumerable<DataRequestDto>>(
                    true,
                    "No data requests found for this institution.",
                    []);
            }

            return new BaseResponse<IEnumerable<DataRequestDto>>(
                true,
                $"{requestDtos.Count} data request(s) retrieved successfully.",
                requestDtos);
        }

        public async Task<BaseResponse<bool>> UpdateInstitutionApprovalStatusAsync(Guid requestId, VerificationStatus newStatus)
        {
            // Validate status
            if (newStatus != VerificationStatus.Verified && newStatus != VerificationStatus.Denied)
            {
                return new BaseResponse<bool>(
                    false,
                    "Invalid status. Only 'Verified' or 'Rejected' statuses are allowed.",
                    false);
            }

            // Get data request
            var dataRequest = await _dataRequestRepository.GetByIdAsync(requestId);
            if (dataRequest == null)
            {
                return new BaseResponse<bool>(
                    false,
                    $"Data request not found.",
                    false);
            }

            // Check if request is expired
            if (dataRequest.IsExpired())
            {
                return new BaseResponse<bool>(
                    false,
                    "Data request has expired and cannot be updated.",
                    false);
            }

            // Update approval status
            await dataRequest.UpdateInstitutionApprovalStatus(newStatus);
            _dataRequestRepository.Update(dataRequest);
            await _dataRequestRepository.SaveChangesAsync();

            var statusText = newStatus == VerificationStatus.Verified ? "approved" : "rejected";
            return new BaseResponse<bool>(
                true,
                $"Data request {statusText} successfully.",
                true);
        }

        public async Task<BaseResponse<bool>> VerifyPatientFingerprintAsync(Guid requestId, string institutePatientId, string fingerprintTemplate)
        {
            // Validate fingerprint template
            if (string.IsNullOrWhiteSpace(fingerprintTemplate))
            {
                return new BaseResponse<bool>(
                    false,
                    "Fingerprint template is required.",
                    false);
            }

            // Get data request
            var dataRequest = await _dataRequestRepository.GetByIdAsync(requestId);
            if (dataRequest == null)
            {
                return new BaseResponse<bool>(
                    false,
                    "Data request not found.",
                    false);
            }

            // Check if request is expired
            if (dataRequest.IsExpired())
            {
                return new BaseResponse<bool>(
                    false,
                    "Data request has expired. Fingerprint verification not allowed.",
                    false);
            }


            // Get patient
            var patient = await _patientRepository.GetByExpressionAsync(p => p.InstitutePatientId.ToLower() == institutePatientId);
            if (patient == null)
            {
                return new BaseResponse<bool>(
                    false,
                    "Patient not found.",
                    false);
            }
            // Validate patient ID matches request
            if (dataRequest.InstitutePatientId != patient.InstitutePatientId)
            {
                return new BaseResponse<bool>(
                    false,
                    "Patient ID does not match the data request.",
                    false);
            }

            // Check if patient has fingerprint registered
            if (string.IsNullOrWhiteSpace(patient.FingerPrint))
            {
                return new BaseResponse<bool>(
                    false,
                    "Patient does not have a registered fingerprint. Please register fingerprint first.",
                    false);
            }

            // Verify the fingerprint template against stored hash
            bool isValid = PatientService.VerifyFingerprintTemplate(
                fingerprintTemplate,
                patient.FingerPrint,
                patient.ID);

            if (!isValid)
            {
                return new BaseResponse<bool>(
                    false,
                    "Fingerprint verification failed. The provided fingerprint does not match the registered fingerprint.",
                    false);
            }

            // Update fingerprint validation result
            await dataRequest.UpdateFingerprintValidationResult(true);
            _dataRequestRepository.Update(dataRequest);
            await _dataRequestRepository.SaveChangesAsync();

            return new BaseResponse<bool>(
                true,
                "Patient fingerprint verified successfully. Data request is now approved for access.",
                true);
        }

        public async Task<BaseResponse<Resource>> GetPatientResourceDataAsync(Guid requestId)
        {
            // Get data request
            var dataRequest = await _dataRequestRepository.GetByIdAsync(requestId);
            if (dataRequest == null)
            {
                return new BaseResponse<Resource>(
                    false,
                    "Data request not found.",
                    null);
            }

            // Check if request has expired
            if (dataRequest.IsExpired())
            {
                return new BaseResponse<Resource>(
                    false,
                    "Data request has expired. Please create a new request.",
                    null);
            }

            // Check if institution has approved the request
            if (dataRequest.InstitutionApprovedStatus != VerificationStatus.Verified)
            {
                var statusMessage = dataRequest.InstitutionApprovedStatus == VerificationStatus.Denied
                    ? "Data request was rejected by the institution."
                    : "Data request is pending institution approval.";

                return new BaseResponse<Resource>(
                    false,
                    statusMessage,
                    null);
            }

            // Check if patient fingerprint has been validated
            if (!dataRequest.FingerprintValidationSuccess)
            {
                return new BaseResponse<Resource>(
                    false,
                    "Patient fingerprint validation is required before accessing data.",
                    null);
            }

            var patient = await _patientRepository.GetByExpressionAsync(p => p.InstitutePatientId == dataRequest.InstitutePatientId);
            if (patient == null)
            {
                return new BaseResponse<Resource>(
                    false,
                    "Patient not found.",
                    null);
            }

            // Get patient's institution to retrieve FHIR endpoint
            var institution = await _institutionRepository.GetByIdAsync(patient.InstitutionID);
            if (institution == null)
            {
                return new BaseResponse<Resource>(
                    false,
                    "Patient's institution not found.",
                    null);
            }

            // Generate cache key based on patient ID and resource type
            var cacheKey = $"fhir_resource:{dataRequest.InstitutePatientId}:{dataRequest.ResourceType.ToLower()}";

            // Check if data exists in cache
            var cachedResource = await _cacheService.GetAsync<Resource>(cacheKey);
            if (cachedResource != null)
            {
                return new BaseResponse<Resource>(
                    true,
                    "Patient resource data retrieved successfully from cache.",
                    cachedResource);
            }

            // Get FHIR endpoint for the institution
            var (IsSuccess, BaseUrl, ErrorMessage) = await GetInstitutionFhirEndpointAsync(patient.InstitutionID);
            if (!IsSuccess)
            {
                return new BaseResponse<Resource>(
                    false,
                    ErrorMessage!,
                    null);
            }

            // Fetch resource data from FHIR endpoint
            try
            {
                var resourceData = await FetchFhirResourceDataAsync(
                    BaseUrl!,
                    dataRequest.ResourceType,
                    dataRequest.InstitutePatientId);

                if (resourceData is null)
                {
                    return new BaseResponse<Resource>(
                        false,
                        $"No {dataRequest.ResourceType} data found for the patient.",
                       null);
                }

                // Cache the resource data for 2 hours
                var cacheExpiration = TimeSpan.FromHours(2);
                await _cacheService.SetAsync(cacheKey, resourceData, cacheExpiration);

                return new BaseResponse<Resource>(
                    true,
                    "Patient resource data retrieved successfully.",
                    resourceData);
            }
            catch (Exception ex)
            {
                return new BaseResponse<Resource>(
                    false,
                    $"Error retrieving data from FHIR endpoint: {ex.Message}",
                    null);
            }
        }

        private async Task<(bool IsSuccess, string? BaseUrl, string? ErrorMessage)> GetInstitutionFhirEndpointAsync(Guid institutionId)
        {

            var endpoint = await _endpointRepository.GetByExpressionAsync(e =>
                e.InstitutionID == institutionId &&
                e.VerificationStatus == VerificationStatus.Verified);

            if (endpoint is null)
            {
                return (false, null, "No verified FHIR endpoint found for the patient's institution.");
            }

            return (true, endpoint.Url, null);
        }

        private static async Task<Resource> FetchFhirResourceDataAsync(
            string baseUrl,
            string resourceType,
            string patientId)
        {
            var settings = new FhirClientSettings
            {
                Timeout = 30000, // 30 seconds
                PreferredFormat = ResourceFormat.Json,
                VerifyFhirVersion = false
            };

            var client = new FhirClient(baseUrl, settings);

            // Fetch data based on resource type
            var resourceData = resourceType.ToLower() switch
            {
                "patient" => await FetchPatientDataAsync(client, patientId),
                "observation" => await FetchObservationDataAsync(client, patientId),
                "condition" => await FetchConditionDataAsync(client, patientId),
                "medicationrequest" => await FetchMedicationRequestDataAsync(client, patientId),
                "diagnosticreport" => await FetchDiagnosticReportDataAsync(client, patientId),
                "procedure" => await FetchProcedureDataAsync(client, patientId),
                "encounter" => await FetchEncounterDataAsync(client, patientId),
                "allergyintolerance" => await FetchAllergyIntoleranceDataAsync(client, patientId),
                "immunization" => await FetchImmunizationDataAsync(client, patientId),
                "careplan" => await FetchCarePlanDataAsync(client, patientId),
                "goal" => await FetchGoalDataAsync(client, patientId),
                "documentreference" => await FetchDocumentReferenceDataAsync(client, patientId),
                _ => await FetchGenericResourceDataAsync(client, resourceType, patientId)
            };

            return resourceData;
        }

        private static async Task<Patient> FetchPatientDataAsync(FhirClient client, string patientId)
        {
            var patient = await client.ReadAsync<Patient>($"Patient/{patientId}");
            return patient;
        }

        private static async Task<Bundle> FetchObservationDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<Observation>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchConditionDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<Condition>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchMedicationRequestDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<MedicationRequest>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchDiagnosticReportDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<DiagnosticReport>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchProcedureDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<Procedure>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchEncounterDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<Encounter>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchAllergyIntoleranceDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<AllergyIntolerance>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchImmunizationDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<Immunization>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchCarePlanDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<CarePlan>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchGoalDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<Goal>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Bundle> FetchDocumentReferenceDataAsync(FhirClient client, string patientId)
        {
            var bundle = await client.SearchAsync<DocumentReference>([$"patient={patientId}", "_count=100"]);
            return bundle;
        }

        private static async Task<Resource> FetchGenericResourceDataAsync(FhirClient client, string resourceType, string patientId)
        {
            var url = $"{resourceType}?patient={patientId}&_count=100";
            var result = await client.GetAsync(url);
            return result;
        }
    }
}
