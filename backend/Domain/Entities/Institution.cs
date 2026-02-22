using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Institution(string name, string address)
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; set; } = name ?? throw new ArgumentNullException(nameof(name));
        public string Address { get; set; } = address ?? throw new ArgumentNullException(nameof(address));
        public List<FHIREndpoint> FhirEndpoints { get; private set; } = [];
        public VerificationStatus VerificationStatus { get; private set; } = VerificationStatus.Pending;

        public async Task AddFhirEndpoint(string endpoint, List<string> supportedResource)
        {
            if (string.IsNullOrWhiteSpace(endpoint))
                throw new ArgumentException("Endpoint cannot be null or empty", nameof(endpoint));

            FhirEndpoints.Add(new FHIREndpoint(endpoint, supportedResource));
        }
        public async Task UpdateVerificationStatus(VerificationStatus status)
        {
            VerificationStatus = status;
        }
    }
}
