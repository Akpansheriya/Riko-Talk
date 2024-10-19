const { Server } = require("socket.io");
const { listenersList } = require("../controllers/admin/listener/listener");
const { recentUsersList } = require("../controllers/auth/auth");
let io;
const activeUsers = {};

const logAndEmit = (socket, event, data) => {
  console.log(`Event: ${event}`, data);
  socket.emit(event, data);
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

      // Handle listeners list request
      socket.on("listenersList", ({ page, pageSize, gender, service, topic }) => {
        listenersList(socket, { page, pageSize, gender, service, topic });
      });

      // Handle recent users list request
      recentUsersList(socket);

      // Handle user login
      socket.on("user-login", (data) => {
        const userId = data.userId;
        if (typeof userId !== "string") {
          logAndEmit(socket, "error", { message: "Invalid user ID format" });
          return;
        }

        activeUsers[userId] = { socketId: socket.id, status: "available" };
        console.log("Active Users:", activeUsers);
        logAndEmit(socket, "loginStatus", { userId, status: "available" });
      });

      // Handle chat request
      socket.on("chat-request", ({ fromUserId, toUserId , type }) => {
        console.log("Chat Request:", { fromUserId, toUserId });
        const listener = activeUsers[toUserId];
        const user = activeUsers[fromUserId];

        if (listener && listener.status === "available") {
          listener.status = "requested";

          // Emit to the listener
          if (listener.socketId) {
            io.to(listener.socketId).emit("receiveChatRequest", {
              userId: fromUserId,
              listenerId: toUserId,
              state: "requested",
              requestBy: fromUserId,
              type:type
            });
          }

          // Emit to the user who made the request
          if (user?.socketId) {
            io.to(user.socketId).emit("receiveChatRequest", {
              userId: fromUserId,
              listenerId: toUserId,
              state: "requested",
              requestBy: fromUserId,
              type:type
            });
          }
        } else {
          logAndEmit(socket, "error", {
            message: "Listener unavailable or in a chat",
          });
        }
      });

      // Handle accept request
      socket.on("accept-request", async ({ fromUserId, toUserId, type }) => {
        console.log(`Accept Request from ${fromUserId} to ${toUserId}`);
    
        const userSocket = activeUsers[fromUserId]?.socketId;
        const listenerSocket = activeUsers[toUserId]?.socketId;
    
        if (userSocket && listenerSocket) {
            // Update the listener status
            activeUsers[toUserId].status = "in_chat";
    
            // Emit to both user and listener about the accepted request
            io.to(userSocket).emit("requestAccepted", {
                userId: fromUserId,
                listenerId: toUserId,
                state: "accepted",
                type: type,
            });
    
            io.to(listenerSocket).emit("requestAccepted", {
                userId: fromUserId,
                listenerId: toUserId,
                state: "accepted",
                type: type,
            });
    
            try {
                const { startSessionSocket } = require("../controllers/user/session/session");
                const { roomID, token, sessionId, initialDuration } = await startSessionSocket({
                    user_id: fromUserId,
                    listener_id: toUserId,
                    type: type
                });
    
                // Emit session start details to both user and listener
                io.to(userSocket).emit("sessionStarted", {
                    roomID, token, sessionId, initialDuration, type
                });
    
                io.to(listenerSocket).emit("sessionStarted", {
                    roomID, token, sessionId, initialDuration, type
                });
    
            } catch (error) {
                logAndEmit(socket, "error", { message: error.message });
            }
        } else {
            logAndEmit(socket, "error", {
                message: "User or listener socket not connected",
            });
        }
    });
    

      // Handle reject request
      socket.on("reject-request", async ({ fromUserId, toUserId, rejectedBy, sessionId , type}) => {
        const userSocket = activeUsers[fromUserId]?.socketId;
        console.log(`Reject Request from ${fromUserId} by ${rejectedBy}`);

        if (userSocket) {
          if (activeUsers[toUserId].status === "in_chat") {
            const { endSession } = require("../controllers/user/session/session");
            await endSession(sessionId);

            logAndEmit(socket, "sessionEnded", {
              userId: fromUserId,
              listenerId: toUserId,
              sessionId: sessionId,
              type:type
            });
          }

          activeUsers[toUserId].status = "available";
          logAndEmit(socket, "requestRejected", {
            userId: fromUserId,
            listenerId: toUserId,
            state: "rejected",
            processBy: rejectedBy === "listener" ? toUserId : fromUserId,
            type:type
          });
        }
      });

      // Start session
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

      // End session
      socket.on("endSession", async ({ session_id }) => {
        try {
          await sessionController.endSession(session_id);
          logAndEmit(socket, "sessionEnded", { sessionId: session_id });
        } catch (error) {
          logAndEmit(socket, "error", { message: error.message });
        }
      });

      // Handle disconnect
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
