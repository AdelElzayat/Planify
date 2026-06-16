const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMessages, sendMessage, editMessage, deleteMessage, addReaction, uploadFileMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/:teamId', protect, getMessages);
router.post('/:teamId', protect, sendMessage);
router.put('/:id', protect, editMessage);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/reactions', protect, addReaction);
router.post('/:teamId/upload', protect, upload.single('file'), uploadFileMessage);

module.exports = router;