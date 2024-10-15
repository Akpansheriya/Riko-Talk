const express = require("express");
const notification = require("../../controllers/user/notification/notification");
const notificationControllerRouter = express.Router();

notificationControllerRouter.post("/notification", notification.sendNotification);
notificationControllerRouter.get("/notifications-list", notification.notifications);
module.exports = notificationControllerRouter;
