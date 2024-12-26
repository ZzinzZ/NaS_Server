const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');


const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, 
  },
});
// Define a function to send emails
async function sendVerificationEmail(email, otp) {
    try {
      const mailResponse = await mailSender(
        email,
        "Verification Email",
        `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <table style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="text-align: center;">
                <h1 style="font-size: 24px; color: #007BFF; margin-bottom: 20px;">Verification Email</h1>
              </td>
            </tr>
            <tr>
              <td style="background: #007BFF; color: #fff; padding: 15px; text-align: center; border-radius: 5px;">
                <h2 style="margin: 0; font-size: 20px;">Please confirm your OTP</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <p style="font-size: 18px;">Here is your OTP code:</p>
                <p style="font-size: 24px; font-weight: bold; text-align: center; background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">${otp}</p>
                <p style="font-size: 16px;">This OTP code is valid for the next 5 minutes. Please do not share this code with anyone.</p>
                <p style="font-size: 16px;">If you did not request this code, please ignore this email or contact support.</p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; font-size: 12px; color: #888; padding: 10px;">
                <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
        `
      );
      console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
      console.log("Error occurred while sending email: ", error);
      throw error;
    }
  }
  
otpSchema.pre("save", async function (next) {
  console.log("New document saved to the database");
  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});
const OTP = mongoose.model("OTP", otpSchema)
module.exports = OTP;