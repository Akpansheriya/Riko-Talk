const express = require("express");
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const routers = require("./routes/main/mainRoute");
const { sequelize } = require("./connections/connection");
const schedule = require("node-schedule");
const socketService = require("./services/socketService");
const { calculateDailyActiveTime, deleteOldInactiveUsers } = require("./helpers/job");

dotenv.config({ path: "./connections/config.env" });

const app = express();
const port = process.env.PORT || 2000;
const server = http.createServer(app);

socketService.initSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

app.use("/api/v1", routers);

app.get("/", (req, res) => {
  res.send("Hello from backend side");
});

sequelize
  .sync()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("Error synchronizing models:", err));

schedule.scheduleJob("0 0 * * *", () => {
  calculateDailyActiveTime()
  deleteOldInactiveUsers()
});
