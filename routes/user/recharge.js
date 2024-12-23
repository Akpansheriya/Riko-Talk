const express = require("express");
const rechargeController = require("../../controllers/user/recharge/recharge");
const rechargeControllerRouter = express.Router();

rechargeControllerRouter.post(
  "/recharge",
  rechargeController.recharge
);
rechargeControllerRouter.post("/payment-verify", rechargeController.verifyRecharge);
rechargeControllerRouter.post("/webhook", express.raw({ type: 'application/json' }), rechargeController.webhookHandler);
module.exports = rechargeControllerRouter;
