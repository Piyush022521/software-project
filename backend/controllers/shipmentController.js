const { Courier, TrackingHistory, DeliveryAgent, User } = require('../models');

const VALID_STATUSES = [
  'BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'AT_HUB',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'CANCELLED',
];

// GET /api/shipments - Get shipments (agent sees only assigned ones)
const getShipments = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'agent') {
      const agent = await DeliveryAgent.findOne({ where: { userId: req.user.id } });
      if (!agent) return res.status(404).json({ success: false, message: 'Agent profile not found.' });
      whereClause.agentId = agent.id;
    }

    const shipments = await Courier.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: DeliveryAgent,
          as: 'agent',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
        },
        { model: TrackingHistory, as: 'trackingHistory', order: [['timestamp', 'DESC']] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, shipments });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/shipments/:id/status - Update shipment status
const updateShipmentStatus = async (req, res) => {
  try {
    const { status, location, remarks } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const courier = await Courier.findByPk(req.params.id);
    if (!courier) {
      return res.status(404).json({ success: false, message: 'Shipment not found.' });
    }

    // Agents can only update their own assigned shipments
    if (req.user.role === 'agent') {
      const agent = await DeliveryAgent.findOne({ where: { userId: req.user.id } });
      if (!agent || courier.agentId !== agent.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this shipment.' });
      }
    }

    await courier.update({ status });

    await TrackingHistory.create({
      courierId: courier.id,
      status,
      location: location || courier.deliveryLocation,
      remarks: remarks || `Status updated to ${status}`,
      updatedBy: req.user.id,
    });

    res.json({ success: true, message: `Status updated to ${status}.`, courier });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getShipments, updateShipmentStatus };
