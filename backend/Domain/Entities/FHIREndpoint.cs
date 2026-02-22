using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class FHIREndpoint(string url, List<string> supportedResponse)
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Url { get; set; } = url ?? throw new ArgumentNullException(nameof(url));
        public List<string> SupportedResources { get; private set; } = supportedResponse;
        public VerificationStatus VerificationStatus { get; private set; } = VerificationStatus.Pending;

        public async Task AddSupportedResource(string resource)
        {
            if (string.IsNullOrWhiteSpace(resource))
                throw new ArgumentException("Resource cannot be null or empty", nameof(resource));

            SupportedResources.Add(resource);
        }
        public async Task UpdateVerificationStatus(VerificationStatus status)
        {
            VerificationStatus = status;
        }
    }
}
