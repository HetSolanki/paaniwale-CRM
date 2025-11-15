import mongoose from "mongoose";
import process from "process";

export const connect = (url) => {
  const options = {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 50, // Increased from 10 to 50 for better connection pooling
    minPoolSize: 10, // Maintain minimum 10 connections in pool
    maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
    bufferCommands: false, // Disable mongoose buffering
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true, // Retry writes on network errors
    retryReads: true, // Retry reads on network errors
    compressors: ["zlib"], // Enable compression
    zlibCompressionLevel: 6, // Balanced compression
  };

  // Enable Mongoose debug mode in development
  if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
  }

  // Optimize Mongoose settings
  mongoose.set("strictQuery", true); // Strict mode for queries
  // mongoose.set("autoIndex", process.env.NODE_ENV === "development"); // Auto-create indexes only in dev

  return mongoose.connect(url, options);
};
