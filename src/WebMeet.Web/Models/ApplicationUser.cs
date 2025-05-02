using Microsoft.AspNetCore.Identity;

namespace WebMeet.Web.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
    }
}