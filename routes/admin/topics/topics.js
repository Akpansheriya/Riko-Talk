const express = require("express");
const topicController = require("../../../controllers/admin/topics/topics");
const topicControllerRouter = express.Router();

topicControllerRouter.post("/topics", topicController.topic);
topicControllerRouter.get("/topics", topicController.topicsData);
topicControllerRouter.put("/topics/:id", topicController.editTopic);
topicControllerRouter.patch("/topics/:id", topicController.toggleTopicStatus);
topicControllerRouter.delete(
  "/topics/:id",
  topicController.deleteTopic
);

module.exports = topicControllerRouter;
