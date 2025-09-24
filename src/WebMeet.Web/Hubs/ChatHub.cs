using Microsoft.AspNetCore.SignalR;

namespace WebMeet.Web.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string roomId, string userName, string message)
        {
            if (string.IsNullOrEmpty(roomId) || string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(message))
            {
                return;
            }

            await Clients.Group(roomId).SendAsync("ReceiveMessage", userName, message, DateTime.Now);
        }

        public async Task JoinRoom(string roomId)
        {
            if (string.IsNullOrEmpty(roomId))
            {
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        public async Task LeaveRoom(string roomId)
        {
            if (string.IsNullOrEmpty(roomId))
            {
                return;
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }
    }
}