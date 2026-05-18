using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Minerva.Api.Infrastructure.Data;

public class MinervaDbContextFactory : IDesignTimeDbContextFactory<MinervaDbContext>
{
    public MinervaDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        var options = new DbContextOptionsBuilder<MinervaDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new MinervaDbContext(options);
    }
}
