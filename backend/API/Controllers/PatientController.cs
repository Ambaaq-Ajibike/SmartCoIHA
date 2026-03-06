using Application.Dtos;
using Application.Services.Interfaces;
using Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class PatientController(IPatientService _patientService) : ControllerBase
    {

        [HttpPost("register")]
        [ProducesResponseType(typeof(BaseResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(BaseResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] RegisterPatientDto dto)
        {
            var response = await _patientService.RegsiterPatientAsync(dto);

            return response.Success
                ? Ok(response)
                : BadRequest(response);
        }


        [HttpGet("{id}")]
        [ProducesResponseType(typeof(BaseResponse<PatientDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse<PatientDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var response = await _patientService.GetPatientByIdAsync(id);

            return response.Success
                ? Ok(response)
                : NotFound(response);
        }
        [HttpGet]
        [ProducesResponseType(typeof(BaseResponse<PatientDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPatients(
            [FromQuery] string? institutionId = null,
            [FromQuery] VerificationStatus? enrollmentStatus = null)
        {
            var response = await _patientService.GetPatientsAsync(institutionId, enrollmentStatus);
            return Ok(response);
        }

        [HttpPost("fingerprint")]
        [ProducesResponseType(typeof(BaseResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse<bool>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddFingerprint([FromBody] AddFingerprintDto dto)
        {
            var response = await _patientService.AddFingerprintAsync(dto.PatientId, dto.FingerprintTemplate);

            return response.Success
                ? Ok(response)
                : BadRequest(response);
        }
    }
}
