namespace Domain.Entities
{
    public class FhirResourceStatus(string resourceName, Guid instituteBaseUrlId)
    {
        public string ResourceName { get; private set; } = resourceName;
        public bool IsVerified { get; private set; } = false;
        public string? ErrorMessage { get; private set; }
        public Guid InsituteBaseUrlId { get; private set; } = instituteBaseUrlId;
        public InstituteBaserUrl InstituteBaseUrl { get; private set; } = null!;

        public void MarkVerified()
        {
            IsVerified = true;
            ErrorMessage = null;
        }

        public void MarkFailed(string error)
        {
            IsVerified = false;
            ErrorMessage = error;
        }
    }
}
