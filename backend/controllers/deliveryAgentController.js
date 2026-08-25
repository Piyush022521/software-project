const { DeliveryAgent, User, Courier } = require('../models');

// GET /api/delivery-agents - Get all delivery agents (admin only)
const getDeliveryAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgent.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'isActive'] }],
    });

    res.json({ success: true, agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/delivery-agents/:id - Get single agent
const getDeliveryAgentById = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
    });

    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });

    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/delivery-agents/:id - Update agent profile
const updateDeliveryAgent = async (req, res) => {
  try {
    const { vehicleType, vehicleNumber, serviceArea, isAvailable } = req.body;

    const agent = await DeliveryAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });

    await agent.update({ vehicleType, vehicleNumber, serviceArea, isAvailable });

    res.json({ success: true, message: 'Agent updated.', agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/delivery-agents/create - Admin creates a delivery agent account
const createDeliveryAgent = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, vehicleNumber, serviceArea } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const user = await User.create({ name, email, password, phone, role: 'agent' });
    const agent = await DeliveryAgent.create({
      userId: user.id,
      vehicleType,
      vehicleNumber,
      serviceArea,
    });

    res.status(201).json({ success: true, message: 'Delivery agent created.', agent });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDeliveryAgents, getDeliveryAgentById, updateDeliveryAgent, createDeliveryAgent };
