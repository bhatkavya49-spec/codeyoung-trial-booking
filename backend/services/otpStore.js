const crypto = require('crypto');

const otpStore = new Map();

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const storeOtp = (email, otp, registrationData) => {
  const hashedOtp = hashOtp(otp);
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(email, { hashedOtp, registrationData, expiresAt });
};

const verifyOtp = (email, otp) => {
  const record = otpStore.get(email);
  if (!record) {
    return { valid: false, reason: 'OTP not found or expired' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: 'OTP expired' };
  }

  const hashedOtp = hashOtp(otp);
  if (hashedOtp !== record.hashedOtp) {
    return { valid: false, reason: 'Invalid OTP' };
  }

  const registrationData = record.registrationData;
  otpStore.delete(email);
  return { valid: true, registrationData };
};

const clearOtp = (email) => {
  otpStore.delete(email);
};

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
  clearOtp
};