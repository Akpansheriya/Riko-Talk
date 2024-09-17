
const Database = require("../../../connections/connection");
const Wallet = Database.wallet;

const createWallet = async (req, res) => {
    const { user_id, balance } = req.body;
  
    try {
      const newWallet = await Wallet.create({
        user_id,
        balance,
      });
      res.status(201).json({
        message: 'Wallet created successfully',
        wallet: newWallet,
      });
    } catch (error) {
      console.error('Error creating wallet:', error);
      res.status(500).json({
        message: 'Error creating wallet',
        error: error.message,
      });
    }
  };
const getWalletBalance = async (req, res) => {
  const { user_id } = req.params;
  try {
    const wallet = await Wallet.findOne({ where: { user_id } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching wallet balance' });
  }
};


module.exports = {getWalletBalance,createWallet}