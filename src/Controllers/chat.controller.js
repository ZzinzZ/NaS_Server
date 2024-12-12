const chatService = require("../Services/chat.service");
const HttpException = require("../core/HttpException");
const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");

const chatController = {
  createPrivateChat: async (req, res, next) => {
    try {
      const { userId, participantId } = req.body;
      const chat = await chatService.createPrivateChat({
        userId,
        participantId,
      });
      res.created(SYS_MESSAGE.SUCCESS, chat);
    } catch (error) {
      next(error);
    }
  },
  createGroupChat: async (req, res, next) => {
    try {
      const { userId, participants, chatName } = req.body;
      const chat = await chatService.createGroupChat({
        userId,
        participants,
        chatName,
      });
      res.created(SYS_MESSAGE.CREATED, chat);
    } catch (error) {
      next(error);
    }
  },
  getChatDetails: async (req, res, next) => {
    try {
      const {chatId} = req.params;
      const chat = await chatService.getChatDetails({ chatId });
      res.ok(SYS_MESSAGE.SUCCESS, chat);
    } catch (error) {
      next(error);
    }
  },
  updateChatName: async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { chatName } = req.body;
      const updatedChat = await chatService.updateChatName({
        chatId,
        chatName,
      });
      res.ok(SYS_MESSAGE.SUCCESS, updatedChat);
    } catch (error) {
      next(error);
    }
  },
  updateChatAvatar: async(req, res, next) => {
    try {
      const { chatId } = req.params;
      console.log(req.file);
      
      const avatar = req.file.path;
      const updatedChat = await chatService.updateGroupAvatar({ chatId, avatar });
      res.ok(SYS_MESSAGE.SUCCESS, updatedChat);
    } catch (error) {
      next(error);
    }
  },
  addMember: async (req, res, next) => {
    try {
        const { chatId } = req.params;
      const { participants } = req.body;
      const updateChat = await chatService.addMember({ chatId, participants });
      res.ok(SYS_MESSAGE.SUCCESS, updateChat);
    } catch (error) {
      next(error);
    }
  },
  removeMember: async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const {creatorId, userId} = req.body;
        const updateChat = await chatService.removeMember({ chatId,creatorId, userId });
        res.ok(SYS_MESSAGE.SUCCESS, updateChat);
    } catch (error) {
        next(error);
    }
  },
  leaveChat: async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;
      const updatedChat = await chatService.leaveChat({ chatId, userId });
      res.ok(SYS_MESSAGE.SUCCESS, updatedChat);
    } catch (error) {
      next(error);
    }
  },
  getChatsList: async (req, res, next) => {
    try {
        const {userId} = req.params;
        const chats = await chatService.getChatsList({ userId });
        res.ok(SYS_MESSAGE.SUCCESS, chats);
    } catch (error) {
        next(error)
    }
  },
  deleteGroupChat: async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { userId} = req.body;
        const chat = await chatService.deleteChat({chatId, userId});
        res.ok(SYS_MESSAGE.SUCCESS, chat);
    } catch (error) {
        next(error);
    }
  },
  findChatsByChatName: async (req, res, next) => {
    try {
      const {chatName, userId } = req.body;
      const chats = await chatService.findChatsByChatName({ chatName, userId });
      res.ok(SYS_MESSAGE.SUCCESS, chats);
    } catch (error) {
      next(error);
    }
  },
  findChatByParticipant: async (req, res, next) => {
    try {
      const { userId, participantId } = req.params;
      const chat = await chatService.findPrivateChatByParticipant({
        userId,
        participantId
      });
      res.ok(SYS_MESSAGE.SUCCESS, chat);
    } catch (error) {
      next(error);
    }
  },
  getGroupChatList: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const chats = await chatService.getGroupChatList({ userId });
      res.ok(SYS_MESSAGE.SUCCESS, chats);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = chatController;
