using System.ComponentModel.DataAnnotations;

namespace WebMeet.Web.Models
{
    public class Meeting
    {
        public Guid Id { get; set; }

        [Required]
        public string HostId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public string Password { get; set; }

        public string Title { get; set; }

        public int Duration { get; set; }

        public bool IsRecurring { get; set; }

        public bool IsActive { get; set; } = true;

        public virtual ICollection<string> Participants { get; set; } = new List<string>();
    }
}