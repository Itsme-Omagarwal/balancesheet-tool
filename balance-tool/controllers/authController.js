 const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { name, email, password, role, company_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, company_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, company_id]
    );

    res.send("User created");
  } catch (err) {
    res.status(500).send("Signup error: " + err.message);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(404).send("User not found");

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).send("Invalid password");

    const token = jwt.sign({
      userId: user.id,
      role: user.role,
      companyId: user.company_id
    }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    res.status(500).send("Login error: " + err.message);
  }
};

