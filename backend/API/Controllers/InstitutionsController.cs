using Application.Dtos;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    /// <summary>
    /// Controller for managing healthcare institutions
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class InstitutionsController(IInstitutionService _institutionService) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register(RegisterInstitutionDto dto)
        {
            var id = await _institutionService.RegisterInstitutionAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(InstitutionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var institution = await _institutionService.GetInstitutionByIdAsync(id);
            return institution != null ? Ok(institution) : NotFound();
        }
    }
}
