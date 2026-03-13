using Application.Dtos.Analytics;

namespace Application.Repositories.Interfaces
{
    public interface IAdminAnalyticsRepository
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync();
        Task<IEnumerable<InstitutionStatusDistributionDto>> GetInstitutionStatusDistributionAsync();
        Task<IEnumerable<AuditLogDto>> GetRecentAuditLogsAsync(int limit = 20);
    }
}