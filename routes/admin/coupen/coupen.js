const express = require("express");
const coupenController = require("../../../controllers/admin/coupen/coupen");
const coupenControllerRouter = express.Router();

coupenControllerRouter.post("/coupen", coupenController.coupen);
coupenControllerRouter.get("/coupen-data", coupenController.coupenData);
coupenControllerRouter.put("/coupen/:id", coupenController.updateCoupen);
coupenControllerRouter.delete(
  "/delete-coupen/:id",
  coupenController.deleteCoupen
);
coupenControllerRouter.put(
  "/coupen-status/:id",
  coupenController.toggleCoupenStatus
);

module.exports = coupenControllerRouter;
