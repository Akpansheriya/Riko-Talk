const express = require("express");
const supportController = require("../../../controllers/admin/support/support");
const supportControllerRouter = express.Router();

supportControllerRouter.post("/category", supportController.category);
supportControllerRouter.get("/category-data", supportController.categoryData);
supportControllerRouter.post("/content", supportController.content);
supportControllerRouter.get(
  "/content-by-category/:id",
  supportController.contentDataByCategory
);

module.exports = supportControllerRouter;
