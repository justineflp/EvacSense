const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true // e.g. "ROOM-401"
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false // e.g. "Room 401 (CS Lab)"
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false // e.g. 4
  },
  building: {
    type: DataTypes.STRING,
    defaultValue: 'College of Computer Studies'
  },
  // Simple coordinate boundaries for weighted-centroid positioning mapping
  xMin: { type: DataTypes.FLOAT, allowNull: false },
  xMax: { type: DataTypes.FLOAT, allowNull: false },
  yMin: { type: DataTypes.FLOAT, allowNull: false },
  yMax: { type: DataTypes.FLOAT, allowNull: false }
}, {
  tableName: 'rooms',
  timestamps: false
});

module.exports = Room;
