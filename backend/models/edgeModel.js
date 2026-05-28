const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Edge = sequelize.define('Edge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fromNodeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  toNodeId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  weight: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
    allowNull: false
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'edges',
  timestamps: false
});

module.exports = Edge;
