const express = require("express");
const usersController = require("../../controllers/auth/auth");
const listenersController = require("../../controllers/auth/listener_profile_setup/listenerProfileSetup");
const userControllerRouter = express.Router();
const multer = require("multer");

const upload = multer();

userControllerRouter.post("/register", usersController.register);

userControllerRouter.post("/resend-otp", usersController.resendOtp);
// userControllerRouter.post("/login", usersController.login);
// userControllerRouter.post("/verification", usersController.verification);
userControllerRouter.post("/logout", usersController.logout);
userControllerRouter.post("/login", usersController.login2Factor);
userControllerRouter.post("/verification", usersController.verifyOtp2factor);

// listener profile
userControllerRouter.post(
  "/listener-request",
  listenersController.listenerRequest
);
userControllerRouter.post("/form", listenersController.submitForm);
userControllerRouter.post(
  "/set-availability-video-call",
  listenersController.setAvailabilityForVideoCall
);
userControllerRouter.post(
  "/listener-profile-setup",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  listenersController.storeListenerProfile
);

module.exports = userControllerRouter;
