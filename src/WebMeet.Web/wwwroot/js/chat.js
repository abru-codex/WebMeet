// This file contains JavaScript for handling in-meeting chat functionality.

// Initialize connection to the chat hub
const chatConnection = new signalR.HubConnectionBuilder()
  .withUrl("/chathub")
  .build();

let roomId;
let userName;

// Event listener for receiving messages
chatConnection.on("ReceiveMessage", function (sender, message, timestamp) {
  appendMessage(sender, message, new Date(timestamp));
});

// Start the SignalR connection
chatConnection
  .start()
  .then(() => {
    console.log("Connected to chat hub");

    // Get room ID and user name from page data
    roomId = document.getElementById("meeting-id")?.value;
    userName = document.getElementById("user-name")?.value;

    if (roomId) {
      // Join the chat room
      chatConnection
        .invoke("JoinRoom", roomId)
        .catch((err) => console.error("Error joining chat room:", err));
    }
  })
  .catch((err) => console.error("Error connecting to chat hub:", err));

// Send a chat message
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message && roomId && userName) {
    chatConnection
      .invoke("SendMessage", roomId, userName, message)
      .catch((err) => console.error("Error sending message:", err));

    // Clear the input field
    messageInput.value = "";
  }
}

// Add a message to the chat container
function appendMessage(sender, message, timestamp) {
  const chatMessages = document.getElementById("chatMessages");
  const isCurrentUser = sender === userName;

  // Format the timestamp
  const timeString = formatTimestamp(timestamp);

  // Create message HTML
  const messageHTML = `
        <div class="chat-message ${isCurrentUser ? "chat-message-self" : ""}">
            <div class="chat-message-bubble">
                ${
                  !isCurrentUser
                    ? `<div class="chat-message-sender">${sender}</div>`
                    : ""
                }
                <div class="chat-message-text">${escapeHtml(message)}</div>
                <div class="chat-message-time">${timeString}</div>
            </div>
        </div>
    `;

  // Add message to the chat container
  chatMessages.insertAdjacentHTML("beforeend", messageHTML);

  // Scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format timestamp to HH:MM format
function formatTimestamp(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Set up event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Send message button click
  const sendButton = document.getElementById("sendButton");
  if (sendButton) {
    sendButton.addEventListener("click", function (event) {
      event.preventDefault();
      sendMessage();
    });
  }

  // Enter key in message input
  const messageInput = document.getElementById("messageInput");
  if (messageInput) {
    messageInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  // Toggle chat panel
  const chatToggle = document.getElementById("chatToggle");
  const chatPanel = document.getElementById("chatPanel");
  if (chatToggle && chatPanel) {
    chatToggle.addEventListener("click", function () {
      chatPanel.classList.toggle("chat-panel-visible");

      // Update the toggle button icon
      const icon = this.querySelector("i");
      if (chatPanel.classList.contains("chat-panel-visible")) {
        icon.classList.remove("bi-chat");
        icon.classList.add("bi-chat-fill");
      } else {
        icon.classList.remove("bi-chat-fill");
        icon.classList.add("bi-chat");
      }
    });
  }
});

// Clean up when leaving the page
window.addEventListener("beforeunload", function () {
  if (roomId) {
    chatConnection
      .invoke("LeaveRoom", roomId)
      .catch((err) => console.error("Error leaving chat room:", err));
  }
});
