const { USER_MESSAGES } = require("../core/configs/userMessages");
const OTPService = require("../Services/OTP.service");

const OTPController = {
    sendOTP:  async(req, res, next) => {
        try {
            const {email} = req.body;
            const result = await OTPService.sendOTP({email});
            res.ok(USER_MESSAGES.OTP_SEND_SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    },
    verifyOTP: async (req, res, next) => {
        try {
            const {email, otp} = req.body;
            const result = await OTPService.verifyOTP({email, otp});
            res.ok(USER_MESSAGES.OTP_VERIFY_SUCCESS, result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OTPController;