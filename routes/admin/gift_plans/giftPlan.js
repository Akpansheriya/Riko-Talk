const express = require("express");
const giftPlans = require("../../../controllers/admin/gift_plans/giftPlan");
const giftPlansRouter = express.Router();

giftPlansRouter.post("/add-new-gift-plan", giftPlans.createGiftPlan);
giftPlansRouter.get("/gift-plans-data", giftPlans.getGiftPlans);
giftPlansRouter.put("/update-gift-plan/:id", giftPlans.updateGiftPlan);
giftPlansRouter.delete("/remove-gift-plan/:id", giftPlans.deleteGiftPlan);
module.exports = giftPlansRouter;
