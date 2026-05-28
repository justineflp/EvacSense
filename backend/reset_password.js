const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/userModel');

async function run() {
  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email: 'allankrsna@cit.edu' } });
    if (user) {
      const passwordHash = await bcrypt.hash('CITCCS2026!', 10);
      await user.update({ passwordHash, failedAttempts: 0, status: 'active' });
      console.log('Successfully reset password for allankrsna@cit.edu to CITCCS2026!');
    } else {
      console.log('User allankrsna@cit.edu not found!');
    }
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
