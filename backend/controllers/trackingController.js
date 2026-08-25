const { Courier, TrackingHistory, User, DeliveryAgent } = require('../models');

// GET /api/tracking/:trackingNumber - Public tracking
const trackCourier = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const courier = await Courier.findOne({
      where: { trackingNumber },
      include: [
        { model: User, as: 'customer', attributes: ['name', 'phone'] },
        {
          model: DeliveryAgent,
          as: 'agent',
          include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }],
        },
        {
          model: TrackingHistory,
          as: 'trackingHistory',
          order: [['timestamp', 'ASC']],
        },
      ],
    });

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: `No shipment found with tracking number: ${trackingNumber}`,
      });
    }

    // Return safe public data (hide full addresses)
    const result = {
      trackingNumber: courier.trackingNumber,
      status: courier.status,
      packageType: courier.packageType,
      packageWeight: courier.packageWeight,
      pickupLocation: courier.pickupLocation,
      deliveryLocation: courier.deliveryLocation,
      pickupDate: courier.pickupDate,
      deliveryType: courier.deliveryType,
      senderName: courier.senderName,
      receiverName: courier.receiverName,
      bookedAt: courier.createdAt,
      trackingHistory: courier.trackingHistory,
      agent: courier.agent
        ? { name: courier.agent.user.name, phone: courier.agent.user.phone }
        : null,
    };

    res.json({ success: true, courier: result });
  } catch (error) {
    console.error('Track courier error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { trackCourier };
