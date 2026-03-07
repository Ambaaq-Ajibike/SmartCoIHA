using Application.Dtos;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services.Implementations
{
    public class DataRequestService(
        IGenericRepository<DataRequest> _dataRequestRepository,
        IGenericRepository<Patients> _patientRepository,
        IGenericRepository<Institution> _institutionRepository) : IDataRequestService
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
            var patient = await _patientRepository.GetByExpressionAsync(x => x.InstitutePatientId == dataRequestDto.PatientId);
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
                dataRequestDto.PatientId,
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

        public async Task<BaseResponse<bool>> VerifyPatientFingerprintAsync(Guid requestId, Guid patientId, string fingerprintTemplate)
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
            var patient = await _patientRepository.GetByIdAsync(patientId);
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
                patientId);

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

    }
}
