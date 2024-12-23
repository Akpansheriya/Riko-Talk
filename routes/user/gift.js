const express = require("express");
const giftController = require("../../controllers/user/gift/gift");
const giftControllerRouter = express.Router();

giftControllerRouter.post(
  "/gift",
  giftController.gift
);
giftControllerRouter.post("/gift-payment-verify", giftController.verifyGiftPayment);
giftControllerRouter.post("/gift-webhook", express.raw({ type: 'application/json' }), giftController.webhookHandler);
module.exports = giftControllerRouter;
