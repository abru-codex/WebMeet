using Microsoft.AspNetCore.Mvc;

namespace WebMeet.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}