const jwt = require('jsonwebtoken');
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
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ avatar: avatarUrl, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.avatar = '';
    await user.save();

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar, removeAvatar };
