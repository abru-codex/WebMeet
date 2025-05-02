using WebMeet.Web.Models;

namespace WebMeet.Web.Data.Repositories
{
    public interface IMeetingRepository
    {
        Task<Meeting> CreateMeetingAsync(Meeting meeting);
        Task<Meeting?> GetMeetingByIdAsync(Guid meetingId);
        Task<IEnumerable<Meeting>?> GetAllMeetingsAsync();
        Task<bool> UpdateMeetingAsync(Meeting meeting);
        Task<bool> DeleteMeetingAsync(Guid meetingId);
        Task<IEnumerable<Meeting>?> GetMeetingsByHostIdAsync(string hostId);
    }
}