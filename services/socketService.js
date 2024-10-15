const { Server } = require("socket.io");
let io;
const activeUsers = {};

const logAndEmit = (socket, event, data) => {
  const response = { event, data };
  console.log(`Event: ${event}`, response);
  socket.emit(event, response);
};

const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("user-login", (data) => {
        console.log("data", data);
        userId = data.userId;
        if (typeof userId !== "string") {
          console.error("Invalid userId type:", userId);
          logAndEmit(socket, "error", { message: "Invalid user ID format" });
          return;
        }

        activeUsers[userId] = { socketId: socket.id, status: "available" };
        console.log("Active Users:", activeUsers);
        logAndEmit(socket, "loginStatus", { userId, status: "available" });
      });

      socket.on("chat-request", ({ fromUserId, toUserId }) => {
        console.log("Chat Request:", { fromUserId, toUserId });
        const listener = activeUsers[toUserId];

        if (listener && listener.status === "available") {
          listener.status = "requested";
          logAndEmit(socket, "receiveChatRequest", {
            userId: fromUserId,
            listenerId: toUserId,
            state: "requested",
          });
        } else {
          logAndEmit(socket, "error", {
            message: "Listener unavailable or in a chat",
          });
        }
      });

      socket.on("accept-request", async ({ fromUserId, toUserId }) => {
        const userSocket = activeUsers[fromUserId]?.socketId;
        console.log(`Accept Request from ${fromUserId} to ${toUserId}`);

        if (socket) {
          activeUsers[toUserId].status = "in_chat";
          logAndEmit(socket, "requestAccepted", {
            userId: fromUserId,
            listenerId: toUserId,
            state: "accepted",
          });

          try {
            const {
              startSessionSocket,
            } = require("../controllers/user/session/session");
            const { roomID, token,sessionId,initialDuration } = await startSessionSocket({
              user_id: fromUserId,
              listener_id: toUserId,
            });

            logAndEmit(socket, "sessionStarted", { roomID, token,sessionId,initialDuration });
          } catch (error) {
            logAndEmit(socket, "error", { message: error.message });
          }
        }
      });

      socket.on(
        "reject-request",
        async ({ fromUserId, toUserId, rejectedBy }) => {
          const userSocket = activeUsers[fromUserId]?.socketId;
          console.log(`Reject Request from ${fromUserId} by ${rejectedBy}`);

          if (userSocket) {
            activeUsers[toUserId].status = "available";
            logAndEmit(socket, "requestRejected", {
              userId: fromUserId,
              listenerId: toUserId,
              state: "rejected",
              processBy: rejectedBy === "listener" ? toUserId : fromUserId,
            });

            try {
              const {
                endSession,
              } = require("../controllers/user/session/session");
              await endSession(fromUserId);

              logAndEmit(socket, "sessionEnded", {
                userId: fromUserId,
                listenerId: toUserId,
                sessionId: fromUserId,
              });
            } catch (error) {
              logAndEmit(socket, "error", { message: error.message });
            }
          }
        }
      );

      socket.on("startSession", async ({ user_id, listener_id }) => {
        try {
          const { roomID, token } = await sessionController.startSessionSocket({
            user_id,
            listener_id,
          });
          logAndEmit(socket, "sessionStarted", { roomID, token });
        } catch (error) {
          logAndEmit(socket, "error", { message: error.message });
        }
      });

      socket.on("endSession", async ({ session_id }) => {
        try {
          await sessionController.endSession(session_id);
          logAndEmit(socket, "sessionEnded", { sessionId: session_id });
        } catch (error) {
          logAndEmit(socket, "error", { message: error.message });
        }
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (const userId in activeUsers) {
          if (activeUsers[userId].socketId === socket.id) {
            console.log(`User ${userId} disconnected.`);
            delete activeUsers[userId];
            break;
          }
        }
      });
    });
  }
};

const startSessionSocket = (roomID, token) => {
  io.emit("session_started", { roomID, token });
};

const emitSessionData = (roomID, data) => {
  io.to(roomID).emit("sessionUpdate", data);
};

const endSessionSocket = (roomID, reason) => {
  io.to(roomID).emit("session_ended", { reason });
};

module.exports = {
  initSocket,
  startSessionSocket,
  emitSessionData,
  endSessionSocket,
};
