const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DrillSession = sequelize.define('DrillSession', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false // e.g. "Q2 Campus-Wide Earthquake Drill"
  },
  status: {
    type: DataTypes.ENUM('active', 'concluded'),
    defaultValue: 'active'
  },
  activatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'drill_sessions',
  timestamps: false
});

module.exports = DrillSession;
