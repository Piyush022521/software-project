const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const DeliveryAgent = require('./DeliveryAgent');
const Courier = require('./Courier');
const TrackingHistory = require('./TrackingHistory');
const Payment = require('./Payment');

// User -> Customer (one-to-one)
User.hasOne(Customer, { foreignKey: 'userId', as: 'customerProfile' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> DeliveryAgent (one-to-one)
User.hasOne(DeliveryAgent, { foreignKey: 'userId', as: 'agentProfile' });
DeliveryAgent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User (Customer) -> Courier (one-to-many)
User.hasMany(Courier, { foreignKey: 'customerId', as: 'couriers' });
Courier.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// DeliveryAgent -> Courier (one-to-many)
DeliveryAgent.hasMany(Courier, { foreignKey: 'agentId', as: 'assignedCouriers' });
Courier.belongsTo(DeliveryAgent, { foreignKey: 'agentId', as: 'agent' });

// Courier -> TrackingHistory (one-to-many)
Courier.hasMany(TrackingHistory, { foreignKey: 'courierId', as: 'trackingHistory' });
TrackingHistory.belongsTo(Courier, { foreignKey: 'courierId', as: 'courier' });

// Courier -> Payment (one-to-one)
Courier.hasOne(Payment, { foreignKey: 'courierId', as: 'payment' });
Payment.belongsTo(Courier, { foreignKey: 'courierId', as: 'courier' });

module.exports = {
  sequelize,
  User,
  Customer,
  DeliveryAgent,
  Courier,
  TrackingHistory,
  Payment,
};
