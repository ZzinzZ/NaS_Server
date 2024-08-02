const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "djz3q3fqf",
  api_key: "913186144133332",
  api_secret: "247OE-m7qeuM9mmRTNxQmA8LVsI",
});



module.exports = cloudinary;
