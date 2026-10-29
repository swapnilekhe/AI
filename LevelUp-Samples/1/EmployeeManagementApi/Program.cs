using EmployeeManagementApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<EmployeeDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("EmployeeDatabase")
        ?? $"Data Source={Path.Combine(builder.Environment.ContentRootPath, "employee-management.db")}"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<EmployeeDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

app.Run();
