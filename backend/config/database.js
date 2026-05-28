const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize database with SQLite for seamless development and portable execution
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../evacsense.sqlite'),
  logging: false // Toggle true if full query logging is desired for debugging
});

module.exports = sequelize;
