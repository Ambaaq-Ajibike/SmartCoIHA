using Application.Repositories.Interfaces;
using Application.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Persistence.Data;
using Persistence.Data.Repositories;
using Persistence.EmailServices;
using Persistence.Messaging;

namespace Persistence
{
    public static class ServiceConfigurationExtension
    {
        public static void AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddSingleton<RabbitMqProducer>();
            services.AddSingleton<RabbitMqConsumer>();


            services.AddScoped<IEmailService, BrevoEmailService>();
        }
    }
}