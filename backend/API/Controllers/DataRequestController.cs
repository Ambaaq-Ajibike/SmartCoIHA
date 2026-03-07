using Application.Dtos;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class DataRequestController(IDataRequestService _dataRequestService) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(BaseResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(BaseResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> MakeDataRequest([FromBody] MakeDataRequestDto dto)
        {
            var response = await _dataRequestService.MakeDataRequestAsync(dto);

            return response.Success
                ? Ok(response)
                 : BadRequest(response);
        }

        [HttpGet("institution/{institutionId}")]
        [ProducesResponseType(typeof(BaseResponse<IEnumerable<DataRequestDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse<IEnumerable<DataRequestDto>>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetDataRequestsForInstitution(Guid institutionId)
        {
            var response = await _dataRequestService.GetDataRequestsForInstitutionAsync(institutionId);

            return response.Success
                ? Ok(response)
                : NotFound(response);
        }

        [HttpPut("{requestId}/approval-status")]
        [ProducesResponseType(typeof(BaseResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse<bool>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateApprovalStatus(
            Guid requestId,
            [FromBody] UpdateApprovalStatusDto dto)
        {
            var response = await _dataRequestService.UpdateInstitutionApprovalStatusAsync(requestId, dto.Status);

            return response.Success
                ? Ok(response)
                : BadRequest(response);
        }

        [HttpPost("{requestId}/verify-fingerprint/{patientId}")]
        [ProducesResponseType(typeof(BaseResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(BaseResponse<bool>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> VerifyPatientFingerprint(
            Guid requestId,
            Guid patientId,
            [FromBody] VerifyFingerprintDto dto)
        {
            var response = await _dataRequestService.VerifyPatientFingerprintAsync(
                requestId,
                patientId,
                dto.FingerprintTemplate);

            return response.Success
                ? Ok(response)
                : BadRequest(response);
        }
    }
}