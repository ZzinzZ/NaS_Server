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

const generateAccessToken = (userId) => {
  const payload = {
    jti: Math.random().toString(),
    iss: process.env.STRINGEE_API_SID_KEY,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    userId: userId
  };

  return jwt.sign(payload, process.env.STRINGEE_API_SECRET_KEY, { algorithm: 'HS256' });
};

const UserService = {
  // Register
  createUser: async ({ name, email, password, otp }) => {
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
  },
  // Login
  loginUser: async ({ email, password }) => {
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
    const stringeeToken = generateAccessToken(user._id);

    return {
      user: user,
      token: token,
      refreshToken: refreshToken,
      stringeeToken: stringeeToken,
    };
  },

  changePasswordWithOTP: async ({ email, otp, newPassword }) => {
    if (!email || !otp || !newPassword) {
      throw new HttpException(400, USER_MESSAGES.MISSING_FIELD);
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new HttpException(400, USER_MESSAGES.PASSWORD_INVALID);
    }
  
    const otpVerify = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (otpVerify.length === 0 || otpVerify[0].otp !== otp) {
      throw new HttpException(400, USER_MESSAGES.OTP_INVALID);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpException(404, USER_MESSAGES.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
  
    return {
      message: USER_MESSAGES.PASSWORD_UPDATED,
      userId: user._id,
    };
  },
};

module.exports = {
  UserService,
  createToken,
  createRefreshToken,
  verifyRefreshToken,
};
