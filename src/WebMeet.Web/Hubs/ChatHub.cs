using Microsoft.AspNetCore.SignalR;

namespace WebMeet.Web.Hubs
{
    public class ChatHub : Hub
    {
        // Send message to a specific room
        public async Task SendMessage(string roomId, string userName, string message)
        {
            if (string.IsNullOrEmpty(roomId) || string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(message))
            {
                return;
            }

            // Send message to all clients in the room group
            await Clients.Group(roomId).SendAsync("ReceiveMessage", userName, message, DateTime.Now);
        }

        // Join a chat room
        public async Task JoinRoom(string roomId)
        {
            if (string.IsNullOrEmpty(roomId))
            {
                return;
            }

            // Add connection to the SignalR group
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        }

        // Leave a chat room
        public async Task LeaveRoom(string roomId)
        {
            if (string.IsNullOrEmpty(roomId))
            {
                return;
            }

            // Remove connection from the SignalR group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        }
    }
}