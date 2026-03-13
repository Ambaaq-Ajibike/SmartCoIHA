using Application.Dtos;
using Application.Dtos.Analytics;

namespace Application.Services.Interfaces
{
    public interface IAdminAnalyticsService
    {
        Task<BaseResponse<DashboardSummaryDto>> GetDashboardSummaryAsync();
        Task<BaseResponse<IEnumerable<InstitutionStatusDistributionDto>>> GetInstitutionStatusDistributionAsync();
        Task<BaseResponse<IEnumerable<AuditLogDto>>> GetRecentAuditLogsAsync(int limit = 50);
    }
}