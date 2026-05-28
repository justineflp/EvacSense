const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassroomOccupancy = sequelize.define('ClassroomOccupancy', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  drillId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: true // Can be null if status is 'Location-Unverified'
  },
  detectionMethod: {
    type: DataTypes.ENUM('auto', 'manual'),
    defaultValue: 'auto'
  },
  status: {
    type: DataTypes.ENUM('verified', 'Location-Unverified'),
    defaultValue: 'Location-Unverified'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'classroom_occupancy',
  timestamps: false
});

module.exports = ClassroomOccupancy;
