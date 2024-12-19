const express = require("express");
const gstController = require("../../../controllers/admin/gst/gst");
const gstControllerRouter = express.Router();

gstControllerRouter.post("/gst", gstController.gst);
gstControllerRouter.put("/gst/:id", gstController.editGst);


module.exports = gstControllerRouter;
