namespace Application.Dtos.Analytics
{
    public record DashboardSummaryDto(
        int TotalInstitutions,
        int TotalPatients,
        int TotalDataRequests,
        int ActiveEndpoints
    );

    public record InstitutionStatusDistributionDto(
        string Status,
        int Count
    );

    public record AuditLogDto(
        Guid Id,
        string ActionType,
        string EntityName,
        string Timestamp,
        string UserId
    );
}