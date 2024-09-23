const io = require("socket.io")();

const startSessionSocket = (roomID, token) => {
  io.emit("session_started", { roomID, token });
};
const emitSessionData = (roomID, data) => {
  io.to(roomID).emit("sessionUpdate", data);
};
const endSessionSocket = (roomID, reason) => {
  io.to(roomID).emit("session_ended", { reason });
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

module.exports = {
  io,
  startSessionSocket,
  emitSessionData,
  endSessionSocket,
};
