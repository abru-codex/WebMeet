const chatConnection = new signalR.HubConnectionBuilder()
  .withUrl("/chathub")
  .build();

let roomId;
let userName;

chatConnection.on("ReceiveMessage", function (sender, message, timestamp) {
  appendMessage(sender, message, new Date(timestamp));
});

chatConnection
  .start()
  .then(() => {
    console.log("Connected to chat hub");

    roomId = document.getElementById("meeting-id")?.value;
    userName = document.getElementById("user-name")?.value;

    if (roomId) {
      chatConnection
        .invoke("JoinRoom", roomId)
        .catch((err) => console.error("Error joining chat room:", err));
    }
  })
  .catch((err) => console.error("Error connecting to chat hub:", err));

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message && roomId && userName) {
    chatConnection
      .invoke("SendMessage", roomId, userName, message)
      .catch((err) => console.error("Error sending message:", err));

    messageInput.value = "";
  }
}

function appendMessage(sender, message, timestamp) {
  const chatMessages = document.getElementById("chatMessages");
  const isCurrentUser = sender === userName;

  const timeString = formatTimestamp(timestamp);

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

  chatMessages.insertAdjacentHTML("beforeend", messageHTML);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatTimestamp(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("sendButton");
  if (sendButton) {
    sendButton.addEventListener("click", function (event) {
      event.preventDefault();
      sendMessage();
    });
  }

  const messageInput = document.getElementById("messageInput");
  if (messageInput) {
    messageInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  const chatToggle = document.getElementById("chatToggle");
  const chatPanel = document.getElementById("chatPanel");
  if (chatToggle && chatPanel) {
    chatToggle.addEventListener("click", function () {
      chatPanel.classList.toggle("chat-panel-visible");

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

window.addEventListener("beforeunload", function () {
  if (roomId) {
    chatConnection
      .invoke("LeaveRoom", roomId)
      .catch((err) => console.error("Error leaving chat room:", err));
  }
});