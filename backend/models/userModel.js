const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      isCITEmail(value) {
        if (!value.endsWith('@cit.edu') && !value.endsWith('@student.cit.edu')) {
          throw new Error('Only institutional emails (@cit.edu or @student.cit.edu) are accepted.');
        }
      }
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true // Can be null if using Google SSO exclusively
  },
  role: {
    type: DataTypes.ENUM('Student', 'Teacher', 'Drill Coordinator', 'System Admin'),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'locked', 'Pending Approval', 'Rejected'),
    defaultValue: 'active'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
