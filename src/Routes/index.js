const express = require("express");
const UserRoute = require("./user.route");
const ProfileRoute = require("./profile.route");
const PostRoute = require("./post.route");
const SearchHistoryRoute = require("./searchHistory.route");
const ChatRoute = require("./chat.route");
const MessageRoute = require("./message.route");
const StringeeRoute = require("./stringee.route");
const NotificationRoute = require("./notification.route");

const router = express.Router();


router.use("/users", UserRoute);
router.use("/profiles", ProfileRoute);
router.use("/posts", PostRoute);
router.use("/search", SearchHistoryRoute);
router.use("/chats", ChatRoute);
router.use("/messages", MessageRoute);
router.use("/stringee", StringeeRoute);
router.use("/notifications", NotificationRoute);


module.exports = router;