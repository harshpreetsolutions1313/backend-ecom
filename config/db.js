const mongoose = require('mongoose');

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {

  // Return existing connection if available
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  // Prevent multiple connection attempts
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false, // for serverless
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
  }).then((conn) => {
    isConnected = true;
    console.log('MongoDB connected successfully');
    return conn;
  }).catch((error) => {
    console.error('MongoDB connection error:', error);
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
};

module.exports = connectDB;