const express = require('express');
const UserController = require('../Controllers/user.controller');
const OTPController = require('../Controllers/OTP.controller');

const router = express.Router();

//Register routes
router.post('/register',UserController.registerUser);
//Login routes
router.post('/login', UserController.loginUser);
//Refresh token
router.post('/refreshToken', UserController.refreshToken);
//Send Otp
router.post('/sendOtp', OTPController.sendOTP);
//Verify OTP
router.post('/verifyOtp', OTPController.verifyOTP);


module.exports = router;