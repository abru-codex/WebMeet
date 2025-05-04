using System.ComponentModel.DataAnnotations;

namespace WebMeet.Web.Models.ViewModels;

public class RegisterViewModel
{
    [Required(ErrorMessage = "Name is required")]
    public string Name { get; set; } = default!;
    
    [Required(ErrorMessage = "Email is required")]
    public string Email { get; set; } = default!;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = default!;

    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    [Required(ErrorMessage = "Confirm Password is required")]
    public string ConfirmPassword { get; set; } = default!;

}
