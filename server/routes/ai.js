const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

router.post('/fill', authMiddleware, async (req, res) => {
  try {
    const { message, section } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required.' });

    const formats = {
      experience: '{"company":"","role":"","startDate":"","endDate":"","location":"","bullets":[]}',
      education: '{"institution":"","degree":"","field":"","startYear":"","endYear":"","grade":"","location":""}',
      projects: '{"title":"","description":"","tech":[],"github":"","link":""}',
      skills: '{"category":"","items":[]}',
      achievements: '{"title":"","description":"","year":""}',
      personal: '{"name":"","email":"","phone":"","location":"","linkedin":"","github":"","website":"","summary":""}',
    };

    const prompt = `You are a professional CV writing assistant. Extract structured data from the user description and return ONLY a valid JSON object. No markdown, no code blocks, no explanation, just pure JSON.

Section: ${section}
Return this exact JSON format: ${formats[section] || '{}'}

Rules:
- Use empty string for missing fields
- Make bullet points professional and achievement-focused
- Dates format: "Mon YYYY" for experience, "YYYY" for education

User input: ${message}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a professional CV writing assistant. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content || '';
    console.log('Groq response:', raw);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ success: false, message: 'Could not extract data. Try rephrasing.' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error('AI fill error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required.' });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a professional CV writing expert. Respond concisely in plain text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '';
    res.json({ success: true, text });

  } catch (err) {
    console.error('AI suggest error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

module.exports = router;