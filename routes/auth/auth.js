const express = require("express");
const usersController = require("../../controllers/auth/auth");
const listenersController = require("../../controllers/auth/listener_profile_setup/listenerProfileSetup");
const userControllerRouter = express.Router();

userControllerRouter.post("/register", usersController.register);
userControllerRouter.post("/login", usersController.login);
userControllerRouter.post("/verification", usersController.verification);
userControllerRouter.post("/logout", usersController.logout);


// listener profile
userControllerRouter.post("/listener-request",listenersController.listenerRequest);
userControllerRouter.post("/form",listenersController.submitForm);
userControllerRouter.post("/listener-profile-setup",listenersController.storeListenerProfile);
module.exports =  userControllerRouter;