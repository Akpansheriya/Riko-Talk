const express = require("express");
const feedback = require("../../controllers/user/feedback/feedback");
const feedbackControllerRouter = express.Router();

feedbackControllerRouter.post("/feedback", feedback.feedback);
feedbackControllerRouter.delete("/feedback/:id", feedback.deleteFeedback);
module.exports = feedbackControllerRouter;
