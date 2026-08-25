const { User, Customer, DeliveryAgent, Courier, TrackingHistory, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/admin/dashboard - Dashboard statistics
const getDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.count({ where: { role: 'customer' } });
    const totalAgents = await User.count({ where: { role: 'agent' } });
    const totalCouriers = await Courier.count();

    const pendingShipments = await Courier.count({ where: { status: 'BOOKED' } });
    const inTransitShipments = await Courier.count({
      where: { status: { [Op.in]: ['PICKED_UP', 'IN_TRANSIT', 'AT_HUB', 'OUT_FOR_DELIVERY'] } },
    });
    const deliveredShipments = await Courier.count({ where: { status: 'DELIVERED' } });
    const failedDeliveries = await Courier.count({ where: { status: 'DELIVERY_FAILED' } });
    const cancelledShipments = await Courier.count({ where: { status: 'CANCELLED' } });

    // Revenue
    const revenueData = await Payment.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      where: { status: 'paid' },
    });
    const totalRevenue = revenueData?.dataValues?.total || 0;

    // Recent bookings
    const recentCouriers = await Courier.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }],
    });

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalAgents,
        totalCouriers,
        pendingShipments,
        inTransitShipments,
        deliveredShipments,
        failedDeliveries,
        cancelledShipments,
        totalRevenue,
      },
      recentCouriers,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/customers - List all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'customer' },
      attributes: { exclude: ['password'] },
      include: [{ model: Customer, as: 'customerProfile' }],
      order: [['createdAt', 'DESC']],
    });

    // Add courier count for each customer
    const customersWithCount = await Promise.all(
      customers.map(async (c) => {
        const count = await Courier.count({ where: { customerId: c.id } });
        return { ...c.toJSON(), courierCount: count };
      })
    );

    res.json({ success: true, customers: customersWithCount });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/couriers - All couriers with details
const getAllCouriers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let whereClause = {};

    if (status) whereClause.status = status;
    if (search) {
      whereClause[Op.or] = [
        { trackingNumber: { [Op.like]: `%${search}%` } },
        { senderName: { [Op.like]: `%${search}%` } },
        { receiverName: { [Op.like]: `%${search}%` } },
      ];
    }

    const couriers = await Courier.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: DeliveryAgent,
          as: 'agent',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, couriers });
  } catch (error) {
    console.error('Get all couriers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/couriers/:id/assign - Assign courier to delivery agent
const assignAgent = async (req, res) => {
  try {
    const { agentId } = req.body;
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) return res.status(404).json({ success: false, message: 'Courier not found.' });

    const agent = await DeliveryAgent.findByPk(agentId);
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found.' });

    await courier.update({ agentId });

    await TrackingHistory.create({
      courierId: courier.id,
      status: courier.status,
      location: courier.pickupLocation,
      remarks: 'Delivery agent assigned.',
      updatedBy: req.user.id,
    });

    res.json({ success: true, message: 'Delivery agent assigned successfully.', courier });
  } catch (error) {
    console.error('Assign agent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/reports - Reports data
const getReports = async (req, res) => {
  try {
    // Status distribution
    const statusCounts = await Courier.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    // Daily bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyBookings = await Courier.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    });

    // Package type distribution
    const packageTypes = await Courier.findAll({
      attributes: ['packageType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['packageType'],
    });

    res.json({ success: true, reports: { statusCounts, dailyBookings, packageTypes } });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/users/:id/toggle - Toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.update({ isActive: !user.isActive });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboard, getCustomers, getAllCouriers, assignAgent, getReports, toggleUserStatus };
