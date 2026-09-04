const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const seedAdmin = async () => {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE } = process.env;

  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required');
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
  }

  await mongoose.connect(MONGODB_URI, { dbName: 'civicfix' });
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.name = ADMIN_NAME || existingUser.name;
    existingUser.phone = ADMIN_PHONE || existingUser.phone;
    existingUser.role = 'admin';
    existingUser.password = ADMIN_PASSWORD;
    await existingUser.save();
    console.log(`Admin account updated for ${email}`);
  } else {
    await User.create({
      name: ADMIN_NAME || 'CivicFix Administrator',
      email,
      password: ADMIN_PASSWORD,
      phone: ADMIN_PHONE || '',
      role: 'admin',
    });
    console.log(`Admin account created for ${email}`);
  }
};

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
