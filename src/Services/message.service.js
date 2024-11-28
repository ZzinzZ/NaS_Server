const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const HttpException = require("../core/HttpException");
const Chats = require("../Models/Chat.model");
const Messages = require("../Models/Message.model");
const Profile = require("../Models/Profile.model");

const isUserBlocked = async (senderId, chat) => {
  const receiverId = chat.participants.find(
    (participant) => participant.userId.toString() !== senderId.toString()
  )?.userId;

  if (!receiverId) {
    throw new HttpException(400, SYS_MESSAGE.NOT_FOUND);
  }

  const receiverProfile = await Profile.findOne({ userId: receiverId });
  if (!receiverProfile) {
    throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
  }

  return receiverProfile.blockedUsers.some(
    (block) => block.userId.toString() === senderId.toString()
  );
};

const messageService = {
  createMessage: async ({ senderId, chatId, text, images }) => {
    const chat = await Chats.findOne({ _id: chatId });

    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (chat.type === "private" && (await isUserBlocked(senderId, chat))) {
      throw new HttpException(403, USER_MESSAGES.BLOCK_EVENT);
    }

    if (!text && images?.length === 0) {
      throw new HttpException(400, SYS_MESSAGE.FAILURE_MESSAGE);
    }
    const messageContent = {
      text: text || "",
      file: null,
      image: images || [],
    };

    const message = new Messages({
      sender_id: senderId,
      chat_id: chatId,
      content: messageContent,
      status: { seen_by: [] },
      react: [],
      is_deleted_by: [],
    });
    chat.last_message = {
      messId: message._id,
      senderId: senderId,
    };
    await chat.save();
    await message.save();
    return message;
  },

  sendFile: async ({ senderId, chatId, file }) => {
    const chat = await Chats.findOne({ _id: chatId });

    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (chat.type === "private" && (await isUserBlocked(senderId, chat))) {
      throw new HttpException(403, USER_MESSAGES.BLOCK_EVENT);
    }

    const messageContent = {
      text: null,
      file: file,
      image: null,
    };

    const message = new Messages({
      sender_id: senderId,
      chat_id: chatId,
      content: messageContent,
      status: { seen_by: [] },
      react: [],
      is_deleted_by: [],
    });
    chat.last_message = {
      messId: message._id,
      senderId: senderId,
    };
    await chat.save();
    await message.save();
    return message;
  },

  getMessageByChatId: async ({ chatId, userId }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    const messages = await Messages.find({
      chat_id: chatId,
      "is_deleted_by.userId": { $nin: [userId] },
    })
      .populate("sender_id", "name") // Populate `sender_id` đầu tiên
      .populate({
        path: "reply_to",
        select: "content sender_id",
        populate: {
          path: "sender_id",
          select: "name",
        },
      });
    // .sort({ createdAt: -1 });

    return messages;
  },

  removeMessage: async ({ messageId, userId }) => {
    const message = await Messages.findOne({ _id: messageId })
      .populate("sender_id", "name")
      .populate({
        path: "reply_to",
        select: "content sender_id",
        populate: {
          path: "sender_id",
          select: "name",
        },
      });
    if (!message) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    console.log("sender", message.sender_id);

    if (message.sender_id._id.toString() !== userId) {
      throw new HttpException(401, SYS_MESSAGE.NO_AUTHORIZATION);
    }
    message.content = {
      text: null,
      file: null,
      image: [],
    };
    message.isRemoved = true;
    message.save();
    return message;
  },
  deleteSoftMessage: async ({ messageId, userId }) => {
    const message = await Messages.findOne({ _id: messageId });
    message.is_deleted_by.push({ userId: userId });
    await message.save();
  },
  markAsSeen: async ({ messageId, userId }) => {
    const message = await Messages.findOne({ _id: messageId });
    if (!message) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    if (
      message?.status?.seen_by?.some((u) => u.toString() === userId.toString())
    ) {
      return;
    }

    message.status.seen_by.push(userId);

    message.status.seen_by = [
      ...new Set(message.status.seen_by.map((id) => id.toString())),
    ];

    await message.save();
    return message;
  },

  countUnreadMessages: async ({ userId, chatId }) => {
    const unreadCount = await Messages.countDocuments({
      chat_id: chatId,
      "status.seen_by": { $nin: [userId] },
    });
    return unreadCount;
  },
  countUnreadMessagesForAllChats: async (userId) => {
    const chats = await Chats.find({
      $or: [{ created_by: userId }, { "participants.userId": userId }],
    })
      .populate({
        path: "last_message.messId",
        populate: {
          path: "sender_id",
          select: "name",
        },
      })
      .sort({
        "last_message.messId": -1,
        createdAt: -1,
        updatedAt: -1,
      })
      .exec();

    const chatIds = chats.map((chat) => chat._id);
    const unreadCounts = await Messages.countDocuments([
      {
        $match: {
          chat_id: { $in: chatIds },
          "status.seen_by": { $nin: [userId] },
        },
      },
    ]);

    return unreadCounts; // Trả về mảng các đối tượng chứa chat_id và unreadCount
  },
  reactMessage: async ({ messageId, userId, emotion }) => {
    const message = await Messages.findOne({ _id: messageId });

    const chat = await Chats.findOne({ _id: message.chat_id });

    if (!message) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (chat.type === "private" && (await isUserBlocked(senderId, chat))) {
      throw new HttpException(403, USER_MESSAGES.BLOCK_EVENT);
    }

    const existingReactIndex = message.react?.findIndex(
      (react) => react.userId?.toString() === userId.toString()
    );

    if (existingReactIndex !== -1) {
      if (message.react[existingReactIndex].emotion === emotion) {
        message.react.splice(existingReactIndex, 1);
      } else {
        message.react[existingReactIndex].emotion = emotion;
      }
    } else {
      message.react.push({ userId, emotion });
    }

    await message.save();
    const populatedReactMessage = await Messages.findById(message._id).populate(
      {
        path: "reply_to",
        populate: {
          path: "sender_id",
          select: "name",
        },
      }
    );
    return populatedReactMessage;
  },
  replyMessage: async ({ messageId, userId, text, images }) => {
    // Lấy tin nhắn gốc và chat tương ứng
    const message = await Messages.findOne({ _id: messageId });
    if (!message) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    const chat = await Chats.findOne({ _id: message.chat_id });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND); // Nếu không tìm thấy chat
    }
    if (chat.type === "private" && (await isUserBlocked(senderId, chat))) {
      throw new HttpException(403, USER_MESSAGES.BLOCK_EVENT);
    }

    if (!text && images?.length === 0) {
      throw new HttpException(400, SYS_MESSAGE.FAILURE_MESSAGE);
    }

    const replyMessage = new Messages({
      sender_id: userId,
      reply_to: messageId,
      chat_id: message.chat_id,
      content: {
        text: text,
        file: null,
        image: images,
      },
      status: { seen_by: [] },
      react: [],
      is_deleted_by: [],
    });
    chat.last_message = {
      messId: replyMessage._id,
      senderId: userId,
    };

    // Lưu tin nhắn trả lời và chat
    await replyMessage.save();
    await chat.save();

    const populatedReplyMessage = await Messages.findById(
      replyMessage._id
    ).populate({
      path: "reply_to",
      populate: {
        path: "sender_id",
        select: "name",
      },
    });

    return populatedReplyMessage;
  },
  deleteChatMessages: async ({ chatId, userId }) => {
    await Messages.updateMany(
      { chat_id: chatId, "is_deleted_by.userId": { $ne: userId } },
      { $push: { is_deleted_by: { userId } } }
    );

    return true;
  },
  getMessageSeenListUsers: async ({ messageId }) => {
    const message = await Messages.findOne({ _id: messageId });
    if (!message) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    const listReacts = message.status.seen_by;
    const listProfile = await Profile.find({ userId: { $in: listReacts } })
      .select("userId userName avatar")
      .populate({
        path: "avatar",
        select: "content",
      })
      .exec();
    return listProfile;
  },
  getUserReactedMessage: async ({ messageId }) => {
    const message = await Messages.findOne({ _id: messageId })
      .populate("react.userId", "name")
      .exec();

    if (!message) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    return message.react;
  },
};

module.exports = messageService;
