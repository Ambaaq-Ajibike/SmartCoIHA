using Application.Services.Implementations;
using Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Application
{
    public static class ServiceConfigurationExtension
    {
        public static void AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IInstitutionService, InstitutionService>();
            services.AddScoped<IPatientService, PatientService>();
        }
    }
}