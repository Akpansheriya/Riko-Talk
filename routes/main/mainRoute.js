const express = require("express");
const userRouter = require("../auth/auth");
const supportRouter = require("../admin/support/support");
const contactRouter = require("../admin/contact/contact");
const coupenRouter = require("../admin/coupen/coupen");
const feedbackRouter = require("../user/feedback");
const listenerRouter = require("../admin/listener/listener");
const walletRouter = require("../user/wallet");
const notificationRouter = require("../notification/notification");
const sessionRouter = require("../user/session");
const blockListenerRouter = require("../user/blockListener");
const queriesRouter = require("../admin/queries/query");
const routers = express.Router();

//Define all routers here

routers.use("/user", userRouter,blockListenerRouter);
routers.use("/support", supportRouter);
routers.use("/contact", contactRouter);
routers.use("/coupen", coupenRouter);
routers.use("/feedback", feedbackRouter);
routers.use("/listener", listenerRouter);
routers.use("/session", sessionRouter);
routers.use("/wallet", walletRouter);
routers.use("/notification", notificationRouter);
routers.use("/queries", queriesRouter );
module.exports = routers;
