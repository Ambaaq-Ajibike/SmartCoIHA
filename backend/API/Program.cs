using API.BackgroundServices;
using API.Middlewares;
using Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Persistence;
using Serilog;
using Serilog.Events;
using System.Text;

// 1. Initial Configure Serilog for structured logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

try
{
    Log.Information("Starting web application");

    var builder = WebApplication.CreateBuilder(args);

    // Replace the default standard .NET logging with Serilog
    builder.Host.UseSerilog();

    // 2. Configure OpenTelemetry for Tracing and Metrics
    builder.Services.AddOpenTelemetry()
        .ConfigureResource(resource => resource.AddService("SmartCoIHA.API"))
        .WithTracing(tracing =>
        {
            tracing
                .AddAspNetCoreInstrumentation()     // Traces incoming HTTP requests
                .AddHttpClientInstrumentation()     // Traces outgoing HTTP requests
                .AddEntityFrameworkCoreInstrumentation()
                .AddRedisInstrumentation()          // Traces Redis cache operations
                .AddConsoleExporter();              // Output traces to the console for local dev
        })
        .WithMetrics(metrics =>
        {
            metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddMeter("System.Runtime")        // Collects GC, memory, and CPU metrics
                .AddConsoleExporter();              // Outputs metrics to console
        });

    // Add services to the container.
    builder.Services.AddPersistenceServices(builder.Configuration);
    builder.Services.AddApplicationServices();
    builder.Services.AddHostedService<RabbitMqConsumerService>();
    builder.Services.AddHostedService<FhirValidationConsumerService>();


    // Configure JWT Authentication
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
        };
    });

    builder.Services.AddAuthorization();

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "SmartCoIHA API",
            Version = "v1",
            Description = "API documentation"
        });

        // JWT Authentication
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token below. Example: Bearer {your token}"
        });

        //options.AddSecurityRequirement(new OpenApiSecurityRequirement
        //{
        //    {
        //        new OpenApiSecuritySchemeReference("Bearer")
        //        {

        //            Reference = new OpenApiReferenceWithDescription
        //            {
        //                Type = ReferenceType.SecurityScheme,
        //                Id = "Bearer"
        //            }
        //        },
        //        []
        //    }
        //});

    });

    builder.Services.AddOpenApi();

    var app = builder.Build();

    // Ensure Serilog middleware is added to log HTTP request timelines
    app.UseSerilogRequestLogging();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
