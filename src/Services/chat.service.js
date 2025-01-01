const Chats = require("../Models/Chat.model");
const Messages = require("../Models/Message.model");
const Profile = require("../Models/Profile.model");
const HttpException = require("../core/HttpException");
const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const normalizeText = require("../utils/lowerString");

const chatService = {
  createPrivateChat: async ({ userId, participantId }) => {
    const existingChat = await Chats.findOne({
      type: "private",
      participants: {
        $all: [
          { $elemMatch: { userId } },
          { $elemMatch: { userId: participantId } },
        ],
      },
    });
    if (existingChat) {
      return;
    }
    const participantProfile = await Profile.findOne({
      userId: participantId,
    }).populate("avatar");

    if (!participantProfile) {
      throw new HttpException(404, SYS_MESSAGE.NO_PROFILE);
    }

    const newChat = new Chats({
      type: "private",
      created_by: userId,
      participants: [{ userId }, { userId: participantId }],
      chat_name: null,
      avatar: null,
      last_message: null,
      nickname: "",
      delete_by:[]
    });

    await newChat.save();

    return newChat;
  },

  createGroupChat: async ({ userId, participants, chatName }) => {
    if (participants.length < 2) {
      throw new HttpException(400, USER_MESSAGES.NOT_ENOUGH_PARTICIPANT);
    }

    const uniqueParticipants = new Set(participants);
    uniqueParticipants.delete(userId);
    const finalParticipants = [
      { userId },
      ...[...uniqueParticipants].map((id) => ({ userId: id })),
    ];
    console.log(finalParticipants);

    if (finalParticipants.length !== participants.length + 1) {
      throw new HttpException(400, USER_MESSAGES.DUPLICATE_PARTICIPANTS);
    }

    const participantProfiles = await Profile.find({
      userId: { $in: finalParticipants.map((p) => p.userId) },
    })
      .select("userName")
      .limit(3);

    const userName =
      finalParticipants.length > 3
        ? participantProfiles.map((p) => p.userName).join(", ") + "..."
        : participantProfiles.map((p) => p.userName).join(", ");

    const newChat = new Chats({
      type: "group",
      created_by: userId,
      participants: finalParticipants,
      chat_name: chatName || userName,
      avatar: "",
      last_message: null,
      nickname: "",
      delete_by:[]
    });

    await newChat.save();

    return newChat;
  },

  getChatDetails: async ({ chatId }) => {
    const chat = await Chats.findOne({ _id: chatId })
      .populate("created_by")
      .populate({
        path: 'participants.userId',
        select: 'name _id',
        populate: {
          path: 'profileId',
          select: 'userId userName avatar blockedBy blockedUsers friends',
          populate: {
            path: 'avatar',
            select: 'content'
          }
        }
      })
      .lean()
      .exec();
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    const participantProfiles = chat.participants.map(participant => participant.userId.profileId);

    const sortedParticipantProfiles = chat.participants.map((participant) =>
      participantProfiles.find(
        (profile) => profile.userId.toString() === participant.userId.toString()
      )
    );
    return { chat, participantProfiles: sortedParticipantProfiles };
  },

  leaveChat: async ({ chatId, userId }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (
      chat.participants.findIndex((p) => p.userId.toString() === userId) === -1
    ) {
      throw new HttpException(403, USER_MESSAGES.NOT_FOUND_IN_CHAT);
    }

    chat.participants = chat.participants.filter(
      (p) => p.userId.toString() !== userId
    );
    if (chat.created_by === userId) {
      chat.created_by = chat.participants[0].userId;
    }
    await chat.save();
    return chat;
  },

  updateChatName: async ({ chatId, chatName }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    chat.chat_name = chatName;
    await chat.save();
    return chat;
  },
  updateGroupAvatar: async ({ chatId, avatar }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    chat.avatar = avatar;
    await chat.save();
    return chat;
  },
  deleteChat: async ({ chatId, userId }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (chat.type !== "group") {
      throw new HttpException(400, SYS_MESSAGE.INVALID_CHAT_TYPE);
    }
    if (chat.created_by.toString() !== userId) {
      throw new HttpException(403, USER_MESSAGES.UNAUTHORIZED);
    }
    await Messages.deleteMany({ chatId: chatId });

    await Chats.deleteOne({ _id: chatId });

    return true;
  },
  addMember: async ({ chatId, participants }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (chat.type !== "group") {
      throw new HttpException(400, SYS_MESSAGE.INVALID_CHAT_TYPE);
    }

    const existingUserIds = new Set(
      chat.participants.map((p) => p.userId.toString())
    );
    const newParticipants = participants.filter(
      (userId) => !existingUserIds.has(userId)
    );

    if (newParticipants.length === 0) {
      throw new HttpException(400, USER_MESSAGES.DUPLICATE_PARTICIPANTS);
    }

    chat.participants = [
      ...chat.participants,
      ...newParticipants.map((userId) => ({ userId })),
    ];
    await chat.save();
    return chat;
  },

  removeMember: async ({ chatId, creatorId, userId }) => {
    const chat = await Chats.findOne({ _id: chatId });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    if (chat.type !== "group") {
      throw new HttpException(400, SYS_MESSAGE.INVALID_CHAT_TYPE);
    }

    if (chat.created_by.toString() !== creatorId) {
      throw new HttpException(403, USER_MESSAGES.UNAUTHORIZED);
    }
    if (creatorId === userId) {
      throw new HttpException(403, USER_MESSAGES.UNAUTHORIZED);
    }
    if (!chat.participants.some((p) => p.userId.toString() === userId)) {
      throw new HttpException(404, USER_MESSAGES.NOT_FOUND_IN_CHAT);
    }

    // Loại bỏ user khỏi participants
    const participants = chat.participants.filter(
      (p) => p.userId.toString() !== userId
    );
    chat.participants = participants;
    await chat.save();

    const participantProfiles = await Profile.find({
      userId: { $in: participants.map((p) => p.userId) },
    })
      .select("userId userName avatar")
      .populate("avatar")
      .exec();

    const sortedParticipantProfiles = participants.map((participant) =>
      participantProfiles.find(
        (profile) => profile.userId.toString() === participant.userId.toString()
      )
    );

    return sortedParticipantProfiles;
  },
  getChatsList: async ({ userId }) => {
    const chats = await Chats.find({
      $or: [{ created_by: userId }, { "participants.userId": userId }], "delete_by.userId": { $ne: userId }
    })
      .populate({
        path: "last_message.messId",
        populate: {
          path: "sender_id",
          select: "name",
        },
      })
      .populate({
        path: 'participants.userId',
        select: 'name _id',
        populate: {
          path: 'profileId',
          select: 'userId userName avatar blockedBy blockedUsers friends',
          populate: {
            path: 'avatar',
            select: 'content'
          }
        }
      })
      .sort({
        updatedAt: -1,
        createdAt: -1,
        "last_message.messId": -1,
        
      })
      .lean()
      .exec();

    return chats;
  },

  getGroupChatList: async ({ userId }) => {
    const chats = await Chats.find({
      type: "group",
      participants: { $elemMatch: { userId } },
      
    })
      .select("avatar chat_name _id")
      .exec();

    if (!chats) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    return chats;
  },

  findChatsByChatName: async ({ chatName, userId }) => {
    const keyWord = normalizeText(chatName);

    const groupChats = await Chats.find({
      chat_name: { $regex: keyWord, $options: "i" },
      $or: [{ "participants.userId": userId }, { created_by: userId }],
    })
      .populate({
        path: "last_message.messId",
      })
      .sort({
        "last_message.messId": -1,
        createdAt: -1,
        updatedAt: -1,
      })
      .exec();

    let privateChats = await Chats.find({
      type: "private",
      $or: [{ created_by: userId }, { "participants.userId": userId }],
    })
      .populate({
        path: "participants.userId",
        select: "_id name",
      })
      .populate({
        path: "last_message.messId",
      })
      .sort({
        "last_message.messId": -1,
        createdAt: -1,
        updatedAt: -1,
      })
      .exec();

    privateChats = privateChats.filter((chat) => {
      const otherParticipants = chat.participants.filter(
        (participant) => participant.userId._id.toString() !== userId.toString()
      );
      return otherParticipants.some((participant) => {
        const normalizedParticipantName = normalizeText(
          participant.userId.name
        );
        return normalizedParticipantName.includes(keyWord.toLowerCase());
      });
    });

    const chats = [...new Set([...privateChats, ...groupChats])];

    if (!chats.length) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    return chats;
  },
  findPrivateChatByParticipant: async ({ userId, participantId }) => {
    const chat = await Chats.findOne({
      type: "private",
      participants: {
        $all: [
          { $elemMatch: { userId } },
          { $elemMatch: { userId: participantId } },
        ],
      },
    }).select("_id");

    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    return chat;
  },
};

module.exports = chatService;
