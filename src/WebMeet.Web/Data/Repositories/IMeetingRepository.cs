using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VideoMeeting.Web.Models;

namespace VideoMeeting.Web.Data.Repositories
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