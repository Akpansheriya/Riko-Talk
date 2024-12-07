
const Database = require("../../../connections/connection");
const adminWallet = Database.adminWallet;

const createWallet = async (req, res) => {
    const { admin_id, balance } = req.body;
  
    try {
      const newWallet = await adminWallet.create({
        admin_id,
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
  const { admin_id } = req.params;
  try {
    const wallet = await adminWallet.findOne({ where: { admin_id } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching wallet balance' });
  }
};


module.exports = {getWalletBalance,createWallet}