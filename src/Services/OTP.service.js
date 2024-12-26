const otpGenerator = require("otp-generator");
const OTP = require("../Models/OTP.model");
const HttpException = require("../core/HttpException");
const { SYS_MESSAGE } = require("../core/configs/systemMessage");

const OTPService = {
  sendOTP: async ({ email }) => {
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    return otp;
  },
  verifyOTP: async ({ email, otp }) => {
    const otpData = await OTP.findOne({ email, otp });
    if (!otpData) {
      throw new HttpException(404, SYS_MESSAGE.INVALID_OTP);
    }
    return true;
  },
};

module.exports = OTPService;
