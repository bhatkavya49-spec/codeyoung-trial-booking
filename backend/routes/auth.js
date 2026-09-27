const express = require('express');
const Parent = require('../models/Parent');
const { generateOtp, storeOtp, verifyOtp, clearOtp } = require('../services/otpStore');
const { sendOtpEmail } = require('../services/emailService');

const router = express.Router();

const validateRegistrationInput = (data) => {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = 'Name is required';
  if (!data.email || !data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
  if (!data.phone || !data.phone.trim()) errors.phone = 'Phone is required';
  if (!data.subject || !data.subject.trim()) errors.subject = 'Subject is required';
  if (!data.timezone || !data.timezone.trim()) errors.timezone = 'Timezone is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateLoginEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
};

router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, phone, subject, timezone } = req.body;

    const { isValid, errors } = validateRegistrationInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const existingParent = await Parent.findOne({ email: email.toLowerCase() });
    if (existingParent) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const otp = generateOtp();
    storeOtp(email.toLowerCase(), otp, { name: name.trim(), email: email.toLowerCase(), phone: phone.trim(), subject: subject.trim(), timezone: timezone.trim() });

    await sendOtpEmail(email, name.trim(), otp);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const { valid, registrationData, reason } = verifyOtp(email.toLowerCase(), code.toString());
    if (!valid) {
      return res.status(400).json({ success: false, message: reason });
    }

    const parent = await Parent.create({
      name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone,
      timezone: registrationData.timezone,
      emailVerified: true
    });

    res.json({
      success: true,
      parentId: parent._id.toString(),
      parent: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        timezone: parent.timezone,
        emailVerified: parent.emailVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

router.post('/login/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const emailError = validateLoginEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const parent = await Parent.findOne({ email: normalizedEmail });

    if (!parent) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please register first.' });
    }

    if (!parent.emailVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please complete registration first.' });
    }

    const otp = generateOtp();
    storeOtp(normalizedEmail, otp, { parentId: parent._id.toString(), name: parent.name, email: parent.email, phone: parent.phone, timezone: parent.timezone });

    await sendOtpEmail(parent.email, parent.name, otp);

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Login send OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const { valid, registrationData, reason } = verifyOtp(normalizedEmail, code.toString());
    if (!valid) {
      return res.status(400).json({ success: false, message: reason });
    }

    const parent = await Parent.findOne({ email: normalizedEmail });
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (!parent.emailVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified' });
    }

    res.json({
      success: true,
      parentId: parent._id.toString(),
      parent: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        timezone: parent.timezone,
        emailVerified: parent.emailVerified
      }
    });
  } catch (error) {
    console.error('Login verify OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to verify code' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const { parentId } = req.query;

    if (!parentId) {
      return res.status(400).json({ success: false, message: 'parentId is required' });
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    res.json({
      success: true,
      parent: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        timezone: parent.timezone,
        emailVerified: parent.emailVerified
      }
    });
  } catch (error) {
    console.error('Get parent profile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get parent profile' });
  }
});

module.exports = router;