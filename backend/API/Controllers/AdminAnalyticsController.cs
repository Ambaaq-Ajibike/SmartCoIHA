using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Recommend enabling this to restrict access to Admins only
    public class AdminAnalyticsController(IAdminAnalyticsService _adminAnalyticsService) : ControllerBase
    {
        /// <summary>
        /// Retrieves high-level KPI metrics for the Admin Dashboard
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var response = await _adminAnalyticsService.GetDashboardSummaryAsync();

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Retrieves the breakdown of institutions by their verification status
        /// </summary>
        [HttpGet("institutions/status-distribution")]
        public async Task<IActionResult> GetInstitutionStatusDistribution()
        {
            var response = await _adminAnalyticsService.GetInstitutionStatusDistributionAsync();

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Retrieves the most recent system audit logs
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int limit = 50)
        {
            // Safeguard against querying too many records at once
            if (limit > 500) limit = 500;

            var response = await _adminAnalyticsService.GetRecentAuditLogsAsync(limit);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}