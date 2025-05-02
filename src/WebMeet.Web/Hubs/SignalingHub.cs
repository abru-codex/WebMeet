using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace WebMeet.Web.Hubs
{
    public class SignalingHub : Hub
    {
        // Store active participants in each room
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _rooms =
            new ConcurrentDictionary<string, ConcurrentDictionary<string, string>>();

        // Join a room with a username
        public async Task JoinRoom(string roomId, string userName)
        {
            // Get or create a room
            var room = _rooms.GetOrAdd(roomId, new ConcurrentDictionary<string, string>());

            // Add user to the room with their connection ID and name
            room.TryAdd(Context.ConnectionId, userName);

            // Add connection to the SignalR group
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            // Notify existing participants in the room about the new participant
            foreach (var participant in room.Where(p => p.Key != Context.ConnectionId))
            {
                // Tell the new participant about existing participants
                await Clients.Caller.SendAsync("participantJoined", participant.Key, participant.Value);

                // Tell existing participants about the new participant
                await Clients.Client(participant.Key).SendAsync("participantJoined", Context.ConnectionId, userName);
            }

            // If this is the first person in the room, no need to signal anyone
            if (room.Count == 1)
            {
                await Clients.Caller.SendAsync("roomJoined", roomId);
            }
        }

        // Leave a room
        public async Task LeaveRoom(string roomId)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                // Remove the user from the room
                if (room.TryRemove(Context.ConnectionId, out string userName))
                {
                    // Remove connection from the SignalR group
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

                    // Notify everyone in the room that the participant has left
                    await Clients.Group(roomId).SendAsync("participantLeft", Context.ConnectionId, userName);

                    // If the room is empty, remove it
                    if (room.IsEmpty)
                    {
                        _rooms.TryRemove(roomId, out _);
                    }
                }
            }
        }

        // Send an offer to a specific participant
        public async Task SendOffer(string roomId, string recipientId, string offerData)
        {
            if (_rooms.TryGetValue(roomId, out var room) &&
                room.TryGetValue(Context.ConnectionId, out string senderName))
            {
                await Clients.Client(recipientId).SendAsync("receiveOffer", Context.ConnectionId, senderName, offerData);
            }
        }

        // Send an answer to a specific participant
        public async Task SendAnswer(string roomId, string recipientId, string answerData)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                await Clients.Client(recipientId).SendAsync("receiveAnswer", Context.ConnectionId, answerData);
            }
        }

        // Send an ICE candidate to a specific participant
        public async Task SendIceCandidate(string roomId, string recipientId, string candidateData)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                await Clients.Client(recipientId).SendAsync("receiveIceCandidate", Context.ConnectionId, candidateData);
            }
        }

        // Handle disconnection
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Find all rooms the user is in and remove them
            foreach (var room in _rooms)
            {
                if (room.Value.TryRemove(Context.ConnectionId, out string userName))
                {
                    // Notify everyone in the room that the participant has left
                    await Clients.Group(room.Key).SendAsync("participantLeft", Context.ConnectionId, userName);

                    // If the room is empty, remove it
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