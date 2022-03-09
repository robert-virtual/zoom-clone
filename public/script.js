let roomId = location.pathname.replace("/", "");
const videoGrid = document.getElementById("video-grid");
const socket = io("/");

const myPeer = new Peer(undefined, {
  host: "/",
  port: 3001,
});

const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audioL: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      console.log("incoming colling", call);
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      // enviar nuestro vidoe al usuario
      console.log("user-connected", userId);
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  console.log(userId);
});

myPeer.on("open", (id) => {
  console.log(roomId);
  socket.emit("join-room", roomId, id);
});

function connectToNewUser(userId, stream) {
  console.group("connectToNewUser");
  const call = myPeer.call(userId, stream);
  const userVideo = document.createElement("video");
  console.log("Call: ", call);
  call.on("stream", (userStream) => {
    console.log("call.on.stream");
    addVideoStream(userVideo, userStream);
  });
  call.on("close", () => {
    userVideo.remove();
  });
  console.groupEnd("connectToNewUser");
}

function addVideoStream(video, stream) {
  console.group("se agrego un nuevo video a la sala");
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
  console.groupEnd("se agrego un nuevo video a la sala");
}
