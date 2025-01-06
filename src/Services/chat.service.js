const Chats = require("../Models/Chat.model");
const Messages = require("../Models/Message.model");
const Notification = require("../Models/Notification.model");
const Profile = require("../Models/Profile.model");
const HttpException = require("../core/HttpException");
const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const normalizeText = require("../utils/lowerString");

const toxicity = require("@tensorflow-models/toxicity");
let model;

async function loadToxicityModel() {
  const threshold = 0.7;
  model = await toxicity.load(threshold);
  console.log("Toxicity model loaded");
}
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
      delete_by: [],
    });

    await newChat.save();

    const populatedChat = await Chats.findById(newChat._id)
      .populate("created_by")
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
      });

    return populatedChat;
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
      delete_by: [],
    });

    await newChat.save();

    const populatedChat = await Chats.findById(newChat._id)
      .populate("created_by")
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
      });

    return populatedChat;
  },

  getChatDetails: async ({ chatId }) => {
    const chat = await Chats.findOne({ _id: chatId })
      .populate("created_by")
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
      })
      .lean()
      .exec();
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }

    return { chat };
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
    const chat = await Chats.findOne({ _id: chatId })
    .populate({
      path: "last_message.messId",
      populate: {
        path: "sender_id",
        select: "name",
      },
    })
    .populate({
      path: "participants.userId",
      select: "name _id",
      populate: {
        path: "profileId",
        select: "userId userName avatar blockedBy blockedUsers friends",
        populate: {
          path: "avatar",
          select: "content",
        },
      },
    });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    chat.chat_name = chatName;
    await chat.save();
    return chat;
  },
  updateGroupAvatar: async ({ chatId, avatar }) => {
    const chat = await Chats.findOne({ _id: chatId })
    .populate({
      path: "last_message.messId",
      populate: {
        path: "sender_id",
        select: "name",
      },
    })
    .populate({
      path: "participants.userId",
      select: "name _id",
      populate: {
        path: "profileId",
        select: "userId userName avatar blockedBy blockedUsers friends",
        populate: {
          path: "avatar",
          select: "content",
        },
      },
    });
    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    chat.avatar = avatar;
    await chat.save();
    return chat;
  },
  updateBackground: async ({chatId, background}) => {
    const updatedChat = await Chats.findOneAndUpdate(
      { _id: chatId },
      { background: background },
      { new: true }
    ).populate({
      path: "last_message.messId",
      populate: {
        path: "sender_id",
        select: "name",
      },
    })
    .populate({
      path: "participants.userId",
      select: "name _id",
      populate: {
        path: "profileId",
        select: "userId userName avatar blockedBy blockedUsers friends",
        populate: {
          path: "avatar",
          select: "content",
        },
      },
    });
  
    if (!updatedChat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
  
    return updatedChat;
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
      $or: [{ created_by: userId }, { "participants.userId": userId }],
      "delete_by.userId": { $ne: userId },
    })
      .populate({
        path: "last_message.messId",
        populate: {
          path: "sender_id",
          select: "name",
        },
      })
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
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
        populate: {
          path: "sender_id",
          select: "name",
        },
      })
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
      })
      .sort({
        "last_message.messId": -1,
        createdAt: -1,
        updatedAt: -1,
      })
      .lean()
      .exec();

    let privateChats = await Chats.find({
      type: "private",
      $or: [{ created_by: userId }, { "participants.userId": userId }],
    })
      .populate({
        path: "last_message.messId",
        populate: {
          path: "sender_id",
          select: "name",
        },
      })
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
      })
      .sort({
        "last_message.messId": -1,
        createdAt: -1,
        updatedAt: -1,
      })
      .lean()
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
    })
      .populate("created_by")
      .populate({
        path: "participants.userId",
        select: "name _id",
        populate: {
          path: "profileId",
          select: "userId userName avatar blockedBy blockedUsers friends",
          populate: {
            path: "avatar",
            select: "content",
          },
        },
      });

    if (!chat) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    return chat;
  },
  moderateContent: async () => {
    console.log("run service");
    
    await loadToxicityModel();
    const now = new Date();
    const halfDayAgo = new Date(now - 12 * 60 * 60 * 1000);

    const groupChats = await Chats.find({ type: "group" });
    for (const chat of groupChats) {
      const recentMessages = await Messages.find({
        chat_id: chat._id,
        createdAt: { $gte: halfDayAgo },
        "content.text": { $exists: true, $ne: "" },
      }).sort({ createdAt: 1 });

      if (recentMessages.length < 5) {
        console.log(`Skipping chat ${chat._id} due to insufficient messages`);
        continue;
      }

      const messageTexts = recentMessages.map((msg) => msg.content.text);
      const predictions = await model?.classify(messageTexts);

      let toxicMessageCount = 0;
      for (let i = 0; i < predictions[0].results.length; i++) {
        if (predictions.some((category) => category.results[i].match)) {
          toxicMessageCount++;
        }
      }

      const toxicityRate = toxicMessageCount / messageTexts.length;
      let message = "";
      console.log("toxic message count", toxicMessageCount);
      console.log("toxic message length",  messageTexts.length);

      

      if (toxicityRate > 0.3 && toxicityRate < 0.6) {
        console.log("fond warning");
        
        message = `your ${chat?.chat_name} chat contains a lot of inappropriate content, please pay attention!`;
        for (const member of chat.participants) {
          const notification = new Notification({
            userId: member?.userId,
            message: message,
            type: "chat",
            seen: false,
            refChat: chat?._id,
          });
          await notification.save();
        }
      }

      if (toxicityRate > 0.6) {
        console.log("find chat toxic rate");
        
        message = `Your group ${chat?.chat_name} was disbanded due to inappropriate content`;
        for (const member of chat.participants) {
          const notification = new Notification({
            userId: member?.userId,
            message: message,
            type: "chat",
            seen: false,
            refChat: null,
          });
          await notification.save();
          await Chats.deleteOne({ _id: chat._id });
          await Messages.deleteMany({ chat_id: chat._id });
        }
      }
    }
  },
  // addChatBackground: async () => {
  //   console.log("run addChatBackground");
    
  //   const chats = await Chats.find();
  //   for (const chat of chats) {
  //     chat.background = "";
  //     await chat.save();
  //   }
  // }
};

module.exports = chatService;
