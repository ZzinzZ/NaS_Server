const User = require("../Models/User.model");

const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { USER_MESSAGES } = require("../core/configs/userMessages");
const HttpException = require("../core/HttpException");
const OTP = require("../Models/OTP.model");
const Profile = require("../Models/Profile.model");

const createToken = (_id) => {
  const jwkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ _id }, jwkey, { expiresIn: "1m" });
};

const createRefreshToken = (_id) => {
  const refreshKey = process.env.REFRESH_SECRET_KEY;
  return jwt.sign({ _id }, refreshKey, { expiresIn: "365d" });
};

const verifyRefreshToken = (token) => {
  const refreshKey = process.env.REFRESH_SECRET_KEY;
  try {
    return jwt.verify(token, refreshKey);
  } catch (error) {
    throw new HttpException(403, "Invalid refresh token");
  }
};

const UserService = {
  // Register
  createUser: async ({ name, email, password, otp }) => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        throw new HttpException(409, USER_MESSAGES.EMAIL_EXISTED);
      }

      if (!name || !email || !password) {
        throw new HttpException(400, USER_MESSAGES.MISSING_FIELD);
      }

      if (!validator.isEmail(email)) {
        throw new HttpException(400, USER_MESSAGES.EMAIL_INVALID);
      }
      if (!validator.isStrongPassword(password)) {
        throw new HttpException(400, USER_MESSAGES.PASSWORD_INVALID);
      }

      const otpVerify = await OTP.find({ email })
        .sort({ createdAt: -1 })
        .limit(1);
      if (otpVerify.length === 0 || otpVerify[0].otp !== otp) {
        throw new HttpException(400, USER_MESSAGES.OTP_INVALID);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        status: true,
        role: "user",
      });
      
      await newUser.save();
      return newUser;
    } catch (error) {
      throw new HttpException(500, error.message);
    }
  },
  // Login
  loginUser: async ({ email, password }) => {
    try {
      if (!email || !password) {
        throw new HttpException(400, USER_MESSAGES.MISSING_FIELD);
      }

      if (!validator.isEmail(email)) {
        throw new HttpException(400, USER_MESSAGES.EMAIL_INVALID);
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.status) {
        throw new HttpException(400, USER_MESSAGES.ACCOUNT_DISABLED);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException(400, USER_MESSAGES.WRONG_PASSWORD);
      }

      const token = createToken(user._id);
      const refreshToken = createRefreshToken(user._id);

      return {
        user: user,
        token: token,
        refreshToken: refreshToken,
      };
    } catch (error) {
      throw new HttpException(500, "Internal Server Error");
    }
  },
};

module.exports = {
  UserService,
  createToken,
  createRefreshToken,
  verifyRefreshToken,
};
