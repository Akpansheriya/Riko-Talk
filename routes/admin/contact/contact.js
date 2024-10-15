const express = require("express");
const contactController = require("../../../controllers/admin/contact/contact");
const contactControllerRouter = express.Router();

contactControllerRouter.post("/category", contactController.category);
contactControllerRouter.get("/category-data", contactController.categoryData);
contactControllerRouter.post("/content", contactController.content);
contactControllerRouter.get(
  "/content-by-category/:id",
  contactController.contentDataByCategory
);

module.exports = contactControllerRouter;
