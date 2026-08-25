const express = require('express');
const router = express.Router();
const {
  getDeliveryAgents,
  getDeliveryAgentById,
  updateDeliveryAgent,
  createDeliveryAgent,
} = require('../controllers/deliveryAgentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), getDeliveryAgents);
router.post('/create', authenticate, authorize('admin'), createDeliveryAgent);
router.get('/:id', authenticate, authorize('admin'), getDeliveryAgentById);
router.put('/:id', authenticate, authorize('admin', 'agent'), updateDeliveryAgent);

module.exports = router;
