const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getCustomers,
  getAllCouriers,
  assignAgent,
  getReports,
  toggleUserStatus,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/customers', getCustomers);
router.get('/couriers', getAllCouriers);
router.put('/couriers/:id/assign', assignAgent);
router.get('/reports', getReports);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
