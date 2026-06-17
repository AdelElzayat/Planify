const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./sockets');

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://planify-debuggers.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/repositories', require('./routes/repositories'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Planify API is running' });
});

app.use(errorHandler);

const io = setupSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Planify Server running on port ${PORT}`);
});

module.exports = { app, server, io };