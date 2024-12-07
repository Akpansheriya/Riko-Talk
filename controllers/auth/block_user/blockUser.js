const Database = require("../../../connections/connection");
const  BlockedUser = Database.blockUser;



const blockUser = async (req, res) => {
    const { userId, listenerId } = req.body;
  
    try {
      const existingBlock = await BlockedUser.findOne({ where: { userId, listenerId } });
  
      if (existingBlock) {
        return res.status(400).json({ message: 'User is already blocked by this Listener.' });
      }
      const blockEntry = await BlockedUser.create({ userId, listenerId });
  
      return res.status(200).json({ message: 'User blocked successfully.', blockEntry });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while blocking the listener.' });
    }
  }

  module.exports = {
    blockUser
  }