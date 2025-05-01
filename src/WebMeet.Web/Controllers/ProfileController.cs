using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace VideoMeeting.Web.Controllers
{
    [Authorize]
    public class ProfileController : Controller
    {
        // GET: Profile
        public async Task<IActionResult> Index()
        {
            // Logic to retrieve and display user profile information
            return View();
        }
    }
}