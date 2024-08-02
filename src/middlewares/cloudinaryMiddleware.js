const cloudinary = require('../core/configs/cloudinary');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    allowedFormats: ['jpg', 'png', 'gif'],
    filename: function (req, file, cb) {
      cb(null, file.originalname); 
    }
  });
const upload = multer({
    storage: storage
})

module.exports = upload;