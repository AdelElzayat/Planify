const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { register, login, getMe, updateProfile, uploadAvatar, removeAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'));
    }
  }
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);

module.exports = router;
