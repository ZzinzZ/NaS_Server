const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const notificationService = require("../Services/notification.service");

const notificationController = {
    createChatNotification: async (req, res, next) => {
        try {
            const {userId, message, refChat} = req.body;
            const notification = await notificationService.createChatNotification({userId, message, refChat});
            res.created(SYS_MESSAGE.CREATED,notification);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    createUserNotification: async (req, res, next) => {
        try {
            const {userId, message, refUser} = req.body;
            const notification = await notificationService.createUserNotification({userId, message, refUser});
            res.created(SYS_MESSAGE.CREATED,notification);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getUserNotification: async (req, res, next) => {
        try {
            const {userId} = req.params;
            const notifications = await notificationService.getUserNotification({userId});
            res.ok(SYS_MESSAGE.SUCCESS, notifications);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    markNotificationAsRead: async (req, res, next) => {
        try {
            const {notificationId} = req.params;

            const notification = await notificationService.markNotificationAsSeen({notificationId});
            res.ok(SYS_MESSAGE.SUCCESS, notification);
        } catch (error) {
            console.log(error);
            next(error);
            
        }
    },
    deleteNotification: async (req, res, next) => {
        try {
            const { notificationId} = req.params;
            const notification = await notificationService.deleteNotification({notificationId});
            res.ok(SYS_MESSAGE.SUCCESS, notification);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}

module.exports = notificationController;