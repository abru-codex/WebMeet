using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VideoMeeting.Web.Models;
using VideoMeeting.Web.Models.ViewModels;
using VideoMeeting.Web.Services;

namespace VideoMeeting.Web.Controllers
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
                // Set the host ID to the current user if not already set
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