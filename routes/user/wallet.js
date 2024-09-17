const express = require("express");
const walletController = require("../../controllers/user/wallet/wallet");
const walletControllerRouter = express.Router();

walletControllerRouter.get(
  "/:user_id/balance",
  walletController.getWalletBalance
);
walletControllerRouter.post('/create', walletController.createWallet);

module.exports = walletControllerRouter;
