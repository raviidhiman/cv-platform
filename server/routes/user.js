const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/auth');
const { uploadPhoto } = require('../utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Failed to fetch user.' }); }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, username } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (username) {
      if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) return res.status(400).json({ message: 'Invalid username format.' });
      const existing = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.user.userId } });
      if (existing) return res.status(400).json({ message: 'Username already taken.' });
      updates.username = username.toLowerCase();
    }
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated.', user });
  } catch (err) { res.status(500).json({ message: 'Failed to update profile.' }); }
});

router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'All fields required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const user = await User.findById(req.user.userId);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) { res.status(500).json({ message: 'Failed to change password.' }); }
});

router.post('/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No photo uploaded.' });
    const user = await User.findById(req.user.userId);
    const photoUrl = await uploadPhoto(req.file.buffer, user.username);
    await Resume.findOneAndUpdate({ userId: req.user.userId }, { $set: { 'personal.photo': photoUrl } });
    res.json({ message: 'Photo uploaded.', photoUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ message: 'Failed to upload photo.' });
  }
});

router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await Resume.deleteOne({ userId: req.user.userId });
    await User.deleteOne({ _id: req.user.userId });
    res.json({ message: 'Account deleted.' });
  } catch (err) { res.status(500).json({ message: 'Failed to delete account.' }); }
});

module.exports = router;
