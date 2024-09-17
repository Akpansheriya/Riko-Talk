
const Database = require("../../../connections/connection");
const Wallet = Database.wallet;

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


module.exports = {getWalletBalance}