const connection = new signalR.HubConnectionBuilder()
  .withUrl("/signalinghub")
  .build();

let localStream;
let peerConnections = {};
let remoteStreams = {};
let webRTCRoomId;
let localUserName;

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

connection
  .start()
  .then(() => {
    console.log("Connected to signaling hub");
    setupLocalMedia();
  })
  .catch((err) => console.error("Error connecting to SignalR hub:", err));

async function setupLocalMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });

    const localVideo = document.getElementById("localVideo");
    if (localVideo) {
      localVideo.srcObject = localStream;
    }

    const urlParams = new URLSearchParams(window.location.search);
    webRTCRoomId =
      document.getElementById("meeting-id")?.value || urlParams.get("id");
    localUserName =
      document.getElementById("user-name")?.value ||
      "User" + Math.floor(Math.random() * 1000);

    if (webRTCRoomId) {
      joinRoom(webRTCRoomId, localUserName);
    }
  } catch (error) {
    console.error("Error accessing media devices:", error);
    alert(
      "Error accessing camera or microphone. Please check your device permissions."
    );
  }
}

function joinRoom(webRTCRoomId, userName) {
  if (!webRTCRoomId) {
    console.error("Room ID is required to join a room");
    return;
  }

  connection
    .invoke("JoinRoom", webRTCRoomId, userName)
    .catch((err) => console.error("Error joining room:", err));
}

connection.on("participantJoined", async (participantId, participantName) => {
  console.log(`${participantName} joined the room`);

  // Create a new peer connection for this participant
  const peerConnection = new RTCPeerConnection(configuration);
  peerConnections[participantId] = peerConnection;

  // Add local tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  remoteStreams[participantId] = new MediaStream();
  displayRemoteStream(participantId, participantName);
  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStreams[participantId].addTrack(track);
    });
  };

  // Create and send an offer
  await peerConnection
    .createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer))
    .then(() => {
      connection
        .invoke(
          "SendOffer",
          webRTCRoomId,
          participantId,
          JSON.stringify(peerConnection.localDescription)
        )
        .catch((err) => console.error("Error sending offer:", err));
    })
    .catch((err) => console.error("Error creating offer:", err));
});

// Handle received offer from other participants
connection.on("receiveOffer", async (senderId, senderName, offerData) => {
  console.log(`Received offer from ${senderName}`);

  const offer = JSON.parse(offerData);
  const peerConnection = new RTCPeerConnection(configuration);
  peerConnections[senderId] = peerConnection;

  // Add local tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  remoteStreams[senderId] = new MediaStream();
  displayRemoteStream(senderId, senderName);

  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStreams[senderId].addTrack(track);
    });
  };

  // Set remote description and create answer
  await peerConnection
    .setRemoteDescription(offer)
    .then(() => peerConnection.createAnswer())
    .then((answer) => peerConnection.setLocalDescription(answer))
    .then(() => {
      connection
        .invoke(
          "SendAnswer",
          webRTCRoomId,
          senderId,
          JSON.stringify(peerConnection.localDescription)
        )
        .catch((err) => console.error("Error sending answer:", err));
    })
    .catch((err) => console.error("Error handling offer:", err));
});

// Handle received answer from other participants
connection.on("receiveAnswer", (senderId, senderName, answerData) => {
  console.log(`Received answer from ${senderName}`);

  const answer = JSON.parse(answerData);
  const peerConnection = peerConnections[senderId];

  if (peerConnection) {
    peerConnection
      .setRemoteDescription(answer)
      .catch((err) => console.error("Error setting remote description:", err));
  }
});

// Handle participant leaving the room
connection.on("participantLeft", (participantId, participantName) => {
  console.log(`${participantName} left the room`);

  // Close and remove the peer connection
  const peerConnection = peerConnections[participantId];
  if (peerConnection) {
    peerConnection.close();
    delete peerConnections[participantId];
  }

  // Remove the remote video element
  const remoteVideo = document.getElementById(`remote-video-${participantId}`);
  if (remoteVideo) {
    remoteVideo.parentElement.remove();
  }
});

// Display remote stream in the UI
function displayRemoteStream(participantId, participantName) {
  const stream = remoteStreams[participantId];
  if (!stream) {
    console.error("Stream is null or undefined");
    return;
  }

  console.log(
    `Displaying remote stream for participant ${participantId} (${participantName})`
  );

  console.log("Stream:", stream);

  const remoteVideosContainer = document.getElementById("remoteVideos");

  // Check if the remote video element already exists
  let remoteVideoElement = document.getElementById(
    `remote-video-${participantId}`
  );

  if (!remoteVideoElement) {
    // Create a new video wrapper for this participant
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-wrapper";

    // Create a new video element
    remoteVideoElement = document.createElement("video");
    remoteVideoElement.id = `remote-video-${participantId}`;
    remoteVideoElement.autoplay = true;
    remoteVideoElement.playsInline = true;

    // Create video overlay with participant name
    const videoOverlay = document.createElement("div");
    videoOverlay.className = "video-overlay";
    videoOverlay.innerHTML = `<span>${participantName}</span>`;

    // Add elements to the DOM
    videoWrapper.appendChild(remoteVideoElement);
    videoWrapper.appendChild(videoOverlay);
    remoteVideosContainer.appendChild(videoWrapper);
  }

  // Set the stream as the source of the video element
  remoteVideoElement.srcObject = stream;
}

// Toggle local audio on/off
function toggleAudio() {
  const audioTracks = localStream.getAudioTracks();
  const isAudioEnabled = audioTracks[0]?.enabled;

  audioTracks.forEach((track) => {
    track.enabled = !isAudioEnabled;
  });

  return !isAudioEnabled;
}

// Toggle local video on/off
function toggleVideo() {
  const videoTracks = localStream.getVideoTracks();
  const isVideoEnabled = videoTracks[0]?.enabled;

  videoTracks.forEach((track) => {
    track.enabled = !isVideoEnabled;
  });

  return !isVideoEnabled;
}

// Handle screen sharing
async function toggleScreenShare() {
  try {
    if (localStream.getVideoTracks()[0].label.includes("screen")) {
      // Switch back to camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: localStream.getAudioTracks().length > 0,
      });

      // Replace video track in all peer connections
      replaceVideoTrack(cameraStream.getVideoTracks()[0]);

      // Update local video
      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = cameraStream;

      return false;
    } else {
      // Switch to screen sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      // Replace video track in all peer connections
      replaceVideoTrack(screenStream.getVideoTracks()[0]);

      // Handle stop sharing
      screenStream.getVideoTracks()[0].onended = async () => {
        // Switch back to camera automatically when screen sharing stops
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: localStream.getAudioTracks().length > 0,
        });

        replaceVideoTrack(cameraStream.getVideoTracks()[0]);

        const localVideo = document.getElementById("localVideo");
        localVideo.srcObject = cameraStream;
      };

      // Update local video
      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = screenStream;

      return true;
    }
  } catch (error) {
    console.error("Error toggling screen share:", error);
    return false;
  }
}

// Replace video track in all peer connections
function replaceVideoTrack(newTrack) {
  // Replace the video track in local stream
  const oldVideoTrack = localStream.getVideoTracks()[0];
  if (oldVideoTrack) {
    localStream.removeTrack(oldVideoTrack);
    oldVideoTrack.stop();
  }
  localStream.addTrack(newTrack);

  // Replace the video track in all peer connections
  for (const participantId in peerConnections) {
    const peerConnection = peerConnections[participantId];
    const senders = peerConnection.getSenders();
    const videoSender = senders.find(
      (sender) => sender.track && sender.track.kind === "video"
    );

    if (videoSender) {
      videoSender
        .replaceTrack(newTrack)
        .catch((err) => console.error("Error replacing video track:", err));
    }
  }
}

// Leave the room
function leaveRoom() {
  if (webRTCRoomId) {
    // Notify server that participant is leaving
    connection
      .invoke("LeaveRoom", webRTCRoomId)
      .catch((err) => console.error("Error leaving room:", err));

    // Close all peer connections
    for (const participantId in peerConnections) {
      const peerConnection = peerConnections[participantId];
      peerConnection.close();
    }
    peerConnections = {};

    // Stop all local tracks
    localStream.getTracks().forEach((track) => track.stop());
  }
}

// Set up event listeners for UI controls when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Mute/unmute
  const muteButton = document.getElementById("muteButton");
  if (muteButton) {
    muteButton.addEventListener("click", function () {
      const isAudioEnabled = toggleAudio();
      const icon = this.querySelector("i");

      this.classList.toggle("mute");
      if (isAudioEnabled) {
        icon.classList.remove("bi-mic-mute-fill");
        icon.classList.add("bi-mic-fill");
      } else {
        icon.classList.remove("bi-mic-fill");
        icon.classList.add("bi-mic-mute-fill");
      }
    });
  }

  // Video on/off
  const videoButton = document.getElementById("videoButton");
  if (videoButton) {
    videoButton.addEventListener("click", function () {
      const isVideoEnabled = toggleVideo();
      const icon = this.querySelector("i");

      this.classList.toggle("video-off");
      if (isVideoEnabled) {
        icon.classList.remove("bi-camera-video-off-fill");
        icon.classList.add("bi-camera-video-fill");
      } else {
        icon.classList.remove("bi-camera-video-fill");
        icon.classList.add("bi-camera-video-off-fill");
      }
    });
  }

  // Screen sharing
  const shareButton = document.getElementById("shareButton");
  if (shareButton) {
    shareButton.addEventListener("click", function () {
      toggleScreenShare().then((isScreenSharing) => {
        const icon = this.querySelector("i");

        this.classList.toggle("sharing");
        if (isScreenSharing) {
          icon.classList.remove("bi-display-fill");
          icon.classList.add("bi-display-fill"); // You might want to use a different icon for active sharing
        } else {
          icon.classList.remove("bi-display-fill");
          icon.classList.add("bi-display-fill");
        }
      });
    });
  }

  // Leave meeting
  const leaveButton = document.getElementById("leaveButton");
  if (leaveButton) {
    leaveButton.addEventListener("click", function () {
      if (confirm("Are you sure you want to leave this meeting?")) {
        leaveRoom();
        window.location.href = "/Home/Index";
      }
    });
  }
});

// Handle window unload event to properly disconnect
window.addEventListener("beforeunload", function () {
  leaveRoom();
});
