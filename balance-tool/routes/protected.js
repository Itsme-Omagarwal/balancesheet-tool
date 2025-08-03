const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    message: 'Protected route success!',
    user: req.user
  });
});

module.exports = router;
