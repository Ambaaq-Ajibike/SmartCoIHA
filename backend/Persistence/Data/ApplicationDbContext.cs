using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Persistence.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<DataRequest> DataRequests { get; set; }
        public DbSet<Patients> Patients { get; set; }
        public DbSet<InstituteBaserUrl> FHIREndpoints { get; set; }
        public DbSet<Institution> Institutions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<InstitutionManager> InstitutionManagers { get; set; }
        public DbSet<FhirResourceStatus> FhirResourceStatuses { get; set; }

    }
}
