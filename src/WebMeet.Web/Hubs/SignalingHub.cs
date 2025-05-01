using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace VideoMeeting.Web.Hubs
{
    public class SignalingHub : Hub
    {
        public async Task SendSignal(string connectionId, string signal)
        {
            await Clients.Client(connectionId).SendAsync("ReceiveSignal", signal);
        }

        public async Task JoinRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserJoined", Context.ConnectionId);
        }

        public async Task LeaveRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("UserLeft", Context.ConnectionId);
        }
    }
}