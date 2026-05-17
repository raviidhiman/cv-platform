const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Profile not found.' });
    const resume = await Resume.findOne({ userId: user._id });
    if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    await User.updateOne({ _id: user._id }, { $inc: { profileViews: 1 } });
    res.json({ resume, user: { name: user.name, username: user.username, profileViews: user.profileViews } });
  } catch (err) {
    console.error('Get resume error:', err);
    res.status(500).json({ message: 'Failed to fetch resume.' });
  }
});

router.get('/me/data', authMiddleware, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.user.userId });
    if (!resume) resume = await Resume.create({ userId: req.user.userId });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume.' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id; delete updates.userId; delete updates.__v;
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: false }
    );
    res.json({ message: 'Resume updated.', resume });
  } catch (err) {
    console.error('Update resume error:', err);
    res.status(500).json({ message: 'Failed to update resume.' });
  }
});

router.put('/settings/update', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { settings: req.body } },
      { new: true }
    );
    res.json({ message: 'Settings updated.', resume });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings.' });
  }
});

module.exports = router;
