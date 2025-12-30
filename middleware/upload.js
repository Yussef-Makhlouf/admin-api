const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'arabic-service-website',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        // transformation: [{ width: 1920, height: 1080, crop: 'limit' }] // Optional: automated transformations
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
