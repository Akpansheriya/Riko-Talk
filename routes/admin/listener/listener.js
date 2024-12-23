const express = require("express");
const listenerController = require("../../../controllers/admin/listener/listener");
const blockuser = require("../../../controllers/auth/block_user/blockUser");
const listenerControllerRouter = express.Router();
const multer = require('multer');


const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
});
listenerControllerRouter.get(
  "/listener-request-list",
  listenerController.listenerRequestList
);
listenerControllerRouter.post(
  "/listener-form-link",
  listenerController.listenerFormLink
);
listenerControllerRouter.post("/questions", listenerController.storeQuestions);
listenerControllerRouter.put(
  "/questions/:id",
  listenerController.updateQuestions
);
listenerControllerRouter.post(
  "/listener-request-approval",
  listenerController.listenerRequestApproval
);
listenerControllerRouter.get(
  "/listeners-list",
  listenerController.listenersList
);
listenerControllerRouter.get(
  "/listener-profile/:id",
  listenerController.listenerProfile
);
listenerControllerRouter.get(
  "/listener-profile-recent/:userId",
  listenerController.listenerProfileRecent
);
listenerControllerRouter.get(
  "/listener-rating-list/:userId",
  listenerController.ratingList
);
listenerControllerRouter.put(
  "/listener-nickname",
  listenerController.updateNickName
);
listenerControllerRouter.post(
  "/story", upload.fields([{ name: 'story', maxCount: 1 }]),
  listenerController.story
);
listenerControllerRouter.post(
  "/approve-story",
  listenerController.approvedStory  
);
listenerControllerRouter.post(
  "/set-availability",
  listenerController.setAvailabilityToggle
);
listenerControllerRouter.post("/story/add-views", listenerController.views)
listenerControllerRouter.get("/story/views-list/:id", listenerController.viewData)
listenerControllerRouter.get("/daily-session-records/:listenerId", listenerController.sessionRecords)
listenerControllerRouter.get("/leaves-record/:listenerId", listenerController.leaveRecords)
listenerControllerRouter.post("/add/user-name", listenerController.addUserName)
listenerControllerRouter.get("/user-names/list/:listenerId", listenerController.userNames)
listenerControllerRouter.post("/block-user", blockuser.blockUser)
module.exports = listenerControllerRouter;
