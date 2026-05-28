const { Sequelize } = require('sequelize');
const path = require('path');
const sequelize = require('./config/database');
const User = require('./models/userModel');

async function run() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('--- ALL USERS IN DB ---');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Status: ${u.status} | Role: ${u.role}`);
    });
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
