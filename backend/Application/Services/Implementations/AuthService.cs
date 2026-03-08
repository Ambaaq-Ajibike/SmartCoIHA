using Application.Dtos;
using Application.Dtos.Auth;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Application.Validators;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services.Implementations
{
    public class AuthService(
        IGenericRepository<User> userRepository,
        IGenericRepository<Institution> institutionRepository,
        IGenericRepository<InstitutionManager> managerRepository,
        IEmailService emailService,
        IConfiguration configuration) : IAuthService
    {
        public async Task<BaseResponse<AuthResponseDto>> RegisterInstitutionManagerAsync(RegisterInstitutionManagerDto dto)
        {
            var validator = new RegisterInstitutionManagerValidator();
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return new BaseResponse<AuthResponseDto>
                (
                    false,
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)),
                    null
                );
            }

            // Check if user already exists
            var existingUser = await userRepository.GetByExpressionAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (existingUser is not null)
            {
                return new BaseResponse<AuthResponseDto>
                (
                    false,
                    "User with this email already exists",
                    null
                );
            }

            // Check if institution registration ID already exists
            var existingInstitution = await institutionRepository.GetByExpressionAsync(i => i.RegistrationId == dto.InstitutionRegistrationId);
            if (existingInstitution is not null)
            {
                return new BaseResponse<AuthResponseDto>(false, "Institution with this registration ID already exists", null);
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create user
            var user = new User(dto.Email, dto.FullName, passwordHash, Role.InstitutionManager);

            // Generate email verification token
            var verificationToken = GenerateVerificationToken();
            var tokenExpiry = DateTime.UtcNow.AddHours(24);
            user.SetEmailVerificationToken(verificationToken, tokenExpiry);

            await userRepository.AddAsync(user);

            // Create institution
            var institution = new Institution(
                dto.InstitutionName,
                dto.InstitutionAddress,
                dto.InstitutionRegistrationId
            );
            await institutionRepository.AddAsync(institution);

            // Create institution manager link
            var manager = new InstitutionManager(institution.Id, user.Id);
            await managerRepository.AddAsync(manager);

            // Send verification email
            await SendVerificationEmail(user.Email, user.FullName, verificationToken);

            await managerRepository.SaveChangesAsync();
            return new BaseResponse<AuthResponseDto>
            (
                true,
                "Registration successful. Please check your email to verify your account.",
                new AuthResponseDto(
                    string.Empty,
                    user.Email,
                    user.FullName,
                    user.Role.ToString(),
                    false,
                    false,
                    institution.Id,
                    institution.Name
                )
            );
        }

        public async Task<BaseResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            var validator = new LoginValidator();
            var validationResult = await validator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return new BaseResponse<AuthResponseDto>
                (
                    false,
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)),
                    null
                );
            }
            // Find user
            var user = await userRepository.GetByExpressionAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null)
            {
                return new BaseResponse<AuthResponseDto>
                (
                    false,
                    "Invalid email or password",
                    null
                );
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return new BaseResponse<AuthResponseDto>
                (
                    false,
                    "Invalid email or password",
                    null
                );
            }

            // Check if email is verified
            if (!user.IsEmailVerified)
            {
                return new BaseResponse<AuthResponseDto>
                (
                    false,
                    "Please verify your email before logging in",
                    null
                );
            }

            // Get institution manager details
            Institution? institution = null;
            bool isInstitutionVerified = false;

            if (user.Role == Role.InstitutionManager)
            {
                var manager = await managerRepository.GetByExpressionAsync(x => x.UserId == user.Id);

                if (manager == null)
                {
                    return new BaseResponse<AuthResponseDto>
                    (
                        false,
                        "Institution manager profile not found",
                        null
                    );
                }

                institution = await institutionRepository.GetByIdAsync(manager.InstitutionId);
                isInstitutionVerified = institution.VerificationStatus == VerificationStatus.Verified;

                // Check if institution is verified
                if (!isInstitutionVerified)
                {
                    return new BaseResponse<AuthResponseDto>
                    (
                        false,
                        "Your institution is pending verification. You cannot login until it is approved.",
                        null
                    );
                }
            }

            // Update last login
            user.UpdateLastLogin();
            userRepository.Update(user);
            await userRepository.SaveChangesAsync();

            // Generate JWT token
            var token = GenerateJwtToken(user, institution);

            return new BaseResponse<AuthResponseDto>
            (
                true,
                "Login successful",
                new AuthResponseDto(
                    token,
                    user.Email,
                    user.FullName,
                    user.Role.ToString(),
                    user.IsEmailVerified,
                    isInstitutionVerified,
                    institution?.Id,
                    institution?.Name
                )
            );
        }

        public async Task<BaseResponse<string>> VerifyEmailAsync(VerifyEmailDto dto)
        {
            var user = await userRepository.GetByExpressionAsync(u => u.Email.ToLower() == dto.Email.ToLower());

            if (user == null)
            {
                return new BaseResponse<string>
                (
                    false,
                    "User not found",
                    null
                );
            }

            if (user.IsEmailVerified)
            {
                return new BaseResponse<string>
                (
                    false,
                    "Email is already verified",
                    null
                );
            }

            if (!user.IsVerificationTokenValid(dto.Token))
            {
                return new BaseResponse<string>
                (
                    false,
                    "Invalid or expired verification token",
                    null
                );
            }

            user.VerifyEmail();
            userRepository.Update(user);
            await userRepository.SaveChangesAsync();

            return new BaseResponse<string>
            (
                true,
                "Email verified successfully. You can now login after your institution is approved.",
                "Email verified"
            );
        }

        public async Task<BaseResponse<string>> ResendVerificationEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return new BaseResponse<string>
                    (
                        false,
                        "Email is required",
                        null
                    );
            }

            var user = await userRepository.GetByExpressionAsync(u => u.Email.ToLower() == email.ToLower());

            if (user == null)
            {
                return new BaseResponse<string>
                (
                    false,
                    "User not found",
                    null
                );
            }

            if (user.IsEmailVerified)
            {
                return new BaseResponse<string>
                (
                    false,
                    "Email is already verified",
                    null
                );
            }

            // Generate new verification token
            var verificationToken = GenerateVerificationToken();
            var tokenExpiry = DateTime.UtcNow.AddHours(24);
            user.SetEmailVerificationToken(verificationToken, tokenExpiry);

            userRepository.Update(user);
            await userRepository.SaveChangesAsync();

            // Send verification email
            await SendVerificationEmail(user.Email, user.FullName, verificationToken);

            return new BaseResponse<string>
            (
                true,
                 "Verification email sent successfully",
                "Email sent"
            );
        }

        private string GenerateJwtToken(User user, Institution? institution)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.FullName),
                new(ClaimTypes.Role, user.Role.ToString()),
                new("IsEmailVerified", user.IsEmailVerified.ToString())
            };

            if (institution != null)
            {
                claims.Add(new Claim("InstitutionId", institution.Id.ToString()));
                claims.Add(new Claim("InstitutionName", institution.Name));
                claims.Add(new Claim("IsInstitutionVerified", (institution.VerificationStatus == VerificationStatus.Verified).ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(double.Parse(jwtSettings["ExpiryHours"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateVerificationToken()
        {
            var randomBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        private async Task SendVerificationEmail(string email, string fullName, string token)
        {
            var verificationUrl = $"{configuration["AppSettings:FrontendUrl"]}/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";

            var subject = "Verify Your Email - SmartCoIHA";
            var htmlContent = $@"
                <html>
                <body>
                    <h2>Welcome to SmartCoIHA, {fullName}!</h2>
                    <p>Thank you for registering as an Institution Manager.</p>
                    <p>Please verify your email by clicking the link below:</p>
                    <p><a href='{verificationUrl}'>Verify Email</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't register for this account, please ignore this email.</p>
                    <br/>
                    <p>Best regards,<br/>SmartCoIHA Team</p>
                </body>
                </html>";

            await emailService.SendEmailAsync(email, fullName, subject, htmlContent);
        }
    }
}