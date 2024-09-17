const express = require("express");
const sessionController = require("../../controllers/user/session/session");
const sessionControllerRouter = express.Router();

sessionControllerRouter.post('/start-session', sessionController.startSession);
sessionControllerRouter.post('/end-session', sessionController.endSessionManually);

module.exports =  sessionControllerRouter;