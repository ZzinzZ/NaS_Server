const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const messageService = require("../Services/message.service");

const messageController = {
  createMessage: async (req, res, next) => {
    try {
      const { chatId } = req.params;

      const images =
        req.files && req.files ? req.files.map((file) => file.path) : [];

      const { senderId, text } = req.body;

      // Gọi service để tạo tin nhắn
      const newMessage = await messageService.createMessage({
        senderId,
        chatId,
        text,
        images,
      });

      res.created(SYS_MESSAGE.SUCCESS, newMessage);
    } catch (error) {
      next(error);
    }
  },

  sendFile: async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { senderId } = req.body;
      console.log("file", req.files);

      const files = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: `${file.filename}`,
        fileSize: file.size,
        fileType: file.mimetype,
      }));

      const message = await messageService.sendFile({
        senderId,
        chatId,
        file: files,
      });
      res.created(SYS_MESSAGE.SUCCESS, message);
    } catch (error) {
      next(error);
    }
  },

  createCallMessage: async (req, res, next) => {
    try {
      const { chatId } = req.params;
      const { senderId, callDuration, is_accepted, is_rejected, call_type } =
        req.body;

      const message = await messageService.createCallMessage({
        senderId,
        chatId,
        callDuration,
        is_accepted,
        is_rejected,
        call_type,
      });
      res.created(SYS_MESSAGE.SUCCESS, message);
    } catch (error) {
      console.log("Error creating", error);

      next(error);
    }
  },

  getMessages: async (req, res, next) => {
    try {
      const { chatId, userId } = req.params;
      const messages = await messageService.getMessageByChatId({
        chatId,
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, messages);
    } catch (error) {
      next(error);
    }
  },
  removeMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;
      const removedMessage = await messageService.removeMessage({
        messageId,
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, removedMessage);
    } catch (error) {
      next(error);
    }
  },
  deleteSoftMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;
      const deletedMessage = await messageService.deleteSoftMessage({
        messageId,
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, deletedMessage);
    } catch (error) {
      next(error);
    }
  },
  markAsSeen: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;
      const markedAsSeen = await messageService.markAsSeen({
        messageId,
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, markedAsSeen);
    } catch (error) {
      next(error);
    }
  },
  reactMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { userId, emotion } = req.body;
      const reactedMessage = await messageService.reactMessage({
        messageId,
        userId,
        emotion,
      });
      res.ok(SYS_MESSAGE.SUCCESS, reactedMessage);
    } catch (error) {
      console.log("React", error);

      next(error);
    }
  },
  countUnreadMessages: async (req, res, next) => {
    try {
      const { chatId, userId } = req.params;
      const unreadMessages = await messageService.countUnreadMessages({
        chatId,
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, unreadMessages);
    } catch (error) {
      next(error);
    }
  },
  countTotalUnreadMessages: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const total = await messageService.countUnreadMessagesForAllChats({
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, total);
    } catch (error) {
      console.log(error);

      next(error);
    }
  },
  replyMessage: async (req, res, next) => {
    try {
      const { userId, text } = req.body;
      const files = req.files;
      const { messageId } = req.params;

      const images = files ? files.map((file) => file.path) : [];

      const repliedMessage = await messageService.replyMessage({
        userId,
        text,
        images: images,
        messageId,
      });

      res.ok(SYS_MESSAGE.SUCCESS, repliedMessage);
    } catch (error) {
      next(error);
    }
  },
  deleteChatMessages: async (req, res, next) => {
    try {
      const { chatId, userId } = req.body;
      const result = await messageService.deleteChatMessages({
        chatId,
        userId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  },
  getMessageListSeenUsers: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const seenUsers = await messageService.getMessageSeenListUsers({
        messageId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, seenUsers);
    } catch (error) {
      next(error);
    }
  },
  getUserReactedMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const reactedUser = await messageService.getUserReactedMessage({
        messageId,
      });
      res.ok(SYS_MESSAGE.SUCCESS, reactedUser);
    } catch (error) {
      next(error);
    }
  },
  findMessageByKeyword: async (req, res, next) => {
    try {
      const {chatId} = req.params;
      const { keyword } = req.query;
      const messages = await messageService.findMessageByKeyword({
        chatId,
        keyword
      });
      res.ok(SYS_MESSAGE.SUCCESS, messages);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = messageController;
