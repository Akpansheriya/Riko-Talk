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
userControllerRouter.get("/recent-users", usersController.recentUsersList);
userControllerRouter.get(
  "/profile/:id",
  usersController.ProfilesData
);
userControllerRouter.post("/account-freeze", usersController.accountFreeze);


// listener profile
userControllerRouter.post(
  "/listener-request",
  listenersController.listenerRequest
);
userControllerRouter.post("/form",upload.fields([{name:"resume",maxCount:1}]), listenersController.submitForm);
userControllerRouter.put(
  "/update=charges/:id",
  listenersController.updateCharges
);
userControllerRouter.post(
  "/listener-profile-setup",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "displayImage", maxCount: 1 },
    { name: "adharFront", maxCount: 1 },
    { name: "adharBack", maxCount: 1 },
    { name: "pancard", maxCount: 1 }
   
  ]),
  listenersController.storeListenerProfile
);

module.exports = userControllerRouter;
