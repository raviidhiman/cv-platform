const crypto = require('crypto');

const generateOTP = () => {
  const bytes = crypto.randomBytes(3);
  return String(parseInt(bytes.toString('hex'), 16) % 1000000).padStart(6, '0');
};

const getOTPExpiry = () => new Date(Date.now() + 5 * 60 * 1000);

module.exports = { generateOTP, getOTPExpiry };
