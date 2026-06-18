const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, universityId, department, skills, isSupervisor } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      universityId,
      department,
      skills: skills || [],
      isSupervisor: isSupervisor || false,
      role: isSupervisor ? 'supervisor' : 'student',
      isApproved: !isSupervisor
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved && user.isSupervisor) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('team')
      .populate('supervisedTeams');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, universityId, department, skills, bio, github, linkedin, website, location } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (universityId !== undefined) user.universityId = universityId;
    if (department !== undefined) user.department = department;
    if (skills !== undefined) user.skills = skills;
    if (bio !== undefined) user.bio = bio;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user._id;

    // If there's an old avatar file, delete it
    const oldUser = await User.findById(userId);
    if (oldUser?.avatar && oldUser.avatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(__dirname, '..', oldUser.avatar);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    let filename;
    if (req.file) {
      // New file upload via multer (memoryStorage) — write to disk
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const ext = path.extname(req.file.originalname);
      filename = `avatar-${userId}-${Date.now()}${ext}`;
      const dest = path.join(uploadsDir, filename);
      fs.writeFileSync(dest, req.file.buffer);
    } else {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(userId, { avatar: `/uploads/avatars/${filename}` }, { new: true });
    res.json({ avatar: user.avatar, user });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: error.message });
  }
};

const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const filePath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    user.avatar = '';
    await user.save();

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar, removeAvatar };