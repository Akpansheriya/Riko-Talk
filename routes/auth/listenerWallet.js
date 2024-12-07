const express = require("express");
const walletController = require("../../controllers/auth/listener_wallet/listenerWallet");
const walletControllerRouter = express.Router();

walletControllerRouter.get(
  "/:listener_id/balance",
  walletController.getWalletBalance
);
walletControllerRouter.post("/create", walletController.createWallet);

module.exports = walletControllerRouter;
