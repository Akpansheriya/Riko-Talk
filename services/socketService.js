const socketIo = require("socket.io");

let io;
let activeUsers = {}; 

const startSessionSocket = (roomID, token) => {
  io.emit("session_started", { roomID, token });
};

const emitSessionData = (roomID, data) => {
  io.to(roomID).emit("sessionUpdate", data);
};

const endSessionSocket = (roomID, reason) => {
  io.to(roomID).emit("session_ended", { reason });
};

const initSocket = (server) => {
  io = socketIo(server);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user-login", (userId) => {
      activeUsers[userId] = { socketId: socket.id, status: "available" };
      console.log(`User ${userId} logged in.`);
    });

    socket.on("chat-request", ({ fromUserId, toUserId }) => {
      const listener = activeUsers[toUserId];

      if (listener && listener.status === "available") {
        io.to(listener.socketId).emit("receive-chat-request", {
          fromUserId,
          state: "requested",
        });
        listener.status = "requested";
      } else {
        io.to(socket.id).emit("error", "Listener is unavailable or already in a chat.");
      }
    });

    socket.on("accept-request", ({ fromUserId, toUserId }) => {
      const userSocket = activeUsers[fromUserId]?.socketId;
      if (userSocket) {
        io.to(userSocket).emit("request-accepted", { state: "accepted" });
        activeUsers[toUserId].status = "in_chat";
      }
    });


    socket.on("reject-request", ({ fromUserId, toUserId, rejectedBy }) => {
      const userSocket = activeUsers[fromUserId]?.socketId;
      if (userSocket) {
        io.to(userSocket).emit("request-rejected", {
          state: "rejected",
          processBy: rejectedBy === "listener" ? toUserId : fromUserId,
        });
        activeUsers[toUserId].status = "available"; 
      }
    });

    socket.on("disconnect", () => {
      for (const userId in activeUsers) {
        if (activeUsers[userId].socketId === socket.id) {
          delete activeUsers[userId];
          break;
        }
      }
      console.log("A user disconnected:", socket.id);
    });
  });
};

module.exports = {
  io,
  initSocket, 
  startSessionSocket, 
  emitSessionData, 
  endSessionSocket, 
};
