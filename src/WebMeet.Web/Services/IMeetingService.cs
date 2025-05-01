using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VideoMeeting.Web.Models;
using VideoMeeting.Web.Models.ViewModels;

namespace VideoMeeting.Web.Services
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