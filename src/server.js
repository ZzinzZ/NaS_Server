const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");
const uploadFile = require("./middlewares/uploadFile");
const okResponse = require("./middlewares/okResponse");
const path = require('path');
require("dotenv").config();

// Route
const UserRoute = require("../src/Routes/user.route");
const ProfileRoute = require("../src/Routes/profile.route");
const PostRoute = require("../src/Routes/post.route");
const SearchHistoryRoute = require("../src/Routes/searchHistory.route");
const ChatRoute = require("../src/Routes/chat.route");
const MessageRoute = require("../src/Routes/message.route");

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.CONNECT_STRING;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "x-auth-token", "Origin", "X-Requested-With"],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(okResponse);

// Routes
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/profiles", ProfileRoute);
app.use("/api/v1/posts", PostRoute);
app.use("/api/v1/search", SearchHistoryRoute);
app.use("/api/v1/chats", ChatRoute);
app.use("/api/v1/messages", MessageRoute);

app.use('/uploadfiles', express.static(path.join(__dirname, 'uploadfiles')));

app.get("/", (req, res) => {
  res.send("NaS API is available!");
});


// Catch all (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error middleware

app.use(errorMiddleware);
//Oke middleware

// Initialize Application

// MongoDB Connection
mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connection established!");
  })
  .catch((err) => console.log("MongoDB connection failed" + err.message));

// Start Server
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
