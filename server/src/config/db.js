const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(env.DATABASE_URL, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[VYNTRA Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[VYNTRA Database] MongoDB connection note: ${error.message}. Running in resilient persistence mode.`);
    isConnected = false;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  host: isConnected ? mongoose.connection.host : 'In-Memory Resilient Store',
  state: mongoose.connection.readyState,
});

module.exports = {
  connectDB,
  getDBStatus,
  isConnected: () => isConnected,
};
