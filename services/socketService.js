const { Server } = require("socket.io");

const { recentUsersList, accountFreeze } = require("../controllers/auth/auth");
const Database = require("../connections/connection");
const Wallet = Database.wallet;
const Session = Database.session;
const Auth = Database.user;
const BlockedListener = Database.blockListener;
const BlockedUser = Database.blockUser;
const Leaves = Database.sessionRejections;
const { Op } = require("sequelize");
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
        ({ page, pageSize, gender, service, topic, age }) => {
          listenersList(socket, {
            page,
            pageSize,
            gender,
            service,
            topic,
            age,
          });
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

      socket.on("user-login", async(data) => {
        const userId = data.userId;
        if (typeof userId !== "string") {
          logAndEmit(socket, "error", { message: "Invalid user ID format" });
          return;
        }
        const status = await Auth.findOne({ where: { id: userId } });
        console.log("status",status)
        if (status.role === "user") {
          Auth.update(
            {
              is_online: true,
            },
            { where: { id: userId } }
          );
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
            const blockListener = await BlockedListener.findOne({
              where: { listenerId: listenerId, userId: userId },
            });
            const blocksUser = await BlockedUser.findOne({
              where: { listenerId: listenerId, userId: userId },
            });
            const listenerFreeze = await Auth.findOne({
              where: { id: listenerId, account_freeze: true },
            });
            const userFreeze = await Auth.findOne({
              where: { id: userId, account_freeze: true },
            });
            if (listenerFreeze && userFreeze) {
              logAndEmit(socket, "error", {
                message: "both listener and user account freeze by system",
              });
              return;
            }
            if (listenerFreeze) {
              logAndEmit(socket, "error", {
                message: "listener account freeze by system",
              });
              return;
            }
            if (userFreeze) {
              logAndEmit(socket, "error", {
                message: "user account freeze by system",
              });
              return;
            }
            if (blocksUser && blockListener) {
              logAndEmit(socket, "error", {
                message: "both listener and user block by each other",
              });
              return;
            }
            if (blocksUser) {
              logAndEmit(socket, "error", {
                message: "listener blocked this user ",
              });
              return;
            }
            if (blockListener) {
              logAndEmit(socket, "error", {
                message: "user blocked this listener ",
              });
              return;
            }
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
                endSession,
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
          if (activeUsers[userId].socketId === socket.id) {
            console.log(`User ${userId} disconnected.`);

            try {
              const user = await Auth.findOne({
                where: { id: userId, role: "listener" },
              });

              const activeSession = await Session.findOne({
                where: {
                  [Op.or]: [{ user_id: userId }, { listener_id: userId }],
                  status: "active",
                },
              });

              if (activeSession) {
                const {
                  user_id: sessionUserId,
                  listener_id: sessionListenerId,
                  id: sessionId,
                } = activeSession;

                if (activeUsers[sessionUserId])
                  activeUsers[sessionUserId].status = "available";
                if (activeUsers[sessionListenerId])
                  activeUsers[sessionListenerId].status = "available";

                const userSocket = activeUsers[sessionUserId]?.socketId;
                const listenerSocket = activeUsers[sessionListenerId]?.socketId;

                const sessionEndPayload = {
                  userId: sessionUserId,
                  listenerId: sessionListenerId,
                  sessionId: sessionId,
                  reason: "Socket disconnected",
                  type: activeSession.type,
                  sessionEndedBy: "system",
                  start: activeSession.start_time,
                  end: new Date(),
                };

                if (userSocket)
                  io.to(userSocket).emit("sessionEnded", sessionEndPayload);
                if (listenerSocket)
                  io.to(listenerSocket).emit("sessionEnded", sessionEndPayload);

                const {
                  endSession,
                } = require("../controllers/user/session/session");
                await endSession({
                  sessionId: sessionId,
                  reason: "Socket disconnected",
                });
              }
              console.log("userId",userId)
              console.log("user",user)
           const status = await Auth.findOne({where:{id:userId}})
           if(status.role  === "user") {
                await Auth.update(
                  {
                    is_online: false,
                    last_seen:new Date()
                  },
                  { where: { id: userId } }
                );
              }
              if (
                user &&
                (user.is_audio_call_option === true ||
                  user.is_chat_option === true ||
                  user.is_video_call_option === true)
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
                console.log(`Listener ${userId} disconnected.`);
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
const getSocket = () => io;
const safeParseJSON = (value) => {
  try {
    const parsedValue = JSON.parse(value);
    return typeof parsedValue === "string"
      ? JSON.parse(parsedValue)
      : parsedValue;
  } catch (error) {
    console.warn("Failed to parse JSON:", value);
    return []; // Return an empty array if parsing fails
  }
};

const listenersList = async (
  socket,
  { page = 1, pageSize = 10, gender, age, service = [], topic = [] }
) => {
  try {
    const offset = (page - 1) * pageSize;

    // Log the incoming parameters for debugging
    console.log("Incoming Request:", {
      page,
      pageSize,
      gender,
      service,
      topic,
      age,
    });

    // Fetch all listener users without applying filters in the query
    const { count: totalRecords, rows: users } =
      await Database.user.findAndCountAll({
        where: {
          role: "listener",
        },
        attributes: {
          exclude: [
            "referal_code",
            "role",
            "otp",
            "country_code",
            "isVerified",
            "mobile_number",
            "email",
            "fcm_token",
            "token",
            "listener_request_status",
            "deactivateDate",
          ],
        },
        include: [
          {
            model: Database.listenerProfile,
            as: "listenerProfileData",
            required: false,
          },
          {
            model: Database.feedback,
            as: "ratingData",
            required: false,
          },
          {
            model: Database.session,
            as: "listenerSessionData",
            required: false,
          },
        ],
      });

    // Apply manual filters (case-insensitive)
    let filteredUsers = users;

    // Filter by gender
    if (gender) {
      const lowerCaseGender = gender.toLowerCase();
      filteredUsers = filteredUsers.filter((user) => {
        const listenerProfile = user.listenerProfileData?.[0];
        return (
          listenerProfile &&
          listenerProfile.gender?.toLowerCase() === lowerCaseGender
        );
      });
    }

    // Filter by service (array-based matching)
    if (Array.isArray(service) && service.length > 0) {
      const lowerCaseServices = service.map((s) => s.toLowerCase());
      filteredUsers = filteredUsers.filter((user) => {
        const listenerProfile = user.listenerProfileData?.[0];
        if (listenerProfile?.service) {
          const parsedService = safeParseJSON(listenerProfile.service);
          if (Array.isArray(parsedService)) {
            return parsedService.some((s) =>
              lowerCaseServices.includes(s.toLowerCase())
            );
          }
        }
        return false;
      });
    }

    // Filter by topic (array-based matching)
    if (Array.isArray(topic) && topic.length > 0) {
      const lowerCaseTopics = topic.map((t) => t.toLowerCase());
      filteredUsers = filteredUsers.filter((user) => {
        const listenerProfile = user.listenerProfileData?.[0];
        if (listenerProfile?.topic) {
          const parsedTopic = safeParseJSON(listenerProfile.topic);
          if (Array.isArray(parsedTopic)) {
            return parsedTopic.some((t) =>
              lowerCaseTopics.includes(t.toLowerCase())
            );
          }
        }
        return false;
      });
    }

    // Filter by age range
    if (age) {
      const [minAge, maxAge] = age.split("-").map((age) => parseInt(age));
      console.log("Applying age filter:", { minAge, maxAge });
      filteredUsers = filteredUsers.filter((user) => {
        const listenerProfile = user.listenerProfileData?.[0];
        if (listenerProfile?.age != null) {
          const profileAge = listenerProfile.age;
          return profileAge >= minAge && profileAge <= maxAge;
        }
        return true; // Include users without age
      });
    }

    // Paginate after applying filters
    const paginatedUsers = filteredUsers.slice(offset, offset + pageSize);
    const totalFilteredRecords = filteredUsers.length;

    const processedUsers = paginatedUsers.map((user) => {
      const listenerProfile = user.listenerProfileData?.[0] || null;

      const parsedTopic = listenerProfile?.topic
        ? safeParseJSON(listenerProfile.topic)
        : [];
      const parsedService = listenerProfile?.service
        ? safeParseJSON(listenerProfile.service)
        : [];

      const listenerProfileUpdate = {
        id: listenerProfile?.id || null,
        listenerId: listenerProfile?.listenerId || null,
        displayName: listenerProfile?.display_name || null,
        nichName: listenerProfile?.nick_name || null,
        gender: listenerProfile?.gender || null,
        age: listenerProfile?.age || null,
        topic:
          Array.isArray(parsedTopic) && parsedTopic.length > 0
            ? parsedTopic
            : [],
        service:
          Array.isArray(parsedService) && parsedService.length > 0
            ? parsedService
            : [],
        about: listenerProfile?.about || null,
        image: listenerProfile?.image || null,
      };

      const feedbacks = user.ratingData || [];
      const totalFeedbacks = feedbacks.length;

      const starCounts = [0, 0, 0, 0, 0];
      let totalStars = 0;

      feedbacks.forEach((feedback) => {
        const rating = feedback.rating;
        if (rating >= 1 && rating <= 5) {
          starCounts[rating - 1] += 1;
          totalStars += rating;
        }
      });

      const averageRating = totalFeedbacks
        ? (totalStars / totalFeedbacks).toFixed(2)
        : 0;

      let totalDurationMinutes = 0;
      const sessions = user.listenerSessionData || [];
      sessions.forEach((session) => {
        totalDurationMinutes += session.total_duration;
      });

      let formattedDuration;
      if (totalDurationMinutes < 1) {
        formattedDuration = `${(totalDurationMinutes * 60).toFixed(0)} seconds`;
      } else if (totalDurationMinutes < 60) {
        formattedDuration = `${totalDurationMinutes.toFixed(2)} minutes`;
      } else {
        formattedDuration = `${(totalDurationMinutes / 60).toFixed(2)} hours`;
      }

      const { listenerSessionData, ratingData, ...userWithoutSessions } =
        user.toJSON();

      return {
        ...userWithoutSessions,
        listenerProfileData: listenerProfile ? listenerProfileUpdate : null,
        feedbackStats: {
          totalCount: totalFeedbacks,
          averageRating: parseFloat(averageRating),
        },
        sessionStats: {
          totalDurationMinutes,
          formattedDuration,
        },
      };
    });

    socket.emit("listenersList", {
      totalRecords: totalFilteredRecords,
      totalPages: Math.ceil(totalFilteredRecords / pageSize),
      currentPage: page,
      pageSize,
      users: processedUsers,
    });
  } catch (error) {
    console.error("Error fetching listeners list:", error);
    socket.emit("error", { message: "Internal server error" });
  }
};

const storyList = async (socket, { page, pageSize }) => {
  try {
    const offset = (page - 1) * pageSize;

    const { count: totalRecords, rows: listenerStories } =
      await Database.story.findAndCountAll({
        where: { is_approved: true },
        include: [
          {
            model: Database.listenerProfile,
            as: "listenerStoryData",
            required: false,
            attributes: ["nick_name", "display_name", "display_image"],
          },
        ],
        limit: parseInt(pageSize),
        offset: parseInt(offset),
      });

    const flattenedStories = listenerStories.map((story) => {
      const { listenerStoryData, ...storyData } = story.toJSON();
      return {
        ...storyData,
        nick_name: listenerStoryData?.nick_name || null,
        display_name: listenerStoryData?.display_name || null,
        display_image: listenerStoryData?.display_image || null,
      };
    });

    socket.emit("storyList", {
      message: "Stories fetched successfully",
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
      StoriesList: flattenedStories,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    socket.emit("error", {
      message: "Error fetching stories",
      error: error.message,
    });
  }
};

module.exports = {
  initSocket,
  startSessionSocket,
  emitSessionData,
  endSessionSocket,
  getSocket,
  storyList,
};
