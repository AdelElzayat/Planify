const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      team: req.params.teamId,
      deleted: false 
    })
      .populate('sender', 'name email avatar')
      .populate('replyTo')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, replyTo } = req.body;
    
    const message = await Message.create({
      team: req.params.teamId,
      sender: req.user._id,
      content,
      messageType: 'text',
      replyTo: replyTo || null
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot edit another user\'s message' });
    }

    message.content = req.body.content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete another user\'s message' });
    }

    message.deleted = true;
    message.content = '[deleted]';
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      const userIndex = existingReaction.users.indexOf(req.user._id);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user._id);
      }
    } else {
      message.reactions.push({
        emoji,
        users: [req.user._id]
      });
    }

    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadFileMessage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const message = await Message.create({
      team: req.params.teamId,
      sender: req.user._id,
      content: req.body.content || '',
      messageType: req.file.mimetype.startsWith('image') ? 'image' : 'file',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, editMessage, deleteMessage, addReaction, uploadFileMessage };