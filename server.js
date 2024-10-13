const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const port = process.env.PORT || 2000;
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: "./connections/config.env" });
const routers = require("./routes/main/mainRoute");
const { sequelize } = require("./connections/connection");
const schedule = require("node-schedule");
const sessionController = require("./controllers/user/session/session");
const socketService = require("./services/socketService");

const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1", routers);

app.get("/", (req, res) => {
  res.send("Hello from backend side");
});




socketService.initSocket(server);
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("startSession", async ({ user_id, listener_id }) => {
    try {
      const { roomID, token } = await sessionController.startSession({
        user_id,
        listener_id,
      });
      socket.emit("sessionStarted", { roomID, token });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("endSession", async ({ session_id }) => {
    try {
      await sessionController.endSession(session_id);
      socket.emit("sessionEnded");
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  io.emit("notification", { message: "A new user has connected" });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

sequelize
  .sync()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server and WebSocket listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("Error synchronizing models with the database:", err);
  });

schedule.scheduleJob("0 0 * * *", () => {
  console.log("Running scheduled task: deleteOldInactiveUsers");
  job();
});
