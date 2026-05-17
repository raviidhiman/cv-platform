require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://cv-platformm.onrender.com',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);
app.use('/user', userRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => res.json({ message: 'CV Platform API 🚀' }));

app.get('/test-email', async (req, res) => {
  try {
    const { sendOTPEmail } = require('./utils/mailer');
    await sendOTPEmail(process.env.EMAIL_USER, '123456', 'login');
    res.json({ message: 'Test email sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Email failed', error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log('📧 Email:', process.env.EMAIL_USER);
    console.log('🤖 Gemini AI:', process.env.GEMINI_API_KEY ? 'configured' : 'NOT SET');
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });
