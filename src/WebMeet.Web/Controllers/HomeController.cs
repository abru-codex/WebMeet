using Microsoft.AspNetCore.Mvc;

namespace VideoMeeting.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}