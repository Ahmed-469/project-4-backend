const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await User.create({
      username: 'Qasim',
      hashedPassword: bcrypt.hashSync('321', 10),
      role: 'admin'
    }); 



    console.log('✅ Admin created: Qasim / 321');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
