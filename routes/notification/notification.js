const express = require("express");
const notification = require("../../controllers/notification/notification");
const notificationControllerRouter = express.Router();

notificationControllerRouter.post("/notification", notification.sendNotification);

module.exports = notificationControllerRouter;
