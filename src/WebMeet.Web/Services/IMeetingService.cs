using WebMeet.Web.Models;
using WebMeet.Web.Models.ViewModels;

namespace WebMeet.Web.Services
{
    public interface IMeetingService
    {
        Task<Meeting> CreateMeetingAsync(CreateMeetingViewModel model);
        Task<Meeting?> JoinMeetingAsync(JoinMeetingViewModel model);
        Task<Meeting?> GetMeetingByIdAsync(Guid meetingId);
        Task<IEnumerable<Meeting>?> GetAllMeetingsAsync();
        Task<bool> EndMeetingAsync(Guid meetingId);
    }
}