const { Server } = require("socket.io");
const {
  listenersList,
  storyList,
} = require("../controllers/admin/listener/listener");
const { recentUsersList } = require("../controllers/auth/auth");
const Database = require("../connections/connection");
const Wallet = Database.wallet;
const Session = Database.session;
const Auth = Database.user;
const Leaves = Database.leaves;
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

      socket.on(
        "listenersList",
        ({ page, pageSize, gender, service, topic }) => {
          listenersList(socket, { page, pageSize, gender, service, topic });
        }
      );
      socket.on("storyList", ({ page, pageSize }) => {
        storyList(socket, { page, pageSize });
      });
      recentUsersList(socket);
      socket.on("endSessionReason", (data) => {
        console.log("Event: endSessionReason", data);

        const userSocket = activeUsers[data.userId]?.socketId;
        const listenerSocket = activeUsers[data.listenerId]?.socketId;

        // Emit the sessionEnded event to the user
        if (userSocket) {
          io.to(userSocket).emit("sessionEnded", {
            message: data.message,
            userId: data.userId,
            listenerId: data.listenerId,
            sessionId: data.sessionId,
            reason: data.message,
            roomID: data.roomID,
          });
        } else {
          console.log(`User with ID ${data.userId} is not connected.`);
        }
      });

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
      socket.on(
        "chat-request",
        async ({ userId, listenerId, type, requestedBy }) => {
          console.log("Chat Request:", { userId, listenerId });

          const listener = activeUsers[listenerId];
          const user = activeUsers[userId];
          console.log("User:", user);
          console.log("Listener:", listener);
          console.log("Active Users:", activeUsers);

          try {
            const userWallet = await Wallet.findOne({
              where: { user_id: userId },
            });

            if (!userWallet || userWallet.balance < 50) {
              logAndEmit(socket, "error", {
                message:
                  "Insufficient balance. Please recharge your wallet to proceed.",
              });
              return;
            }

            if (
              listener &&
              listener.status === "available" &&
              user &&
              user.status === "available"
            ) {
              activeUsers[listenerId].status = "requested";
              activeUsers[userId].status = "requested";
              console.log(
                "-------------",
                requestedBy === "listener" ? listenerId : userId
              );

              if (listener.socketId) {
                io.to(listener.socketId).emit("receiveChatRequest", {
                  userId: userId,
                  listenerId: listenerId,
                  state: "requested",
                  requestBy: requestedBy === "listener" ? listenerId : userId,
                  type: type,
                });
              }

              if (user?.socketId) {
                io.to(user.socketId).emit("receiveChatRequest", {
                  userId: userId,
                  listenerId: listenerId,
                  state: "requested",
                  requestBy: requestedBy === "listener" ? listenerId : userId,
                  type: type,
                });
              }
            } else {
              logAndEmit(socket, "error", {
                message: "Listener unavailable or in a chat",
              });
            }
          } catch (error) {
            console.error("Error checking wallet balance:", error);
            logAndEmit(socket, "error", {
              message: "Unable to process request. Please try again later.",
            });
          }
        }
      );

      socket.on(
        "accept-request",
        async ({ userId, listenerId, type, acceptedBy }) => {
          console.log(`Accept Request from ${userId} to ${listenerId}`);

          const userSocket = activeUsers[userId]?.socketId;
          const listenerSocket = activeUsers[listenerId]?.socketId;
          console.log("userSocket", userSocket);
          console.log("listenerSocket", listenerSocket);
          console.log("active-users", activeUsers);
          if (userSocket && listenerSocket) {
            activeUsers[listenerId].status = "in_chat";
            activeUsers[userId].status = "in_chat";
            console.log("active-users", activeUsers);
            io.to(userSocket).emit("requestAccepted", {
              userId: userId,
              listenerId: listenerId,
              state: "accepted",
              type: type,
              acceptedBy: acceptedBy === "listener" ? listenerId : userId,
            });

            io.to(listenerSocket).emit("requestAccepted", {
              userId: userId,
              listenerId: listenerId,
              state: "accepted",
              type: type,
              acceptedBy: acceptedBy === "listener" ? listenerId : userId,
            });

            try {
              const {
                startSessionSocket,
              } = require("../controllers/user/session/session");
              const { roomID, token, sessionId, initialDuration } =
                await startSessionSocket({
                  user_id: userId,
                  listener_id: listenerId,
                  type: type,
                  io,
                  activeUsers,
                });
              console.log(
                "-------------",
                acceptedBy === "listener" ? listenerId : userId
              );

              io.to(userSocket).emit("sessionStarted", {
                roomID,
                token,
                sessionId,
                initialDuration,
                type,
                acceptedBy: acceptedBy === "listener" ? listenerId : userId,
              });

              io.to(listenerSocket).emit("sessionStarted", {
                roomID,
                token,
                sessionId,
                initialDuration,
                type,
                acceptedBy: acceptedBy === "listener" ? listenerId : userId,
              });
            } catch (error) {
              logAndEmit(socket, "error", { message: error.message });
            }
          } else {
            logAndEmit(socket, "error", {
              message: "User or listener socket not connected",
            });
          }
        }
      );

      socket.on(
        "reject-request",
        async ({ userId, listenerId, rejectedBy, type }) => {
          console.log(`Reject Request from ${userId} by ${rejectedBy}`);
          console.log("active-users", activeUsers);
          const userSocket = activeUsers[userId]?.socketId;
          const listenerSocket = activeUsers[listenerId]?.socketId;
          console.log("userSocket", userSocket);
          console.log("listenerSocket", listenerSocket);
          if (userSocket && listenerSocket) {
            console.log(
              "------------------in condition------------------------"
            );
            if (
              activeUsers[listenerId].status === "requested" &&
              activeUsers[userId].status === "requested"
            ) {
              console.log("----------------endsession------------------------");
              activeUsers[listenerId].status = "available";
              activeUsers[userId].status = "available";
      
             
              if (rejectedBy === "listener") {
                try {
                 
                  await Leaves.create({
                    userId: userId,
                    listenerId: listenerId,
                    rejectedAt: new Date(), 
                  });
                  console.log("Rejection stored successfully.");
                } catch (error) {
                  console.error("Error storing rejection:", error);
                }
              }
      
             
              console.log(
                "-------------",
                rejectedBy === "listener" ? listenerId : userId
              );
              io.to(userSocket).emit("requestRejected", {
                userId: userId,
                listenerId: listenerId,
                state: "rejected",
                processBy: rejectedBy === "listener" ? listenerId : userId,
                time: new Date(),
                type: type,
              });
      
              io.to(listenerSocket).emit("requestRejected", {
                userId: userId,
                listenerId: listenerId,
                state: "rejected",
                processBy: rejectedBy === "listener" ? listenerId : userId,
                type: type,
                time: new Date(),
              });
            }
          } else {
            logAndEmit(socket, "error", {
              message: "User or listener socket not connected",
            });
          }
        }
      );
      

      socket.on(
        "session-end",
        async ({ userId, listenerId, rejectedBy, sessionId, reason, type }) => {
          console.log(`Reject Request from ${userId} by ${rejectedBy}`);
          console.log("active-users", activeUsers);
          const userSocket = activeUsers[userId]?.socketId;
          const listenerSocket = activeUsers[listenerId]?.socketId;
          console.log("userSocket", userSocket);
          console.log("litenerSocket", listenerSocket);
          if (userSocket && listenerSocket) {
            console.log(
              "------------------in condition------------------------"
            );
            if (
              activeUsers[listenerId].status === "in_chat" &&
              activeUsers[userId].status === "in_chat"
            ) {
              console.log("----------------endsession------------------------");

              const {
                endSession,
              } = require("../controllers/user/session/session");
              await endSession({ sessionId: sessionId, reason: reason }).then(
                (result) => {
                  activeUsers[listenerId].status = "available";
                  activeUsers[userId].status = "available";
                }
              );
              const sessionData = await Session.findOne({
                where: { id: sessionId },
              });
              console.log("sessionData", sessionData);
              console.log(
                "-------------",
                rejectedBy === "listener" ? listenerId : userId
              );

              io.to(userSocket).emit("sessionEnded", {
                userId: userId,
                listenerId: listenerId,
                sessionId: sessionId,
                reason: reason,
                type: type,
                sessionEndedBy: rejectedBy === "listener" ? listenerId : userId,
                start: sessionData.start_time,
                end: sessionData.end_time,
              });

              io.to(listenerSocket).emit("sessionEnded", {
                userId: userId,
                listenerId: listenerId,
                sessionId: sessionId,
                type: type,
                reason: reason,
                sessionEndedBy: rejectedBy === "listener" ? listenerId : userId,
                start: sessionData.start_time,
                end: sessionData.end_time,
              });
            }
          } else {
            logAndEmit(socket, "error", {
              message: "User or listener socket not connected",
            });
          }
        }
      );
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
      socket.on("endSession", async ({ sessionId, reason }) => {
        try {
          await sessionController.endSession({ sessionId, reason });
          logAndEmit(socket, "sessionEnded", {
            sessionId: sessionId,
            reason: reason,
          });
        } catch (error) {
          logAndEmit(socket, "error", { message: error.message });
        }
      });

      // Handle disconnect
      socket.on("disconnect", async () => {
        console.log(`Client disconnected: ${socket.id}`);

        for (const userId in activeUsers) {
          console.log("user", userId);
          if (activeUsers[userId].socketId === socket.id) {
            console.log(`User ${userId} disconnected.`);

            try {
              const user = await Auth.findOne({
                where: { id: userId, role: "listener" },
              });

              if (
                (user && user.is_audio_call_option === true) ||
                user.is_chat_option === true ||
                user.is_video_call_option === true
              ) {
                await Auth.update(
                  {
                    is_video_call_option: false,
                    is_audio_call_option: false,
                    is_chat_option: false,
                  },
                  { where: { id: userId, role: "listener" } }
                );

                console.log(`Listener ${userId}'s availability set to false.`);
              } else {
                console.log(`Listener ${userId}'s disconnected`);
              }
            } catch (error) {
              console.error(
                "Error updating listener availability status:",
                error
              );
            }

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
