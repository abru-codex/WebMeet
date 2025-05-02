using WebMeet.Web.Data.Repositories;
using WebMeet.Web.Models;
using WebMeet.Web.Models.ViewModels;

namespace WebMeet.Web.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly IMeetingRepository _meetingRepository;

        public MeetingService(IMeetingRepository meetingRepository)
        {
            _meetingRepository = meetingRepository;
        }

        public async Task<Meeting> CreateMeetingAsync(CreateMeetingViewModel model)
        {
            var meeting = new Meeting
            {
                Id = Guid.NewGuid(),
                HostId = model.HostId,
                StartTime = model.StartTime,
                Password = model.Password,
                Title = model.Title,
                Duration = model.Duration,
                IsRecurring = model.IsRecurring,
                IsActive = true
            };

            return await _meetingRepository.CreateMeetingAsync(meeting);
        }

        public async Task<Meeting?> JoinMeetingAsync(JoinMeetingViewModel model)
        {
            var meeting = await _meetingRepository.GetMeetingByIdAsync(model.MeetingId);

            if (meeting != null && meeting.Password == model.Password)
            {
                return meeting;
            }

            return null;
        }

        public async Task<Meeting?> GetMeetingByIdAsync(Guid meetingId)
        {
            return await _meetingRepository.GetMeetingByIdAsync(meetingId);
        }

        public async Task<IEnumerable<Meeting>?> GetAllMeetingsAsync()
        {
            return await _meetingRepository.GetAllMeetingsAsync();
        }

        public async Task<bool> EndMeetingAsync(Guid meetingId)
        {
            var meeting = await _meetingRepository.GetMeetingByIdAsync(meetingId);
            if (meeting != null)
            {
                await _meetingRepository.DeleteMeetingAsync(meetingId);
                return true;
            }
            return false;
        }

        public async Task<bool> UpdateMeetingAsync(Meeting meeting)
        {
            await _meetingRepository.UpdateMeetingAsync(meeting);
            return true;
        }

        public async Task<bool> DeleteMeetingAsync(Guid meetingId)
        {
            await _meetingRepository.DeleteMeetingAsync(meetingId);
            return true;
        }
    }
}