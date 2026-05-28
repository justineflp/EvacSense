const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccessPoint = sequelize.define('AccessPoint', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true // e.g. "AP-01"
  },
  macAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // e.g. "00:0a:95:9d:68:16"
  },
  ssid: {
    type: DataTypes.STRING,
    defaultValue: 'CITU_WiFi_Secure'
  },
  // Physical coordinates on floor layout for weighted triangulation calculations
  x: { type: DataTypes.FLOAT, allowNull: false },
  y: { type: DataTypes.FLOAT, allowNull: false },
  floor: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'access_points',
  timestamps: false
});

module.exports = AccessPoint;
