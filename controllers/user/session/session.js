const crypto = require("crypto");
const Database = require("../../../connections/connection");
const Session = Database.session;
const User = Database.user;
const Wallet = Database.wallet;
const { generateToken04 } = require("../../../services/zegoCloudService");
const socketService = require("../../../services/socketService");
const appID = 886950579;
const serverSecret = "0123456789abcdef0123456789abcdef";

const sessionIntervals = new Map();

const startSession = async (req, res) => {
  const { user_id, listener_id } = req.body;

  try {
    const user = await User.findByPk(user_id);
    const listener = await User.findByPk(listener_id);
    if (!user || !listener) {
      return res.status(404).json({ message: "User or listener not found" });
    }

    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    if (wallet.balance < 1) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
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

    const interval = setInterval(async () => {
      const wallet = await Wallet.findOne({
        where: { user_id: session.user_id },
      });

      if (!wallet || wallet.balance < 1) {
        await endSession(session.id, "Insufficient wallet balance");
        clearInterval(interval);
        sessionIntervals.delete(session.id);
      } else {
        wallet.balance -= 1;
        session.total_duration += 1;
        session.amount_deducted += 1;
        await wallet.save();
        await session.save();
      }
    }, 60000);

    sessionIntervals.set(session.id, interval);

    res.json({ roomID, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting session" });
  }
};

const endSession = async (sessionId, reason) => {
  try {
    const session = await Session.findOne({ where: { id: sessionId } });
    if (session && session.status === "active") {
      session.status = "completed";
      session.end_time = new Date();
      await session.save();

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

      if (sessionIntervals.has(sessionId)) {
        clearInterval(sessionIntervals.get(sessionId));
        sessionIntervals.delete(sessionId);
      }

      socketService.endSessionSocket(session.room_id, reason);
      res.status(200).send({
        message: "Session ended",
      });
    } else {
      res.status(404).json({ message: "Session not found or already ended" });
    }
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: "Error ending session" });
  }
};

module.exports = { startSession, endSession, endSessionManually };
