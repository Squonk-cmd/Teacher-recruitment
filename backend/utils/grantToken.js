const bkashConfig = require("../bkashConfig.json");
const fetch = require("node-fetch");
const { setGlobalIdToken } = require("./globalData");
const { StatusCodes } = require("http-status-codes");
const { response } = require("./response");
const tokenHeaders = require("./tokenHeaders");
require('dotenv').config();
const { Pool } = require('pg');


// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

const grantToken = async (req, res, next) => {
  try {
    // 1. Check Database for existing token
    const dbResult = await pool.query(
      "SELECT id_token, expires_at FROM bkash_tokens ORDER BY id DESC LIMIT 1"
    );

    const existingToken = dbResult.rows[0];
    const currentTime = new Date();

    // 2. If token exists and is still valid (Current time < Expires at)
    if (existingToken && new Date(existingToken.expires_at) > currentTime) {
      console.log("Using valid token from Database");
      setGlobalIdToken(existingToken.id_token);
      return next();
    }

    // 3. Otherwise, Fetch New Token from bKash
    console.log("Token expired or missing. Fetching new token from bKash...");
    const tokenResponse = await fetch(bkashConfig.grant_token_url, {
      method: "POST",
      headers: tokenHeaders(),
      body: JSON.stringify({
        app_key: bkashConfig.app_key,
        app_secret: bkashConfig.app_secret,
      }),
    });

    const tokenResult = await tokenResponse.json();

    if (!tokenResult?.id_token) {
      throw new Error("Failed to retrieve id_token from bKash");
    }

    // 4. Calculate Expiry (55 minutes from now)
    const expiresAt = new Date(currentTime.getTime() + 55 * 60000);

    // 5. Store in Database (Upsert: Update if ID 1 exists, else Insert)
    await pool.query(
      `INSERT INTO bkash_tokens (id, id_token, expires_at) 
       VALUES (1, $1, $2) 
       ON CONFLICT (id) DO UPDATE 
       SET id_token = EXCLUDED.id_token, expires_at = EXCLUDED.expires_at`,
      [tokenResult.id_token, expiresAt]
    );

    setGlobalIdToken(tokenResult.id_token);
    next();
  } catch (e) {
    console.error("Grant Token Error:", e);
    return response(
      res,
      StatusCodes.UNAUTHORIZED,
      false,
      {},
      "Payment authentication failed"
    );
  }
};

module.exports = grantToken;