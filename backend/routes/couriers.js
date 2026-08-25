const express = require('express');
const router = express.Router();
const {
  getCouriers,
  createCourier,
  getCourierById,
  updateCourier,
  cancelCourier,
} = require('../controllers/courierController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getCouriers);
router.post('/', authenticate, authorize('customer'), createCourier);
router.get('/:id', authenticate, getCourierById);
router.put('/:id', authenticate, authorize('admin'), updateCourier);
router.delete('/:id', authenticate, authorize('customer', 'admin'), cancelCourier);

module.exports = router;
