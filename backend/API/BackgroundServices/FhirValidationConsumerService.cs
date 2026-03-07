using Application.Messaging.Models;
using Application.Services.Implementations;
using Persistence.Messaging;

namespace API.BackgroundServices
{
    public class FhirValidationConsumerService(
        IServiceProvider serviceProvider,
        RabbitMqConsumer _consumer,
        ILogger<FhirValidationConsumerService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("FHIR Validation Consumer Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();

                    var fhirValidationService = scope.ServiceProvider.GetRequiredService<FhirValidationService>();

                    await _consumer.StartAsync<FhirEndpointValidationMessage>(
                        "fhir-validation-queue",
                        async (message) =>
                        {
                            logger.LogInformation(
                                "Processing FHIR validation for endpoint {EndpointId}",
                                message.EndpointId);

                            await fhirValidationService.ValidateEndpointAsync(
                                message.EndpointId,
                                message.BaseUrl,
                                message.SupportedResources,
                                message.TestingPatientId);

                            logger.LogInformation(
                                "Completed FHIR validation for endpoint {EndpointId}",
                                message.EndpointId);
                        });

                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error in FHIR Validation Consumer Service");
                    await System.Threading.Tasks.Task.Delay(5000, stoppingToken);
                }
            }

            logger.LogInformation("FHIR Validation Consumer Service stopped.");
        }
    }
}