const express = require('express');
const router = express.Router();
const { trackCourier } = require('../controllers/trackingController');

// Public route - no authentication needed
router.get('/:trackingNumber', trackCourier);

module.exports = router;
