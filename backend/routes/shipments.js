const express = require('express');
const router = express.Router();
const { getShipments, updateShipmentStatus } = require('../controllers/shipmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'agent'), getShipments);
router.put('/:id/status', authenticate, authorize('admin', 'agent'), updateShipmentStatus);

module.exports = router;
