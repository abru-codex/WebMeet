using Microsoft.AspNetCore.Identity;

namespace VideoMeeting.Web.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }
    }
}