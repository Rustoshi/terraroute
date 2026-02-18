import mongoose from "mongoose";

/**
 * MongoDB connection utility with connection caching for serverless environments.
 * Uses a global cache to prevent multiple connections during hot reloads in development.
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Use cached connection in development to prevent multiple connections
const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (process.env.NODE_ENV === "development") {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with connection pooling and caching.
 * Safe to call multiple times - will return existing connection if available.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Wait for existing connection attempt if in progress
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Create new connection
  cached.promise = mongoose.connect(MONGODB_URI, {
    bufferCommands: false, // Disable buffering for better error handling
    maxPoolSize: 10, // Connection pool size
  });

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB (useful for cleanup in tests)
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("MongoDB disconnected");
  }
}

export default connectDB;
