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
      video: true,
      audio: true,
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

  const peerConnection = new RTCPeerConnection(configuration);
  peerConnections[participantId] = peerConnection;

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`Sending ICE candidate to ${participantName}`);
      connection
        .invoke(
          "SendIceCandidate",
          webRTCRoomId,
          participantId,
          JSON.stringify(event.candidate)
        )
        .catch((err) => console.error("Error sending ICE candidate:", err));
    }
  };

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  remoteStreams[participantId] = new MediaStream();
  displayRemoteStream(participantId, participantName);

  peerConnection.ontrack = (event) => {
    console.log(
      `Received track from ${participantId}:`,
      event.track.kind,
      event.streams[0]
    );
    event.streams[0].getTracks().forEach((track) => {
      console.log(
        `Adding track ${track.id} (${track.kind}) to remote stream ${participantId}`
      );
      remoteStreams[participantId].addTrack(track);
    });
  };

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

connection.on("receiveOffer", async (senderId, senderName, offerData) => {
  console.log(`Received offer from ${senderName}`);

  const offer = JSON.parse(offerData);
  const peerConnection = new RTCPeerConnection(configuration);
  peerConnections[senderId] = peerConnection;

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`Sending ICE candidate to ${senderName}`);
      connection
        .invoke(
          "SendIceCandidate",
          webRTCRoomId,
          senderId,
          JSON.stringify(event.candidate)
        )
        .catch((err) => console.error("Error sending ICE candidate:", err));
    }
  };

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  remoteStreams[senderId] = new MediaStream();
  displayRemoteStream(senderId, senderName);

  peerConnection.ontrack = (event) => {
    console.log(
      `Received track from ${senderId}:`,
      event.track.kind,
      event.streams[0]
    );
    event.streams[0].getTracks().forEach((track) => {
      console.log(
        `Adding track ${track.id} (${track.kind}) to remote stream ${senderId}`
      );
      remoteStreams[senderId].addTrack(track);
    });
  };

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

connection.on("receiveIceCandidate", (senderId, iceData) => {
  console.log(`Received ICE candidate from ${senderId}`);

  const candidate = JSON.parse(iceData);
  const peerConnection = peerConnections[senderId];

  if (peerConnection) {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((err) =>
        console.error("Error adding received ICE candidate:", err)
      );
  }
});

connection.on("participantLeft", (participantId, participantName) => {
  console.log(`${participantName} left the room`);

  const peerConnection = peerConnections[participantId];
  if (peerConnection) {
    peerConnection.close();
    delete peerConnections[participantId];
  }

  const remoteVideo = document.getElementById(`remote-video-${participantId}`);
  if (remoteVideo) {
    remoteVideo.parentElement.remove();
  }
});

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

  let remoteVideoElement = document.getElementById(
    `remote-video-${participantId}`
  );

  if (!remoteVideoElement) {
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-wrapper";
    videoWrapper.classList.add("remote-video");

    remoteVideoElement = document.createElement("video");
    remoteVideoElement.id = `remote-video-${participantId}`;
    remoteVideoElement.autoplay = true;
    remoteVideoElement.playsInline = true;
    remoteVideoElement.muted = false;

    const videoOverlay = document.createElement("div");
    videoOverlay.className = "video-overlay";
    videoOverlay.innerHTML = `<span>${participantName}</span>`;

    videoWrapper.appendChild(remoteVideoElement);
    videoWrapper.appendChild(videoOverlay);
    remoteVideosContainer.appendChild(videoWrapper);
  }

  remoteVideoElement.srcObject = stream;
}

function toggleAudio() {
  const audioTracks = localStream.getAudioTracks();
  const isAudioEnabled = audioTracks[0]?.enabled;

  audioTracks.forEach((track) => {
    track.enabled = !isAudioEnabled;
  });

  return !isAudioEnabled;
}

function toggleVideo() {
  const videoTracks = localStream.getVideoTracks();
  const isVideoEnabled = videoTracks[0]?.enabled;

  videoTracks.forEach((track) => {
    track.enabled = !isVideoEnabled;
  });

  return !isVideoEnabled;
}

async function toggleScreenShare() {
  try {
    if (localStream.getVideoTracks()[0].label.includes("screen")) {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: localStream.getAudioTracks().length > 0,
      });

      replaceVideoTrack(cameraStream.getVideoTracks()[0]);

      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = cameraStream;

      return false;
    } else {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      replaceVideoTrack(screenStream.getVideoTracks()[0]);

      screenStream.getVideoTracks()[0].onended = async () => {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: localStream.getAudioTracks().length > 0,
        });

        replaceVideoTrack(cameraStream.getVideoTracks()[0]);

        const localVideo = document.getElementById("localVideo");
        localVideo.srcObject = cameraStream;
      };

      const localVideo = document.getElementById("localVideo");
      localVideo.srcObject = screenStream;

      return true;
    }
  } catch (error) {
    console.error("Error toggling screen share:", error);
    return false;
  }
}

function replaceVideoTrack(newTrack) {
  const oldVideoTrack = localStream.getVideoTracks()[0];
  if (oldVideoTrack) {
    localStream.removeTrack(oldVideoTrack);
    oldVideoTrack.stop();
  }
  localStream.addTrack(newTrack);

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

function leaveRoom() {
  if (webRTCRoomId) {
    connection
      .invoke("LeaveRoom", webRTCRoomId)
      .catch((err) => console.error("Error leaving room:", err));

    for (const participantId in peerConnections) {
      const peerConnection = peerConnections[participantId];
      peerConnection.close();
    }
    peerConnections = {};

    localStream.getTracks().forEach((track) => track.stop());
  }
}

document.addEventListener("DOMContentLoaded", function () {
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

  const shareButton = document.getElementById("shareButton");
  if (shareButton) {
    shareButton.addEventListener("click", function () {
      toggleScreenShare().then((isScreenSharing) => {
        const icon = this.querySelector("i");

        this.classList.toggle("sharing");
        if (isScreenSharing) {
          icon.classList.remove("bi-display-fill");
          icon.classList.add("bi-display-fill");
        } else {
          icon.classList.remove("bi-display-fill");
          icon.classList.add("bi-display-fill");
        }
      });
    });
  }

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

window.addEventListener("beforeunload", function () {
  leaveRoom();
});