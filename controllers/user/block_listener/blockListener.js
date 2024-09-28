const Database = require("../../../connections/connection");
const  BlockedListener = Database.blockListener;



const blockListener = async (req, res) => {
    const { userId, listenerId } = req.body;
  
    try {
      const existingBlock = await BlockedListener.findOne({ where: { userId, listenerId } });
  
      if (existingBlock) {
        return res.status(400).json({ message: 'Listener is already blocked by this user.' });
      }
      const blockEntry = await BlockedListener.create({ userId, listenerId });
  
      return res.status(200).json({ message: 'Listener blocked successfully.', blockEntry });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while blocking the listener.' });
    }
  }

  module.exports = {
    blockListener
  }