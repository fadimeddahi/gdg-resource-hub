// src/config/db.js
// MongoDB connection logic using Mongoose. Exports a function to initialize the connection.

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not set in environment');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // In production you might want to exit process or retry
    process.exit(1);
  }
};

module.exports = connectDB;
