using Microsoft.EntityFrameworkCore;
using WebMeet.Web.Models;

namespace WebMeet.Web.Data.Repositories
{
    public class MeetingRepository : IMeetingRepository
    {
        private readonly ApplicationDbContext _context;

        public MeetingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Meeting> CreateMeetingAsync(Meeting meeting)
        {
            await _context.Meetings.AddAsync(meeting);
            await _context.SaveChangesAsync();
            return meeting;
        }

        public async Task<Meeting?> GetMeetingByIdAsync(Guid meetingId)
        {
            return await _context.Meetings.FindAsync(meetingId);
        }

        public async Task<IEnumerable<Meeting>?> GetAllMeetingsAsync()
        {
            return await _context.Meetings.ToListAsync();
        }

        public async Task<bool> UpdateMeetingAsync(Meeting meeting)
        {
            _context.Entry(meeting).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await MeetingExists(meeting.Id))
                    return false;
                throw;
            }
        }

        public async Task<bool> DeleteMeetingAsync(Guid meetingId)
        {
            var meeting = await _context.Meetings.FindAsync(meetingId);
            if (meeting == null)
                return false;

            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Meeting>?> GetMeetingsByHostIdAsync(string hostId)
        {
            return await _context.Meetings
                .Where(m => m.HostId == hostId)
                .ToListAsync();
        }

        private async Task<bool> MeetingExists(Guid id)
        {
            return await _context.Meetings.AnyAsync(e => e.Id == id);
        }
    }
}