// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware for role-checking (used if needed)
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).send("Forbidden");
    }
    next();
  };
}

// Middleware for checking token and decoding it
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });

    req.user = user; // Contains id, role, company_id
    next();
  });
};

// Optional middleware variant (you can remove if not needed)
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("No token provided");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).send("Invalid token");
  }
}

module.exports = {
  authenticateToken,
  authMiddleware,
  requireRole
};