# Employee Management API

ASP.NET Core Web API with EF Core and SQLite persistence.

## Run

```powershell
dotnet run --urls http://localhost:5080
```

The SQLite database is created as `employee-management.db` in the project directory on first run. In Development, the OpenAPI document is available at `/openapi/v1.json`.

## Endpoints

| Method | Route | Success response |
| --- | --- | --- |
| GET | `/api/employees` | `200 OK` with employees |
| GET | `/api/employees/{id}` | `200 OK` or `404 Not Found` |
| POST | `/api/employees` | `201 Created` with a `Location` header |
| PUT | `/api/employees/{id}` | `204 No Content` or `404 Not Found` |
| DELETE | `/api/employees/{id}` | `204 No Content` or `404 Not Found` |

Invalid request data returns `400 Bad Request`. Email addresses are unique, and duplicates return `409 Conflict`.