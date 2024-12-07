const express = require("express");
const walletController = require("../../../controllers/admin/adminWallet/adminWallet");
const walletControllerRouter = express.Router();

walletControllerRouter.get(
  "/:admin_id/balance",
  walletController.getWalletBalance
);
walletControllerRouter.post("/create", walletController.createWallet);

module.exports = walletControllerRouter;
