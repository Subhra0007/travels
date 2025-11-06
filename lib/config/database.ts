import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

let isConnected = false;

export default async function dbConnect() {
  if (isConnected) return;
  const db = await mongoose.connect(MONGODB_URI);
  isConnected = !!db.connections[0].readyState;
  console.log("✅ MongoDB connected");
}
