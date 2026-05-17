const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const Resume = require('../models/Resume');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/mailer');
const authMiddleware = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, username, email } = req.body;
    if (!name || !username || !email) return res.status(400).json({ message: 'All fields required.' });
    if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) return res.status(400).json({ message: 'Username must be 3-20 chars, letters numbers or underscore.' });
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken.' });
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered. Please login.' });
    await OTP.deleteMany({ email: email.toLowerCase() });
    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp, purpose: 'register', expiresAt: getOTPExpiry() });
    await sendOTPEmail(email, otp, 'register');
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

router.post('/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required.' });
    const record = await OTP.findOne({ email: email.toLowerCase(), purpose: 'register' });
    if (!record) return res.status(400).json({ message: 'OTP not found. Request a new one.' });
    if (new Date() > record.expiresAt) { await OTP.deleteOne({ _id: record._id }); return res.status(400).json({ message: 'OTP expired.' }); }
    if (record.attempts >= 5) { await OTP.deleteOne({ _id: record._id }); return res.status(429).json({ message: 'Too many attempts.' }); }
    if (record.otp !== otp.trim()) { await OTP.updateOne({ _id: record._id }, { $inc: { attempts: 1 } }); return res.status(400).json({ message: `Invalid OTP. ${5 - record.attempts - 1} attempts remaining.` }); }
    await OTP.deleteOne({ _id: record._id });
    res.json({ message: 'OTP verified. Please set your password.', otpVerified: true });
  } catch (err) {
    console.error('Verify register error:', err);
    res.status(500).json({ message: 'Verification failed.' });
  }
});

router.post('/complete-register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'All fields required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered.' });
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken.' });
    const user = await User.create({ name, username: username.toLowerCase(), email: email.toLowerCase(), password, isVerified: true });
    await Resume.create({ userId: user._id, personal: { name, email: email.toLowerCase() } });
    const token = jwt.sign({ userId: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Account created!', token, user: { name: user.name, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Complete register error:', err);
    res.status(500).json({ message: 'Failed to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with this email.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });
    const token = jwt.sign({ userId: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful.', token, user: { name: user.name, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account with this email.' });
    await OTP.deleteMany({ email: email.toLowerCase() });
    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp, purpose: 'login', expiresAt: getOTPExpiry() });
    await sendOTPEmail(email, otp, 'login');
    res.json({ message: 'OTP sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const record = await OTP.findOne({ email: email.toLowerCase() });
    if (!record) return res.status(400).json({ message: 'OTP not found.' });
    if (new Date() > record.expiresAt) { await OTP.deleteOne({ _id: record._id }); return res.status(400).json({ message: 'OTP expired.' }); }
    if (record.otp !== otp.trim()) { await OTP.updateOne({ _id: record._id }, { $inc: { attempts: 1 } }); return res.status(400).json({ message: 'Invalid OTP.' }); }
    await OTP.deleteOne({ _id: record._id });
    const user = await User.findOne({ email: email.toLowerCase() });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Reset failed.' });
  }
});

router.get('/verify-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -__v');
    if (!user) return res.status(404).json({ valid: false });
    res.json({ valid: true, user });
  } catch { res.status(401).json({ valid: false }); }
});

router.get('/check-username/:username', async (req, res) => {
  const exists = await User.findOne({ username: req.params.username.toLowerCase() });
  res.json({ available: !exists });
});

module.exports = router;
