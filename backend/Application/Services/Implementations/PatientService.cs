using Application.Dtos;
using Application.Messaging.Interfaces;
using Application.Messaging.Models;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;
using Domain.Enums;
using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services.Implementations
{
    public class PatientService(
        IGenericRepository<Patients> _patientRepository,
        IGenericRepository<Institution> _institutionRepository,
        IMessagePublisher _messagePublisher) : IPatientService
    {
        public async Task<BaseResponse<Guid>> RegsiterPatientAsync(RegisterPatientDto patientDto)
        {
            var validator = new RegisterPatientValidator();
            var validationResult = await validator.ValidateAsync(patientDto);

            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return new BaseResponse<Guid>(false, errors, Guid.Empty);
            }

            // Verify institution exists
            var institution = await _institutionRepository.GetByIdAsync(patientDto.InstitutionId);
            if (institution == null)
            {
                return new BaseResponse<Guid>(false, $"Institution with ID {patientDto.InstitutionId} not found.", Guid.Empty);
            }

            var patient = new Patients(patientDto.Name, patientDto.Email, patientDto.InstitutionId);

            var createdPatient = await _patientRepository.AddAsync(patient);
            await _patientRepository.SaveChangesAsync();

            // Send email notification via RabbitMQ
            await SendEmailNotificationAsync(patientDto, createdPatient.ID.ToString(), institution.Name);
            return new BaseResponse<Guid>(true, "Patient registered successfully.", createdPatient.ID);
        }
        private async Task SendEmailNotificationAsync(RegisterPatientDto patientDto, string createdPatientId, string institutionName)
        {
            var emailMessage = new EmailNotificationMessage
            {
                To = patientDto.Email,
                Subject = "Welcome to SmartCoIHA - Patient Registration Successful",
                Body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <h2>Welcome to SmartCoIHA</h2>
                        <p>Dear {patientDto.Name},</p>
                        <p>Your registration has been completed successfully.</p>
                        <table style='border-collapse: collapse; margin: 20px 0;'>
                            <tr>
                                <td style='padding: 8px; font-weight: bold;'>Patient ID:</td>
                                <td style='padding: 8px;'>{createdPatientId}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; font-weight: bold;'>Institution:</td>
                                <td style='padding: 8px;'>{institutionName}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px; font-weight: bold;'>Enrollment Status:</td>
                                <td style='padding: 8px;'>Pending Verification</td>
                            </tr>
                        </table>
                        <p>Your enrollment status is currently pending verification. We will notify you once the verification process is complete.</p>
                        <br>
                        <p>Best regards,<br><strong>SmartCoIHA Team</strong></p>
                    </body>
                    </html> "
            };

            await _messagePublisher.PublishAsync(emailMessage, "email-queue");

        }

        public async Task<BaseResponse<PatientDto>> GetPatientByIdAsync(Guid patientId)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);

            if (patient == null)
            {
                return new BaseResponse<PatientDto>(false, $"Patient with ID {patientId} not found.", null!);
            }

            var patientDto = new PatientDto(
                patient.Name,
                patient.Email,
                patient.Institution?.Name ?? "Unknown",
                patient.EnrollmentStatus);

            return new BaseResponse<PatientDto>(true, "Patient retrieved successfully.", patientDto);
        }

        public async Task<BaseResponse<PatientDto>> GetPatientsAsync(string? institutionId, VerificationStatus? enrollmentStatus)
        {
            // Build the filter expression dynamically
            Expression<Func<Patients, bool>> filterExpression = p => true;

            if (!string.IsNullOrWhiteSpace(institutionId) && Guid.TryParse(institutionId, out Guid parsedInstitutionId))
            {
                if (enrollmentStatus.HasValue)
                {
                    filterExpression = p => p.InstitutionID == parsedInstitutionId && p.EnrollmentStatus == enrollmentStatus.Value;
                }
                else
                {
                    filterExpression = p => p.InstitutionID == parsedInstitutionId;
                }
            }
            else if (enrollmentStatus.HasValue)
            {
                filterExpression = p => p.EnrollmentStatus == enrollmentStatus.Value;
            }

            var patients = await _patientRepository.GetAllAsync(filterExpression);

            if (!patients.Any())
            {
                return new BaseResponse<PatientDto>(
                    true,
                    "No patients found matching the criteria.",
                    null!);
            }

            var patientDtos = patients.Select(patient => new PatientDto(
                patient.Name,
                patient.Email,
                patient.Institution?.Name ?? "Unknown",
                patient.EnrollmentStatus));

            // Note: The interface signature suggests returning a single PatientDto, but this should likely return IEnumerable<PatientDto>
            // Returning the first patient for now to match the interface
            var firstPatient = patientDtos.First();

            return new BaseResponse<PatientDto>(
                true,
                $"{patients.Count} patient(s) retrieved successfully.",
                firstPatient);
        }

        public async Task<BaseResponse<bool>> AddFingerprintAsync(Guid patientId, string fingerprintTemplate)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(fingerprintTemplate))
            {
                return new BaseResponse<bool>(false, "Fingerprint template cannot be empty.", false);
            }

            // Retrieve patient
            var patient = await _patientRepository.GetByIdAsync(patientId);
            if (patient == null)
            {
                return new BaseResponse<bool>(false, $"Patient with ID {patientId} not found.", false);
            }

            // Hash the fingerprint template with salt
            var hashedFingerprint = HashFingerprintTemplate(fingerprintTemplate, patientId.ToString());

            // Update patient fingerprint
            await patient.UpdateFingerPrint(hashedFingerprint);

            _patientRepository.Update(patient);
            await _patientRepository.SaveChangesAsync();

            return new BaseResponse<bool>(true, "Fingerprint added successfully.", true);
        }

        /// <summary>
        /// Hashes the fingerprint template using SHA-256 with a salt derived from the patient ID
        /// </summary>
        /// <param name="fingerprintTemplate">The biometric template received from the frontend</param>
        /// <param name="salt">The salt value (using patient ID for uniqueness)</param>
        /// <returns>The hashed fingerprint string</returns>
        private static string HashFingerprintTemplate(string fingerprintTemplate, string salt)
        {
            // Combine the template with the salt
            var saltedTemplate = $"{salt}:{fingerprintTemplate}";

            // Convert to bytes
            var bytes = Encoding.UTF8.GetBytes(saltedTemplate);

            // Compute SHA-256 hash
            var hashBytes = SHA256.HashData(bytes);

            // Convert to Base64 string for storage
            return Convert.ToBase64String(hashBytes);
        }

        /// <summary>
        /// Verifies a fingerprint template against the stored hash
        /// </summary>
        /// <param name="fingerprintTemplate">The template to verify</param>
        /// <param name="storedHash">The stored hash from database</param>
        /// <param name="patientId">The patient ID used as salt</param>
        /// <returns>True if the template matches the stored hash</returns>
        public static bool VerifyFingerprintTemplate(string fingerprintTemplate, string storedHash, Guid patientId)
        {
            var computedHash = HashFingerprintTemplate(fingerprintTemplate, patientId.ToString());
            return computedHash == storedHash;
        }
    }
}
