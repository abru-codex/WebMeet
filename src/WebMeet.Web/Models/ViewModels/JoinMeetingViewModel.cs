using System;
using System.ComponentModel.DataAnnotations;

namespace VideoMeeting.Web.Models.ViewModels
{
    public class JoinMeetingViewModel
    {
        [Required(ErrorMessage = "Meeting ID is required")]
        [Display(Name = "Meeting ID")]
        public Guid MeetingId { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [Display(Name = "Meeting Password")]
        public string Password { get; set; }
    }
}