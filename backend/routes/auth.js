const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const db = require("../db");
const logger = require("../logger");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    // 1️⃣ Fetch user from database
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    // 2️⃣ Verify password using bcrypt
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3️⃣ Generate a token and store it in the database
    const token = uuid();
    await db.query(
      "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
      [user.id, token]
    );

    // 4️⃣ Log the login event
    logger.info({
      timestamp: new Date().toISOString(),
      userId: user.id,
      action: "LOGIN",
      ip: req.ip,
    });

    // 5️⃣ Return the token to the client
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
