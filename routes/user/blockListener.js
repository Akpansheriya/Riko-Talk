const express = require("express");
const blcokListener = require("../../controllers/user/block_listener/blockListener");
const blockListenerControllerRouter = express.Router();

blockListenerControllerRouter.post("/block/listener", blcokListener.blockListener);

module.exports = blockListenerControllerRouter;
