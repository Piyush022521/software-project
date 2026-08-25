const { Courier, TrackingHistory, Payment, User, DeliveryAgent } = require('../models');
const { generateTrackingNumber, calculateDeliveryCharge } = require('../utils/generateTracking');
const { Op } = require('sequelize');

// GET /api/couriers - Get couriers (filtered by role)
const getCouriers = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'customer') {
      whereClause.customerId = req.user.id;
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
    console.error('Get couriers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/couriers - Book a courier
const createCourier = async (req, res) => {
  try {
    const {
      senderName, senderPhone, senderAddress,
      receiverName, receiverPhone, receiverAddress,
      pickupLocation, deliveryLocation,
      packageType, packageWeight, packageDescription,
      pickupDate, deliveryType, paymentMethod,
    } = req.body;

    // Validate required fields
    if (!senderName || !senderPhone || !senderAddress ||
        !receiverName || !receiverPhone || !receiverAddress ||
        !pickupLocation || !deliveryLocation ||
        !packageWeight || !pickupDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    // Generate unique tracking number
    let trackingNumber;
    let isUnique = false;
    while (!isUnique) {
      trackingNumber = generateTrackingNumber();
      const existing = await Courier.findOne({ where: { trackingNumber } });
      if (!existing) isUnique = true;
    }

    // Calculate delivery charge
    const deliveryCharge = calculateDeliveryCharge(parseFloat(packageWeight), deliveryType || 'standard');

    const courier = await Courier.create({
      trackingNumber,
      customerId: req.user.id,
      senderName, senderPhone, senderAddress,
      receiverName, receiverPhone, receiverAddress,
      pickupLocation, deliveryLocation,
      packageType: packageType || 'parcel',
      packageWeight: parseFloat(packageWeight),
      packageDescription,
      pickupDate,
      deliveryType: deliveryType || 'standard',
      deliveryCharge: parseFloat(deliveryCharge),
      paymentMethod: paymentMethod || 'cash',
      status: 'BOOKED',
    });

    // Create initial tracking history
    await TrackingHistory.create({
      courierId: courier.id,
      status: 'BOOKED',
      location: pickupLocation,
      remarks: 'Courier booked successfully.',
      updatedBy: req.user.id,
    });

    // Create payment record
    await Payment.create({
      courierId: courier.id,
      amount: parseFloat(deliveryCharge),
      method: paymentMethod || 'cash',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Courier booked successfully.',
      courier: { ...courier.toJSON(), deliveryCharge },
      trackingNumber,
    });
  } catch (error) {
    console.error('Create courier error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/couriers/:id - Get courier by ID
const getCourierById = async (req, res) => {
  try {
    const courier = await Courier.findByPk(req.params.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: DeliveryAgent,
          as: 'agent',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
        },
        { model: TrackingHistory, as: 'trackingHistory', order: [['timestamp', 'DESC']] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!courier) {
      return res.status(404).json({ success: false, message: 'Courier not found.' });
    }

    // Customers can only see their own couriers
    if (req.user.role === 'customer' && courier.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, courier });
  } catch (error) {
    console.error('Get courier error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/couriers/:id - Update courier (admin only, for assigning agent)
const updateCourier = async (req, res) => {
  try {
    const courier = await Courier.findByPk(req.params.id);
    if (!courier) {
      return res.status(404).json({ success: false, message: 'Courier not found.' });
    }

    await courier.update(req.body);
    res.json({ success: true, message: 'Courier updated.', courier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/couriers/:id - Cancel courier (customer only, only if BOOKED)
const cancelCourier = async (req, res) => {
  try {
    const courier = await Courier.findByPk(req.params.id);

    if (!courier) {
      return res.status(404).json({ success: false, message: 'Courier not found.' });
    }

    if (req.user.role === 'customer' && courier.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (courier.status !== 'BOOKED') {
      return res.status(400).json({
        success: false,
        message: 'Courier can only be cancelled before pickup.',
      });
    }

    await courier.update({ status: 'CANCELLED' });

    await TrackingHistory.create({
      courierId: courier.id,
      status: 'CANCELLED',
      location: courier.pickupLocation,
      remarks: 'Booking cancelled by customer.',
      updatedBy: req.user.id,
    });

    res.json({ success: true, message: 'Courier cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCouriers, createCourier, getCourierById, updateCourier, cancelCourier };
