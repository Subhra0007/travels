import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

let isConnected = false;

export default async function dbConnect() {
  // Check if we're already connected
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // Check if mongoose is already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log("✅ Using existing Mongoose connection");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable command buffering
    });
    isConnected = !!db.connections[0].readyState;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}