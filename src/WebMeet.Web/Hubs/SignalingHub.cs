using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace WebMeet.Web.Hubs
{
    public class SignalingHub : Hub
    {
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _rooms =
            new ConcurrentDictionary<string, ConcurrentDictionary<string, string>>();

        public async Task JoinRoom(string roomId, string userName)
        {
            var room = _rooms.GetOrAdd(roomId, new ConcurrentDictionary<string, string>());

            room.TryAdd(Context.ConnectionId, userName);

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            foreach (var participant in room.Where(p => p.Key != Context.ConnectionId))
            {
                //await Clients.Caller.SendAsync("participantJoined", participant.Key, participant.Value);

                await Clients.Client(participant.Key).SendAsync("participantJoined", Context.ConnectionId, userName);
            }
        }

        public async Task LeaveRoom(string roomId)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                if (room.TryRemove(Context.ConnectionId, out string? userName))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

                    await Clients.Group(roomId).SendAsync("participantLeft", Context.ConnectionId, userName);

                    if (room.IsEmpty)
                    {
                        _rooms.TryRemove(roomId, out _);
                    }
                }
            }
        }

        public async Task SendOffer(string roomId, string recipientId, string offerData)
        {
            if (_rooms.TryGetValue(roomId, out var room) &&
                room.TryGetValue(Context.ConnectionId, out string? senderName))
            {
                await Clients.Client(recipientId).SendAsync("receiveOffer", Context.ConnectionId, senderName, offerData);
            }
        }

        public async Task SendAnswer(string roomId, string recipientId, string answerData)
        {
            if (_rooms.TryGetValue(roomId, out var room) &&
                room.TryGetValue(Context.ConnectionId, out string? senderName))
            {
                await Clients.Client(recipientId).SendAsync("receiveAnswer", Context.ConnectionId, senderName, answerData);
            }
        }

        public async Task SendIceCandidate(string roomId, string recipientId, string iceData)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                await Clients.Client(recipientId).SendAsync("receiveIceCandidate", Context.ConnectionId, iceData);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            foreach (var room in _rooms)
            {
                if (room.Value.TryRemove(Context.ConnectionId, out string? userName))
                {
                    await Clients.Group(room.Key).SendAsync("participantLeft", Context.ConnectionId, userName);

                    if (room.Value.IsEmpty)
                    {
                        _rooms.TryRemove(room.Key, out _);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}