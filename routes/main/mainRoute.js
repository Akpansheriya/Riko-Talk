const express = require("express");
const userRouter = require("../auth/auth");
const supportRouter = require("../admin/support/support")
const coupenRouter = require("../admin/coupen/coupen")
const feedbackRouter = require("../user/feedback")
const listenerRouter = require("../admin/listener/listener")
const routers = express.Router();

//Define all routers here

routers.use("/user",userRouter);
routers.use("/support",supportRouter);
routers.use("/coupen",coupenRouter);
routers.use("/feedback",feedbackRouter);
routers.use("/listener",listenerRouter);
module.exports =  routers;
