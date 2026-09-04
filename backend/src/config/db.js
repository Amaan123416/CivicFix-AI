
const mongoose = require('mongoose');

require('dotenv').config();

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(mongoUri, {
    dbName: 'civicfix',
  });

  console.log('MongoDB connected');
};

module.exports = connectDB;