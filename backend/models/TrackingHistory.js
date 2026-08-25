const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class TrackingHistory extends Model {}

TrackingHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    courierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Couriers', key: 'id' },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'TrackingHistory',
  }
);

module.exports = TrackingHistory;
