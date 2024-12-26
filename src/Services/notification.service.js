const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const HttpException = require("../core/HttpException");
const Chats = require("../Models/Chat.model");
const Notification = require("../Models/Notification.model");
const Profile = require("../Models/Profile.model");

const notificationService = {
  createChatNotification: async ({ userId, message, refChat }) => {
    const chat = await Chats.findById(refChat);

    const notification = new Notification({
      userId,
      message,
      refChat,
      type: 'chat',
      seen: false,
    });

    await notification.save();
    const populatedNotification = await Notification.findById(
      notification._id
    ).populate("refChat");

    return populatedNotification;
  },

  createUserNotification: async ({userId, message, refUser}) => {
    const user = await Profile.findOne({userId: refUser});
    
    if (!user) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    
    const notification = new Notification({
        userId,
        message,
        refUser,
        type: 'user',
        seen: false,
    });
    
    await notification.save();
    const populatedNotification = await Notification.findById(notification._id).populate("refUser");
    
    return populatedNotification;
  },

  getUserNotification: async ({userId}) => {
    const user = await Profile.findOne({userId: userId});
    
    if (!user) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    
    const notifications = await Notification.find({userId}).populate("refChat refUser").sort({ createdAt: -1 });
    return notifications;
  },
  
  markNotificationAsSeen: async ({notificationId}) => {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { seen: true },
    );
    
    if (!notification) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    
    return notification;
  },
  deleteNotification: async ({notificationId}) => {
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    
    return notification;
  }
};

module.exports = notificationService;
