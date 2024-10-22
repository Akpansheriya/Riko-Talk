const crypto = require("crypto");
const Database = require("../../../connections/connection");
const Session = Database.session;
const User = Database.user;
const Wallet = Database.wallet;
const { generateToken04 } = require("../../../services/zegoCloudService");
const socketService = require("../../../services/socketService");
const appID = 886950579;
const serverSecret = "5037c5dc318b8483b6c0229c44564e38";

const sessionIntervals = new Map();

const startSession = async (req, res) => {
  const { user_id, listener_id } = req.body;

  try {
    const user = await User.findOne({ where: { id: user_id, role: "user" } });
    const listener = await User.findOne({
      where: { id: listener_id, role: "listener" },
    });

    if (!user || !listener) {
      return res.status(404).json({ message: "User or listener not found" });
    }

    if (listener.is_session_running) {
      return res
        .status(400)
        .json({ message: "Listener is already in a session" });
    }

    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    if (wallet.balance < 3) {
      return res
        .status(400)
        .json({ message: "Insufficient wallet balance (Minimum ₹3 required)" });
    }

    const roomID = `${user.id}-${listener.id}-${Date.now()}`;
    const session = await Session.create({
      user_id: user.id,
      listener_id: listener.id,
      room_id: roomID,
      start_time: new Date(),
      status: "active",
      total_duration: 0,
      amount_deducted: 0,
    });

    listener.is_session_running = true;
    await listener.save();

    const payload = {
      app_id: appID,
      room_id: roomID,
      user_id: user.id,
      privilege: {
        1: 1,
        2: 1,
      },
    };
    const token = generateToken04(appID, user.id, serverSecret, 3600, payload);

    socketService.startSessionSocket(roomID, token);

    socketService.emitSessionData(roomID, {
      sessionId: session.id,
      duration: session.total_duration,
      balance: wallet.balance,
      amountDeducted: session.amount_deducted,
    });

    let elapsedTimeInSeconds = 0;
    const deductionPerSecond = 3 / 60;

    const interval = setInterval(async () => {
      const wallet = await Wallet.findOne({
        where: { user_id: session.user_id },
      });

      if (!wallet || wallet.balance < deductionPerSecond) {
        await endSession(session.id, "Insufficient wallet balance");
        clearInterval(interval);
        sessionIntervals.delete(session.id);
      } else {
        wallet.balance -= deductionPerSecond;
        elapsedTimeInSeconds += 1;
        session.amount_deducted += deductionPerSecond;

        if (elapsedTimeInSeconds % 60 === 0) {
          session.total_duration += 1;
        }

        await wallet.save();
        await session.save();

        socketService.emitSessionData(roomID, {
          sessionId: session.id,
          duration: session.total_duration,
          balance: wallet.balance,
          amountDeducted: session.amount_deducted,
        });
      }
    }, 1000);

    sessionIntervals.set(session.id, interval);
    res.json({ roomID, token, initialDuration: session.total_duration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting session" });
  }
};
const startSessionSocket = async ({ user_id, listener_id, type }) => {
  try {
    const user = await User.findOne({ where: { id: user_id, role: "user" } });
    const listener = await User.findOne({ where: { id: listener_id, role: "listener" } });

    if (!user || !listener) throw new Error("User or listener not found");
    if (listener.is_session_running) throw new Error("Listener is already in a session");

    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (!wallet || wallet.balance < 3) throw new Error("Insufficient wallet balance");

    const roomID = `${user.id}-${listener.id}-${Date.now()}`;
    const session = await Session.create({
      user_id: user.id,
      listener_id: listener.id,
      room_id: roomID,
      type: type,
      start_time: new Date(),
      status: "active",
      total_duration: 0.0, // Initially set as 0.0 (in minutes)
      amount_deducted: 0,
    });

    listener.is_session_running = true;
    user.is_session_running = true;
    await user.save();
    await listener.save();

    const payload = {
      app_id: appID,
      room_id: roomID,
      user_id: user.id,
      privilege: { 1: 1, 2: 1 },
    };
    const token = generateToken04(appID, user.id, serverSecret, 3600, payload);

    socketService.startSessionSocket(roomID, token);

    socketService.emitSessionData(roomID, {
      sessionId: session.id,
      duration: session.total_duration,
      balance: wallet.balance,
      amountDeducted: session.amount_deducted,
    });

    let elapsedTimeInSeconds = 0;
    const deductionPerSecond = 3 / 60;

    const interval = setInterval(async () => {
      try {
        const wallet = await Wallet.findOne({ where: { user_id: session.user_id } });

        if (!wallet || wallet.balance < deductionPerSecond) {
          // Send low balance event and end the session
          socketService.startSessionSocket({
            event: "lowBalance",
            message: "Insufficient wallet balance",
            userId: user.id,
            listenerId: listener.id,
          });

          await endSession({sessionId:session.id, reason:"Insufficient wallet balance"});
          clearInterval(interval);
          sessionIntervals.delete(session.id);
        } else {
          wallet.balance -= deductionPerSecond;
          session.amount_deducted += deductionPerSecond;
          elapsedTimeInSeconds++;

          // Convert elapsed time to a float representation of minutes
          const minutes = Math.floor(elapsedTimeInSeconds / 60);
          const seconds = elapsedTimeInSeconds % 60;
          const formattedDuration = parseFloat(`${minutes}.${seconds < 10 ? '0' : ''}${seconds}`);

          // Update the total_duration to be a float like "1.05" for 1 minute and 5 seconds
          session.total_duration = formattedDuration;

          await wallet.save();
          await session.save();

          // Emit the updated session data
          socketService.emitSessionData(roomID, {
            sessionId: session.id,
            duration: session.total_duration,
            balance: wallet.balance,
            amountDeducted: session.amount_deducted,
          });
        }
      } catch (error) {
        console.error("Error during session interval:", error.message);
        clearInterval(interval);
        sessionIntervals.delete(session.id);
      }
    }, 1000); // Run every second

    sessionIntervals.set(session.id, interval);

    return { roomID, token, initialDuration: session.total_duration, sessionId: session.id };
  } catch (error) {
    console.error("Error starting session:", error.message);
    throw error;
  }
};

const endSession = async ({sessionId, reason}) => {
  try {
    const session = await Session.findOne({ where: { id: sessionId } });
    if (session && session.status === "active") {
      session.status = "completed";
      session.end_time = new Date();
      await session.save();

      const listener = await User.findByPk(session.listener_id);
      const user = await User.findByPk(session.user_id);
      listener.is_session_running = false;
      user.is_session_running = false;
      await user.save();
      await listener.save();

      if (sessionIntervals.has(session.id)) {
        clearInterval(sessionIntervals.get(session.id));
        sessionIntervals.delete(session.id);
      }

      socketService.endSessionSocket(session.room_id, reason);
    }
  } catch (error) {
    console.error("Error ending session:", error);
  }
};

const endSessionManually = async (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    const session = await Session.findOne({ where: { id: sessionId } });
    if (session && session.status === "active") {
      session.status = "completed";
      session.end_time = new Date();
      await session.save();

      const listener = await User.findByPk(session.listener_id);
      listener.is_session_running = false;
      await listener.save();

      if (sessionIntervals.has(session.id)) {
        clearInterval(sessionIntervals.get(session.id));
        sessionIntervals.delete(session.id);
      }

      socketService.endSessionSocket(session.room_id, reason);

      res.status(200).send({ message: "Session ended" });
    } else {
      res.status(404).json({ message: "Session not found or already ended" });
    }
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: "Error ending session" });
  }
};

let activeCalls = {};

const joinCall = (req, res) => {
  const { userId, listenerId, type, status } = req.body;

  if (activeCalls[listenerId]) {
    return res.json({ message: "Listener is already in a call." });
  }

  activeCalls[listenerId] = {
    userId,
    listenerId,
    socketId: "fake-socket-id",
    type,
    status,
  };

  return res.json({
    message: "Call started successfully",
    userId,
    listenerId,
  });
};

const updateCallStatus = (req, res) => {
  const { listenerId, status } = req.body;

  if (activeCalls[listenerId]) {
    if (status === "accepted") {
      return res.json({ message: "Call accepted", listenerId });
    } else if (status === "rejected") {
      delete activeCalls[listenerId];
      return res.json({ message: "Call rejected", listenerId });
    }
  }

  return res.json({ message: "No active call found." });
};

const endCall = (req, res) => {
  const { listenerId } = req.body;

  if (activeCalls[listenerId]) {
    delete activeCalls[listenerId];
    return res.json({ message: "Call has ended.", listenerId });
  }

  return res.json({ message: "No active call to end." });
};

module.exports = {
  startSession,
  startSessionSocket,
  endSession,
  endSessionManually,
  joinCall,
  updateCallStatus,
  endCall,
};
