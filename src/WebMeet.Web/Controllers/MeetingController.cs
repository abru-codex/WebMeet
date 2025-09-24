using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebMeet.Web.Models.ViewModels;
using WebMeet.Web.Services;

namespace WebMeet.Web.Controllers
{
    [Authorize]
    public class MeetingController : Controller
    {
        private readonly IMeetingService _meetingService;

        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new CreateMeetingViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMeetingViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(model.HostId))
                {
                    model.HostId = User.Identity.Name;
                }

                var meeting = await _meetingService.CreateMeetingAsync(model);
                return RedirectToAction("Room", new { id = meeting.Id });
            }
            return View(model);
        }

        [HttpGet]
        public IActionResult Join()
        {
            return View(new JoinMeetingViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Join(JoinMeetingViewModel model)
        {
            if (ModelState.IsValid)
            {
                var meeting = await _meetingService.JoinMeetingAsync(model);
                if (meeting != null)
                {
                    return RedirectToAction("Room", new { id = meeting.Id });
                }
                ModelState.AddModelError(string.Empty, "Meeting not found or invalid.");
            }
            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Room(Guid id)
        {
            var meeting = await _meetingService.GetMeetingByIdAsync(id);
            if (meeting == null)
            {
                return NotFound();
            }
            return View(meeting);
        }
    }
}