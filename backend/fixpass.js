require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  // Fix admin password
  const adminHash = await bcrypt.hash('admin123', 12);
  const adminResult = await User.findOneAndUpdate(
    { email: 'admin@eatloop.com' },
    { password: adminHash },
    { new: true }
  );
  console.log('Admin updated:', adminResult ? 'YES' : 'NOT FOUND');

  // Fix other passwords
  const userHash = await bcrypt.hash('password123', 12);
  const r1 = await User.findOneAndUpdate({ email: 'raj@eatloop.com' }, { password: userHash });
  const r2 = await User.findOneAndUpdate({ email: 'priya@eatloop.com' }, { password: userHash });
  const r3 = await User.findOneAndUpdate({ email: 'aman@eatloop.com' }, { password: userHash });

  console.log('raj updated:', r1 ? 'YES' : 'NOT FOUND');
  console.log('priya updated:', r2 ? 'YES' : 'NOT FOUND');
  console.log('aman updated:', r3 ? 'YES' : 'NOT FOUND');

  // Verify - test the password
  const admin = await User.findOne({ email: 'admin@eatloop.com' }).select('+password');
  const isMatch = await bcrypt.compare('admin123', admin.password);
  console.log('Password verify test:', isMatch ? 'CORRECT ✅' : 'STILL WRONG ❌');

  mongoose.disconnect();
  process.exit(0);
});