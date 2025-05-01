using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace VideoMeeting.Web.Models.ViewModels
{
    public class MeetingViewModel
    {
        public Guid Id { get; set; }
        public string HostId { get; set; }
        public string Password { get; set; }
        public DateTime StartTime { get; set; }
        public int Duration { get; set; }
        public string Title { get; set; }
        public bool IsActive { get; set; }
        public List<string> Participants { get; set; } = new List<string>();
    }
}