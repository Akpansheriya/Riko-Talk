const express = require("express");
const rechargePlans = require("../../../controllers/admin/recharge_plans/recharge");
const rechargePlansRouter = express.Router();

rechargePlansRouter.post("/add-new-recharge-plan", rechargePlans.createNewRecharPlan);
rechargePlansRouter.get("/recharge-plans-data", rechargePlans.plansData);
rechargePlansRouter.put("/update-recharge-plan/:id", rechargePlans.updateRechargePlan);

module.exports = rechargePlansRouter;
