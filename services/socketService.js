const io = require("socket.io")();

exports.startSessionSocket = (roomID, token) => {
  io.emit("session_started", { roomID, token });
};

exports.endSessionSocket = (roomID, reason) => {
  io.to(roomID).emit("session_ended", { reason });
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

module.exports = io;
