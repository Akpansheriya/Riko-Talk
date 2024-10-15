const express = require("express");
const queryController = require("../../../controllers/admin/queries/query");
const queryControllerRouter = express.Router();

queryControllerRouter.post("/query", queryController.query);
queryControllerRouter.get("/queries", queryController.queryData);
queryControllerRouter.post("/reply", queryController.reply);
queryControllerRouter.get("/replies", queryController.replyByQueries);

module.exports = queryControllerRouter;
