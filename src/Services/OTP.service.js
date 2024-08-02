const otpGenerator = require("otp-generator");

const OTP = require("../Models/OTP.model");
const HttpException = require("../core/HttpException");

const OTPService = {
  sendOTP: async ({ email }) => {
    try {
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
    } catch (error) {
        throw new HttpException(500, "Error:" + error.message)
    }
  },
  verifyOTP: async ({ email, otp }) => {
    try {
        const otpData = await OTP.findOne({ email, otp });
        if (!otpData) {
            throw new HttpException(404, "Invalid OTP");
        }
        return true;
    } catch (error) {
        throw new HttpException(500, "Error:" + error.message);
    }
  }
};

module.exports = OTPService;