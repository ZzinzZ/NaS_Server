const express = require('express');
const upload = require('../middlewares/cloudinaryMiddleware');
const chatController = require('../Controllers/chat.controller');

const router = express.Router();

//create private chat
router.post('/private', chatController.createPrivateChat);
//create group chat
router.post('/group', chatController.createGroupChat);
//get details
router.get('/details/:chatId', chatController.getChatDetails);
//change group name 
router.patch('/group/chat-name/:chatId', chatController.updateChatName);
// change group avatar
router.patch('/group/chat-avatar/:chatId',upload.single("avatar"), chatController.updateChatAvatar);
//add members
router.post('/group/members/:chatId', chatController.addMember);
//remove members 
router.delete('/group/members/kick/:chatId', chatController.removeMember);
//leave group
router.delete('/group/members/leave/:chatId', chatController.leaveChat);
//delete chat
router.delete('/group/:chatId', chatController.deleteGroupChat);
//get chat list
router.post('/list/find', chatController.findChatsByChatName);

router.get('/private/find/:userId/:participantId', chatController.findChatByParticipant);

router.get('/list/:userId', chatController.getChatsList);

module.exports = router;