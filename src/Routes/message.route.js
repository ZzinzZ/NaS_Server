const express = require("express");
const upload = require("../middlewares/cloudinaryMiddleware");
const messageController = require("../Controllers/message.controller");
const uploadFile = require("../middlewares/uploadFile");

const router = express.Router();

//create message
router.post("/send/:chatId",upload.array("images"),messageController.createMessage);
//send file
router.post("/file/send/:chatId", uploadFile.array("files"), messageController.sendFile);
//call message
router.post("/call/:chatId", messageController.createCallMessage);
// get message
router.get("/conversation/:chatId/:userId", messageController.getMessages);
//remove message
router.put("/remove/:messageId", messageController.removeMessage);
// delete message
router.patch("/delete-soft/:messageId", messageController.deleteSoftMessage);
// mark as seen
router.patch("/seen/:messageId", messageController.markAsSeen);
//react message
router.patch("/react/:messageId", messageController.reactMessage);
//get message seen list user
router.get("/seen-list/:messageId", messageController.getMessageListSeenUsers);
//get message react list user
router.get("/react-list/:messageId", messageController.getUserReactedMessage);
//reply to message
router.post(
  "/reply/:messageId",
  upload.array("images"),
  messageController.replyMessage
);
//count unread messages
router.get(
  "/unread/count/:chatId/:userId",
  messageController.countUnreadMessages
);
//count total unread messages

router.get(
  "/total-unread/count/:userId",
  messageController.countTotalUnreadMessages
);
//delete chat message
router.put("/chat-soft-delete", messageController.deleteChatMessages);

//find chat message
router.get("/find/:chatId", messageController.findMessageByKeyword);

module.exports = router;
