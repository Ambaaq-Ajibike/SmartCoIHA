using Application.Dtos.Analytics;
using Application.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data.Repositories
{
    public class AdminAnalyticsRepository(ApplicationDbContext dbContext) : IAdminAnalyticsRepository
    {
        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var totalInstitutions = await dbContext.Institutions.CountAsync();
            var totalPatients = await dbContext.Patients.CountAsync();
            var totalDataRequests = await dbContext.DataRequests.CountAsync();
            var activeEndpoints = await dbContext.FHIREndpoints.CountAsync();

            return new DashboardSummaryDto(
                totalInstitutions,
                totalPatients,
                totalDataRequests,
                activeEndpoints
            );
        }

        public async Task<IEnumerable<InstitutionStatusDistributionDto>> GetInstitutionStatusDistributionAsync()
        {
            return await dbContext.Institutions
                .GroupBy(i => i.VerificationStatus)
                .Select(g => new InstitutionStatusDistributionDto(
                    g.Key.ToString(),
                    g.Count()
                ))
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLogDto>> GetRecentAuditLogsAsync(int limit = 50)
        {
            return await dbContext.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .Select(a => new AuditLogDto(
                    a.Id,
                    a.ActionType,
                    a.EntityName,
                    a.Timestamp.ToString("o"),
                    a.UserId ?? "UnKnown"
                ))
                .ToListAsync();
        }
    }
}