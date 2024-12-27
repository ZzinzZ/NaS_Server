
const express = require("express");
const upload = require("../middlewares/cloudinaryMiddleware");
const notificationController = require("../Controllers/notification.controller");

const router = express.Router();

router.post("/chat", notificationController.createChatNotification);

router.post("/user", notificationController.createUserNotification);

router.get("/list/:userId", notificationController.getUserNotification);

router.put("/read/:notificationId", notificationController.markNotificationAsRead);

router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;