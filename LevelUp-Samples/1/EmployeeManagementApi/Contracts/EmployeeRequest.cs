using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementApi.Contracts;

public sealed class EmployeeRequest
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Department { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [Required]
    public DateTime? DateOfJoining { get; set; }

    [Range(typeof(decimal), "0.01", "999999999.99")]
    public decimal Salary { get; set; }
}