const express = require("express");
const sessionController = require("../../controllers/user/session/session");
const sessionControllerRouter = express.Router();

sessionControllerRouter.post('/startSession', sessionController.startSession);
sessionControllerRouter.post('/endSession', sessionController.endSession);

module.exports =  sessionControllerRouter;