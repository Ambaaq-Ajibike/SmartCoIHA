namespace Application.Dtos
{
    public record RegisterInstitutionDto(string Name, string Address, string RegistrationId);
    public record InstitutionDto(Guid Id, string Name, string Address, string RegistrationId, string Status);
}
