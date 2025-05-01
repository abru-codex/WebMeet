using System;
using System.ComponentModel.DataAnnotations;

namespace VideoMeeting.Web.Models.ViewModels
{
    public class CreateMeetingViewModel
    {
        [Required]
        public string HostId { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, ErrorMessage = "Password must be at least {2} characters long", MinimumLength = 4)]
        public string Password { get; set; }

        public string Title { get; set; }
        public bool IsRecurring { get; set; }
        public DateTime? ScheduledTime { get; set; }

        [Required]
        [Display(Name = "Start Time")]
        public DateTime StartTime { get; set; }

        [Required]
        [Display(Name = "Duration (minutes)")]
        [Range(1, 180, ErrorMessage = "Duration must be between 1 and 180 minutes.")]
        public int Duration { get; set; }
    }
}