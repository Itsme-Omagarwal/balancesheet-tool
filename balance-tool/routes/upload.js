const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../db');
const path = require('path');

const router = express.Router();

// Multer setup to store uploaded files in /uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post('/upload-pdf', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = path.join(__dirname, '..', req.file.path);

  exec(`python parse_pdf.py "${filePath}"`, async (err, stdout, stderr) => {
    if (err) {
      console.error('Python error:', stderr);
      return res.status(500).json({ error: 'PDF processing failed' });
    }

    try {
      const data = JSON.parse(stdout);

      await pool.query(
        `INSERT INTO balance_sheets (company_id, year, revenue, profit, assets, liabilities, growth)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.company_id,
          data.year,
          data.revenue,
          data.profit,
          data.assets,
          data.liabilities,
          data.growth,
        ]
      );

      res.json({ message: 'PDF parsed and data inserted', data });
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      res.status(500).json({ error: 'Invalid response from Python script' });
    }
  });
});

module.exports = router;
