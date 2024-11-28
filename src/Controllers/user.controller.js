const jwt = require("jsonwebtoken");
const HttpException = require("../core/HttpException");
const {
  UserService,
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../Services/user.service");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const ProfileService = require("../Services/profile.service");

const UserController = {
  //register user
  async registerUser(req, res, next) {
    try {
      const { name, email, password, gender, birthday, otp } = req.body;
      const user = await UserService.createUser({ name, email, password, otp });

      const profile = await ProfileService.createProfile({
        userId: user.id,
        userName: user.name,
        location: [],
        experience: [],
        education: [],
        birthday: birthday,
        relationship: {
          type: "other",
          status: false,
        },
        status: "init",
        gender: gender,
        bio: "",
      });

      res.created(USER_MESSAGES.USER_REGISTER_SUCCESS, { user, profile });
    } catch (error) {
      next(error);
    }
  },
  // Login user
  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.loginUser({ email, password });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.ok(USER_MESSAGES.USER_LOGIN_SUCCESS, result);
    } catch (error) {
      console.log(error);
      
      next(error);
    }
  },
  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new HttpException(401, "No refresh token found");
      }

      const { _id } = verifyRefreshToken(refreshToken);

      const newToken = createToken(_id);
      const newRefreshToken = createRefreshToken(_id);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.ok("Success", {
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = UserController;
