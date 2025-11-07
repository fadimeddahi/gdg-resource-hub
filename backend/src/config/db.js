// src/config/db.js
// MongoDB connection logic using Mongoose with best practices

import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  console.log(mongoUri)
  
  if (!mongoUri) {
    console.error("❌ MONGO_URI not set in environment");
    process.exit(1);
  }

    // Mongoose 6+ doesn't need useNewUrlParser and useUnifiedTopology
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners for better monitoring
    mongoose.connection.on("connected", () => {
      console.log("📡 Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("📴 Mongoose disconnected");
    });

};

export default connectDB;
