const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('team', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (userId, type, title, message, data = {}, teamId = null) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      team: teamId
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

const createTestNotification = async (req, res) => {
  try {
    const { type, title, message } = req.body;
    
    await createNotification(
      req.user._id,
      type || 'announcement',
      title || 'Test Notification',
      message || 'This is a test notification',
      {},
      null
    );

    res.json({ message: 'Test notification created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification, createTestNotification };
