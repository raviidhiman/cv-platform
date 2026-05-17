const axios = require('axios');

const sendOTPEmail = async (to, otp, purpose = 'login') => {
  console.log('📧 Sending OTP to:', to, '| OTP:', otp);

  const subject = purpose === 'register'
    ? 'Verify your email — CV Platform'
    : 'Your Login OTP — CV Platform';

  const response = await axios({
    method: 'post',
    url: 'https://api.brevo.com/v3/smtp/email',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    data: {
      sender: { name: 'CV Platform', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:40px auto;padding:40px;border:1px solid #e0e0e0;background:#fff;">
          <div style="border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:24px;">
            <h2 style="margin:0;font-size:20px;">CV Platform</h2>
          </div>
          <p style="color:#333;line-height:1.6;">
            ${purpose === 'register' ? 'Welcome! Verify your email to create your account.' : 'Use the code below to login.'}
          </p>
          <div style="background:#f5f5f5;border:1px solid #ddd;padding:24px;text-align:center;margin:24px 0;">
            <div style="font-size:40px;font-weight:bold;letter-spacing:0.4em;font-family:monospace;color:#000;">${otp}</div>
            <div style="font-size:13px;color:#666;margin-top:8px;">Valid for 5 minutes only</div>
          </div>
          <p style="color:#999;font-size:12px;">If you did not request this, ignore this email.</p>
        </div>
      `,
    },
  });

  console.log('✅ OTP sent. Status:', response.status);
  return response.data;
};

module.exports = { sendOTPEmail };
