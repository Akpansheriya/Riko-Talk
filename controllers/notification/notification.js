const admin = require('../../config/firebase');

  
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




  module.exports = {sendNotification}