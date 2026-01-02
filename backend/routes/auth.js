const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const db = require("../db");
const logger = require("../logger");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (!rows.length) return res.status(401).end();

  const user = rows[0];

  // password check skipped for simplicity
  const token = uuid();

  await db.query(
    "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
    [user.id, token]
  );

  logger.info({
    timestamp: new Date().toISOString(),
    userId: user.id,
    action: "LOGIN",
    ip: req.ip
  });

  res.json({ token });
});

module.exports = router;
