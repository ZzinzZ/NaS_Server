const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/errorMiddleware");
const cookieParser = require('cookie-parser');
const okResponse  = require("./middlewares/okResponse");
//Route
const UserRoute = require("../src/Routes/user.route");
const ProfileRoute = require("../src/Routes/profile.route");
const PostRoute = require("../src/Routes/post.route");
const SearchHistoryRoute = require("../src/Routes/searchHistory.route");


const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', "x-auth-token"]
};
// config ENV
require("dotenv").config();

const port = process.env.PORT || 5000;
const uri = process.env.CONNECT_STRING;


// Initialize Middleware
app.use(express.json());
app.use(errorMiddleware)
app.use(express.urlencoded({
  extended: true,
  })
)
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(okResponse);

// Initialize Route
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/profiles", ProfileRoute);
app.use("/api/v1/posts", PostRoute);

app.use("/api/v1/search", SearchHistoryRoute);


// Initialize Application
app.get('/', (req, res) => {
    res.send("NaS api is available!");
})


app.listen(port, (req, res) => {
  console.log("Server running on port: " + port);
});

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connection established!");
  })
  .catch((err) => console.log("MongoDB connection failed" + err.message));