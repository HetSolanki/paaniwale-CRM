import mongoose from "mongoose";

export const connect = (url) => {
  const options = {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    bufferCommands: false, // Disable mongoose buffering
    family: 4, // Use IPv4, skip trying IPv6
  };

  return mongoose.connect(url, options);
};
