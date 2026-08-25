const { sequelize, User, Customer, DeliveryAgent, Courier, TrackingHistory, Payment } = require('../models');
require('dotenv').config();

async function seed() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // ── Create Admin ──────────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@courier.com',
      password: 'Admin@123',
      phone: '9800000001',
      role: 'admin',
    });
    console.log('Admin created:', admin.email);

    // ── Create Customer ───────────────────────────────────────────
    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@courier.com',
      password: 'Customer@123',
      phone: '9800000002',
      role: 'customer',
    });
    await Customer.create({
      userId: customerUser.id,
      address: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    });
    console.log('Customer created:', customerUser.email);

    // ── Create Delivery Agent ─────────────────────────────────────
    const agentUser = await User.create({
      name: 'Suresh Kumar',
      email: 'agent@courier.com',
      password: 'Agent@123',
      phone: '9800000003',
      role: 'agent',
    });
    const agent = await DeliveryAgent.create({
      userId: agentUser.id,
      vehicleType: 'Bike',
      vehicleNumber: 'MH12AB1234',
      serviceArea: 'Mumbai, Thane',
      isAvailable: true,
    });
    console.log('Delivery agent created:', agentUser.email);

    // ── Create Sample Couriers ────────────────────────────────────
    const couriersData = [
      {
        trackingNumber: 'BD2026001001',
        customerId: customerUser.id,
        agentId: agent.id,
        senderName: 'Rahul Sharma',
        senderPhone: '9800000002',
        senderAddress: '123 MG Road, Mumbai',
        receiverName: 'Priya Patel',
        receiverPhone: '9800000010',
        receiverAddress: '456 Park Street, Delhi',
        pickupLocation: 'Mumbai',
        deliveryLocation: 'Delhi',
        packageType: 'document',
        packageWeight: 0.5,
        packageDescription: 'Legal documents',
        pickupDate: '2026-08-25',
        deliveryType: 'express',
        deliveryCharge: 270.0,
        paymentMethod: 'online',
        paymentStatus: 'paid',
        status: 'DELIVERED',
      },
      {
        trackingNumber: 'BD2026001002',
        customerId: customerUser.id,
        agentId: agent.id,
        senderName: 'Rahul Sharma',
        senderPhone: '9800000002',
        senderAddress: '123 MG Road, Mumbai',
        receiverName: 'Amit Verma',
        receiverPhone: '9800000011',
        receiverAddress: '789 Lake View, Pune',
        pickupLocation: 'Mumbai',
        deliveryLocation: 'Pune',
        packageType: 'electronics',
        packageWeight: 2.0,
        packageDescription: 'Laptop',
        pickupDate: '2026-08-26',
        deliveryType: 'standard',
        deliveryCharge: 120.0,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        status: 'IN_TRANSIT',
      },
      {
        trackingNumber: 'BD2026001003',
        customerId: customerUser.id,
        agentId: null,
        senderName: 'Rahul Sharma',
        senderPhone: '9800000002',
        senderAddress: '123 MG Road, Mumbai',
        receiverName: 'Neha Singh',
        receiverPhone: '9800000012',
        receiverAddress: '321 Hill Road, Bangalore',
        pickupLocation: 'Mumbai',
        deliveryLocation: 'Bangalore',
        packageType: 'parcel',
        packageWeight: 3.5,
        packageDescription: 'Clothing items',
        pickupDate: '2026-08-27',
        deliveryType: 'standard',
        deliveryCharge: 210.0,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'BOOKED',
      },
    ];

    for (const data of couriersData) {
      const courier = await Courier.create(data);

      // Create tracking history for each
      await TrackingHistory.create({
        courierId: courier.id,
        status: 'BOOKED',
        location: courier.pickupLocation,
        remarks: 'Courier booked successfully.',
        updatedBy: customerUser.id,
        timestamp: new Date(courier.createdAt),
      });

      if (courier.status === 'IN_TRANSIT' || courier.status === 'DELIVERED') {
        await TrackingHistory.create({
          courierId: courier.id,
          status: 'PICKED_UP',
          location: courier.pickupLocation,
          remarks: 'Package picked up by delivery agent.',
          updatedBy: agentUser.id,
          timestamp: new Date(Date.now() - 3600000),
        });
        await TrackingHistory.create({
          courierId: courier.id,
          status: 'IN_TRANSIT',
          location: 'In Transit Hub',
          remarks: 'Package in transit.',
          updatedBy: agentUser.id,
          timestamp: new Date(Date.now() - 1800000),
        });
      }

      if (courier.status === 'DELIVERED') {
        await TrackingHistory.create({
          courierId: courier.id,
          status: 'OUT_FOR_DELIVERY',
          location: courier.deliveryLocation,
          remarks: 'Out for delivery.',
          updatedBy: agentUser.id,
          timestamp: new Date(Date.now() - 600000),
        });
        await TrackingHistory.create({
          courierId: courier.id,
          status: 'DELIVERED',
          location: courier.deliveryLocation,
          remarks: 'Package delivered successfully.',
          updatedBy: agentUser.id,
          timestamp: new Date(),
        });
      }

      // Create payment record
      await Payment.create({
        courierId: courier.id,
        amount: courier.deliveryCharge,
        method: courier.paymentMethod,
        status: courier.paymentStatus,
      });
    }

    console.log('Sample couriers created.');
    console.log('\n=== SEED COMPLETE ===');
    console.log('Admin:    admin@courier.com   / Admin@123');
    console.log('Customer: customer@courier.com / Customer@123');
    console.log('Agent:    agent@courier.com   / Agent@123');
    console.log('====================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
