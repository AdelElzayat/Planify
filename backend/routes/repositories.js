const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  getRepository, createCommit, updateReadme, 
  updateDocumentation, addMeetingSummary, uploadFile, deleteFile 
} = require('../controllers/repositoryController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/repos'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

router.get('/:teamId', protect, getRepository);
router.post('/:teamId/commits', protect, createCommit);
router.put('/:teamId/readme', protect, updateReadme);
router.put('/:teamId/docs', protect, updateDocumentation);
router.post('/:teamId/meetings', protect, addMeetingSummary);
router.post('/:teamId/files', protect, upload.single('file'), uploadFile);
router.delete('/:teamId/files/:fileId', protect, deleteFile);

module.exports = router;