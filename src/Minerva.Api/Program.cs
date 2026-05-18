using System.Text.Json;
using System.Text.Json.Serialization;
using Carter;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Minerva.Api.Features.Books.Services;
using Minerva.Api.Infrastructure.Data;
using Minerva.Api.Infrastructure.Json;

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

builder.Services.AddHttpClient(BookMetadataHttpClient.Name, client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Minerva/1.0 (personal library app; book-isbn-lookup)");
    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddScoped<GoogleBooksService>();
builder.Services.AddScoped<OpenLibraryBooksService>();
builder.Services.AddScoped<IBookLookupService, CompositeBookLookupService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5174")
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
app.MapCarter();

app.Run();
