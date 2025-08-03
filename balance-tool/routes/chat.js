const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
console.log("chat.js loaded");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

router.post('/', authenticateToken, async (req, res) => {
  console.log("📩 /chat endpoint hit", req.method);

  const { question } = req.body;
  const companyId = req.user.companyId;
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM balance_sheets WHERE company_id = ? ORDER BY year DESC LIMIT 5`,
      [companyId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'No data found' });

    const context = `Company Balance Sheet Data:\n${JSON.stringify(rows, null, 2)}\n`;

    const wantsChart = /chart|plot|graph/i.test(question);
    const systemPrompt = wantsChart
      ? `You are a financial assistant. If asked to generate a chart, return only JSON in this format:

{
  "type": "bar",
  "labels": ["2021", "2022", "2023"],
  "datasets": [{
    "label": "Revenue",
    "data": [1234, 2345, 3456]
  }]
}

Only return valid JSON, no explanation or formatting.`
      : 'You are a financial analyst assistant. Answer in simple financial language using the data provided.';

    const prompt = `${context}\nUser asked: "${question}"`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const rawAnswer = response.text().trim();


    let answer = rawAnswer;
let responseType = 'text';

    if (wantsChart) {
    const jsonMatch = rawAnswer.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
    if (jsonMatch) {
        answer = jsonMatch[1].trim();
    }

    try {
        JSON.parse(answer); // Validate JSON
        responseType = 'chart';
    } catch (err) {
        console.warn("⚠️ Chart requested but response is not valid JSON.");
    }
    }


    await pool.query(
      `INSERT INTO chat_history (user_id, company_id, question, answer, response_type)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, companyId, question, answer, responseType]
    );

    res.json({ answer, responseType });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Gemini processing failed' });
  }
});

router.get('/history', authenticateToken, async (req, res) => {
  const { role, userId, companyId } = req.user;

  try {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'SELECT * FROM chat_history ORDER BY created_at DESC';
    } else if (role === 'ceo') {
      query = 'SELECT * FROM chat_history WHERE company_id = ? ORDER BY created_at DESC';
      params = [companyId];
    } else {
      query = 'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC';
      params = [userId];
    }

    const [rows] = await pool.query(query, params);
    res.json({ history: rows });
  } catch (err) {
    console.error('History fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;
