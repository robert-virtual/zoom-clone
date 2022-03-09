const uuid = require("uuid").v4;
const express = require("express");
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const port = 3000;
const { Server } = require("socket.io");
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));
//ruras
app.get("/", (req, res) => {
  res.redirect(`/${uuid()}`);
});

app.get("/newroom", (req, res) => {
  res.json({ roomId: uuid() });
});

app.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  res.render("room", { roomId });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);

    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(port, () => {
  console.log("server running on port", port);
});
