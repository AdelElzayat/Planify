const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const supervisorOnly = (req, res, next) => {
  if (req.user && req.user.isSupervisor) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Supervisor only.' });
  }
};

const teamLeaderOnly = (req, res, next) => {
  if (req.user && req.user.teamRole === 'leader') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Team leader only.' });
  }
};

module.exports = { protect, supervisorOnly, teamLeaderOnly };