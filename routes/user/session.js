const express = require("express");
const sessionController = require("../../controllers/user/session/session");
const sessionControllerRouter = express.Router();

sessionControllerRouter.post("/start-session", sessionController.startSession);
sessionControllerRouter.post(
  "/end-session",
  sessionController.endSessionManually
);
sessionControllerRouter.post(
  "/join-call",
  sessionController.joinCall
);
sessionControllerRouter.post(
  "/update-call-status",
  sessionController.updateCallStatus
);
sessionControllerRouter.post(
  "/end-call",
  sessionController.endCall
);
module.exports = sessionControllerRouter;
