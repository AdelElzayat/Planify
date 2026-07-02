const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createTestNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.post('/test', protect, createTestNotification);

module.exports = router;
