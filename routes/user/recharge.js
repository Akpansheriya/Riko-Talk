const express = require("express");
const rechargeController = require("../../controllers/user/recharge/recharge");
const rechargeControllerRouter = express.Router();

rechargeControllerRouter.post(
  "/recharge",
  rechargeController.recharge
);
rechargeControllerRouter.post("/payment-verify", rechargeController.verifyRecharge);

module.exports = rechargeControllerRouter;
