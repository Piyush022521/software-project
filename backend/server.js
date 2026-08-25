const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const courierRoutes = require('./routes/couriers');
const trackingRoutes = require('./routes/tracking');
const shipmentRoutes = require('./routes/shipments');
const deliveryAgentRoutes = require('./routes/deliveryAgents');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/couriers', courierRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/delivery-agents', deliveryAgentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Courier Service API is running.', timestamp: new Date() });
});

// Serve frontend pages
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

// Sync database then start server
sequelize
  .sync()
  .then(() => {
    console.log('Database connected and synced.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
