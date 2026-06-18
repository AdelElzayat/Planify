const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Optimized connection settings for Atlas (cloud MongoDB)
      maxPoolSize: 10,               // Reuse connections instead of creating new ones
      minPoolSize: 2,                 // Keep at least 2 connections warm
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable (5s instead of 30s default)
      socketTimeoutMS: 45000,         // How long to wait for a response
      family: 4,                      // Use IPv4, avoids IPv6 lookup delays on some hosts
      retryWrites: true,
      w: 'majority',                  // Ensure writes are acknowledged
      heartbeatFrequencyMS: 10000,    // Check connection health every 10s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create all indexes after connection
    await createIndexes();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // ── Messages Indexes ──
    if (collectionNames.includes('messages')) {
      const messages = db.collection('messages');
      
      // Existing: team + deleted + createdAt (for fetching messages)
      await messages.createIndex({ team: 1, deleted: 1, createdAt: -1 }, { background: true });
      
      console.log('✓ Message indexes ensured');
    }

    // ── Teams Indexes ──
    if (collectionNames.includes('teams')) {
      const teams = db.collection('teams');
      
      // For looking up user's teams quickly
      await teams.createIndex({ 'members.user': 1 }, { background: true });
      
      console.log('✓ Team indexes ensured');
    }

    // ── Notifications Indexes ──
    if (collectionNames.includes('notifications')) {
      const notifications = db.collection('notifications');
      
      // For fetching user notifications quickly
      await notifications.createIndex({ user: 1, createdAt: -1 }, { background: true });
      
      console.log('✓ Notification indexes ensured');
    }

    // ── Tasks Indexes ──
    if (collectionNames.includes('tasks')) {
      const tasks = db.collection('tasks');
      
      await tasks.createIndex({ team: 1, status: 1 }, { background: true });
      await tasks.createIndex({ assignedTo: 1 }, { background: true });
      
      console.log('✓ Task indexes ensured');
    }
  } catch (err) {
    // Index creation shouldn't crash the server if they already exist
    console.log('Index setup note:', err.message.substring(0, 100));
  }
};

module.exports = connectDB;