using System.Text.Json;
using System.Text.Json.Serialization;
using Carter;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Minerva.Api.Features.Books.Services;
using Minerva.Api.Features.Books.Services.Haiku;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Json;
using Minerva.Api.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new NullableDateTimeJsonConverter());
});

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddCarter();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddDbContext<MinervaDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<BookLookupOptions>(
    builder.Configuration.GetSection(BookLookupOptions.SectionName));
var bookLookupOptions = builder.Configuration
    .GetSection(BookLookupOptions.SectionName)
    .Get<BookLookupOptions>() ?? new BookLookupOptions();
builder.Services.AddHttpClient(BookMetadataHttpClient.Name, client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Minerva/1.0 (personal library app; book-isbn-lookup)");
    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
    client.Timeout = TimeSpan.FromSeconds(bookLookupOptions.RequestTimeoutSeconds);
});
builder.Services.AddHttpClient("CoverProxy", client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Minerva/1.0 (personal library app; cover-proxy)");
    client.DefaultRequestHeaders.Accept.ParseAdd("image/*,*/*");
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddScoped<GoogleBooksService>();
builder.Services.AddScoped<OpenLibraryBooksService>();
builder.Services.AddScoped<IBookLookupService, CompositeBookLookupService>();

builder.Services.Configure<HaikuGenerationOptions>(
    builder.Configuration.GetSection(HaikuGenerationOptions.SectionName));
var haikuOptions = builder.Configuration
    .GetSection(HaikuGenerationOptions.SectionName)
    .Get<HaikuGenerationOptions>() ?? new HaikuGenerationOptions();
var haikuTimeoutSeconds = haikuOptions.Provider.Trim().Equals("Anthropic", StringComparison.OrdinalIgnoreCase)
        || haikuOptions.Provider.Trim().Equals("Claude", StringComparison.OrdinalIgnoreCase)
    ? haikuOptions.Anthropic.RequestTimeoutSeconds
    : haikuOptions.TimeoutSeconds;
builder.Services.AddHttpClient(HaikuHttpClient.Name, client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Minerva/1.0 (personal library app; haiku-generation)");
    client.Timeout = TimeSpan.FromSeconds(haikuTimeoutSeconds);
});
builder.Services.AddScoped<IHaikuGenerationService, HaikuGenerationService>();

var repoRoot = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", ".."));
var imagesPath = builder.Configuration["BookImages:RootPath"]
    ?? Path.Combine(repoRoot, "assets", "images");
Directory.CreateDirectory(imagesPath);
builder.Services.AddSingleton(new BookImageStorageOptions { RootPath = imagesPath });
builder.Services.AddSingleton<BookImageStorage>();

var corsOrigins = (builder.Configuration["Cors:Origins"] ?? "http://localhost:5174")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

static void MapCoverStaticFiles(WebApplication app, string root, string requestPath)
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(root),
        RequestPath = requestPath,
    });
}

MapCoverStaticFiles(app, imagesPath, "/uploads/covers");
MapCoverStaticFiles(app, imagesPath, "/assets/images"); // legacy URLs

app.MapCarter();

app.Run();
