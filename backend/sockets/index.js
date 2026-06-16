const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);
    
    onlineUsers.set(socket.user._id.toString(), socket.user.name);
    io.emit('online_users', Array.from(onlineUsers.entries()));

    socket.on('join_team', (teamId) => {
      socket.join(`team:${teamId}`);
      socket.teamId = teamId;
      console.log(`${socket.user.name} joined team: ${teamId}`);
    });

    socket.on('leave_team', (teamId) => {
      socket.leave(`team:${teamId}`);
      delete socket.teamId;
    });

    socket.on('send_message', (data) => {
      io.to(`team:${data.teamId}`).emit('new_message', {
        ...data,
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email,
          avatar: socket.user.avatar
        },
        createdAt: new Date()
      });
    });

    socket.on('typing', (data) => {
      socket.to(`team:${data.teamId}`).emit('user_typing', {
        userId: socket.user._id,
        name: socket.user.name,
        isTyping: data.isTyping
      });
    });

    socket.on('message_edited', (data) => {
      io.to(`team:${data.teamId}`).emit('message_updated', data);
    });

    socket.on('message_deleted', (data) => {
      io.to(`team:${data.teamId}`).emit('message_removed', data);
    });

    socket.on('reaction_added', (data) => {
      io.to(`team:${data.teamId}`).emit('reaction_updated', data);
    });

    socket.on('join_voice', (data) => {
      socket.to(`team:${data.teamId}`).emit('user_joined_voice', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    socket.on('leave_voice', (data) => {
      socket.to(`team:${data.teamId}`).emit('user_left_voice', {
        userId: socket.user._id,
        name: socket.user.name
      });
    });

    socket.on('mute_toggle', (data) => {
      socket.to(`team:${data.teamId}`).emit('user_mute_changed', {
        userId: socket.user._id,
        name: socket.user.name,
        isMuted: data.isMuted
      });
    });

    socket.on('offer', (data) => {
      socket.to(`team:${data.teamId}`).emit('offer', {
        offer: data.offer,
        from: socket.user._id
      });
    });

    socket.on('answer', (data) => {
      socket.to(`team:${data.teamId}`).emit('answer', {
        answer: data.answer,
        from: socket.user._id
      });
    });

    socket.on('ice_candidate', (data) => {
      socket.to(`team:${data.teamId}`).emit('ice_candidate', {
        candidate: data.candidate,
        from: socket.user._id
      });
    });

    socket.on('task_updated', (data) => {
      io.to(`team:${data.teamId}`).emit('task_changed', data);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user._id.toString());
      io.emit('online_users', Array.from(onlineUsers.entries()));
      
      if (socket.teamId) {
        io.to(`team:${socket.teamId}`).emit('user_left_voice', {
          userId: socket.user._id,
          name: socket.user.name
        });
      }
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = setupSocket;