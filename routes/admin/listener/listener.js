const express = require("express");
const listenerController = require("../../../controllers/admin/listener/listener");
const listenerControllerRouter = express.Router();

listenerControllerRouter.get("/listener-request-list", listenerController.listenerRequestList);
listenerControllerRouter.post("/listener-form-link", listenerController.listenerFormLink);
listenerControllerRouter.post("/questions", listenerController.storeQuestions);
listenerControllerRouter.put("/questions/:id", listenerController.updateQuestions);
listenerControllerRouter.post("/listener-request-approval",listenerController.listenerRequestApproval);
listenerControllerRouter.get("/listeners-list", listenerController.listenersList);
listenerControllerRouter.get("/listener-profile/:id", listenerController.listenerProfile);

module.exports =  listenerControllerRouter;