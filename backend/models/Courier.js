const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Courier extends Model {}

Courier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'DeliveryAgents', key: 'id' },
    },
    // Sender info
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Receiver info
    receiverName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiverPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiverAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Locations
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Package details
    packageType: {
      type: DataTypes.ENUM('document', 'parcel', 'fragile', 'electronics', 'clothing', 'other'),
      defaultValue: 'parcel',
    },
    packageWeight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    packageDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Booking details
    pickupDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deliveryType: {
      type: DataTypes.ENUM('standard', 'express', 'overnight'),
      defaultValue: 'standard',
    },
    deliveryCharge: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'online', 'cod'),
      defaultValue: 'cash',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid'),
      defaultValue: 'pending',
    },
    // Shipment status
    status: {
      type: DataTypes.ENUM(
        'BOOKED',
        'PICKED_UP',
        'IN_TRANSIT',
        'AT_HUB',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'DELIVERY_FAILED',
        'CANCELLED'
      ),
      defaultValue: 'BOOKED',
    },
  },
  {
    sequelize,
    modelName: 'Courier',
  }
);

module.exports = Courier;
