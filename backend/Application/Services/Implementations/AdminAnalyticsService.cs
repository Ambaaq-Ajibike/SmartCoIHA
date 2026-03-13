using Application.Dtos;
using Application.Dtos.Analytics;
using Application.Repositories.Interfaces;
using Application.Services.Interfaces;

namespace Application.Services.Implementations
{
    public class AdminAnalyticsService(IAdminAnalyticsRepository analyticsRepository) : IAdminAnalyticsService
    {
        public async Task<BaseResponse<DashboardSummaryDto>> GetDashboardSummaryAsync()
        {
            var summary = await analyticsRepository.GetDashboardSummaryAsync();
            return new BaseResponse<DashboardSummaryDto>(true, "Dashboard summary retrieved successfully.", summary);
        }

        public async Task<BaseResponse<IEnumerable<InstitutionStatusDistributionDto>>> GetInstitutionStatusDistributionAsync()
        {
            var distribution = await analyticsRepository.GetInstitutionStatusDistributionAsync();
            return new BaseResponse<IEnumerable<InstitutionStatusDistributionDto>>(true, "Status distribution retrieved.", distribution);
        }

        public async Task<BaseResponse<IEnumerable<AuditLogDto>>> GetRecentAuditLogsAsync(int limit = 50)
        {
            var logs = await analyticsRepository.GetRecentAuditLogsAsync(limit);
            return new BaseResponse<IEnumerable<AuditLogDto>>(true, "Recent audit logs retrieved.", logs);
        }
    }
}