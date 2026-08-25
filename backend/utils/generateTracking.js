/**
 * Generates a unique tracking number like BD2026000123
 */
function generateTrackingNumber() {
  const prefix = 'BD';
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random
  return `${prefix}${year}${random}`;
}

/**
 * Calculate delivery charge based on weight and delivery type
 */
function calculateDeliveryCharge(weight, deliveryType) {
  const baseRate = 30; // base rate per kg
  const weightCharge = weight * baseRate;

  const multipliers = {
    standard: 1,
    express: 1.8,
    overnight: 2.5,
  };

  const multiplier = multipliers[deliveryType] || 1;
  const total = weightCharge * multiplier;

  // Minimum charge
  return Math.max(total, 50).toFixed(2);
}

module.exports = { generateTrackingNumber, calculateDeliveryCharge };
