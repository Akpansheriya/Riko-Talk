const admin = require('../../../config/firebase');
const Database = require("../../../connections/connection");
const Notification = Database.notification
  
const sendNotification = async (req, res) => {
    const { title, body, token } = req.body;
  
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token, 
    };
  
    try {
      const response = await admin.messaging().send(message);
      res.status(200).json({ success: true, message: "Notification sent successfully", response });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error sending notification", error });
    }
  };

  const notifications = async (req, res) => {
    try {
      const notifications = await Notification.findAll({});
      res.status(200).send({
        message: "notifications list",
        notifications: notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).send({
        message: "Error fetching notifications",
        error: error,
      });
    }
  };


  module.exports = {sendNotification,notifications}