const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const bkashPaymentRoute = require("./routes/bkashPayment.routes");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/bkash", bkashPaymentRoute);


// Path to Vite build output
const DIST_PATH = path.join(__dirname, "../dist");
const IMG = path.join(__dirname, "../img");

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Configure Multer for File Saving
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// 1. Update Multer to accept multiple specific fields
const upload = multer({ storage }).fields([
    { name: 'cv', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(DIST_PATH));
app.use(express.static(IMG));

app.get("/", async (req, res)=>{
    res.sendFile(path.join(DIST_PATH, "index.html"));
})

app.get("/img/Niyog.jpg", (req, res)=>{
    res.sendFile(path.join(IMG, "Niyog.jpg"));
})

app.get("/img/Admit_Card.jpg", (req, res)=>{
    res.sendFile(path.join(IMG, "Admit_Card.jpg"));
})

// THE ROUTE
// 2. Updated THE ROUTE
app.post('/api/apply', upload, async (req, res) => {
    try {
        const { name, phone, email, address, nid, lastDegree, subject, applyFor, selectedSubject } = req.body;

        // Access files via req.files[fieldName]
        // Note: We use .filename if you followed the previous advice for static serving, 
        // or .path if you prefer the relative system path.
        const cvPath = req.files['cv'] ? req.files['cv'][0].filename : null;
        const photoPath = req.files['photo'] ? req.files['photo'][0].filename : null;

        const query = `
            INSERT INTO applicants (
                name, phone, email, address, nid, last_degree, 
                subject, apply_for, selected_subject, cv_url, photo_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`;
        
        const values = [
            name, phone, email, address, nid, lastDegree, 
            subject, applyFor, selectedSubject, cvPath, photoPath
        ];

        const result = await pool.query(query, values);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Database error during registration" });
    }
});


// Get all applicants for Admin
app.get('/api/applicants', async (req, res) => {
  try {
    // We fetch everything. PostgreSQL returns an object with a 'rows' property.
    const result = await pool.query('SELECT * FROM applicants ORDER BY id DESC');
    res.json(result.rows); // <--- Make sure you are sending result.rows, not just result
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update payment status only
app.patch('/api/applicants/:id/status', async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    try {
        await pool.query('UPDATE applicants SET payment_status = $1 WHERE id = $2', [paymentStatus, id]);
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update full applicant data
app.put('/api/applicants/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, applyFor, selectedSubject, lastDegree } = req.body;
    try {
        await pool.query(
            `UPDATE applicants 
             SET name=$1, phone=$2, email=$3, apply_for=$4, selected_subject=$5, last_degree=$6 
             WHERE id=$7`,
            [name, phone, email, applyFor, selectedSubject, lastDegree, id]
        );
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.get('/api/bkash/refund-check', async (req, res) => {
  try {
    const dbResult = await pool.query(
      "SELECT id_token, expires_at FROM bkash_tokens ORDER BY id DESC LIMIT 1"
    );

    if (dbResult.rows.length === 0) {
      return res.status(404).json({ 
        status: "fail", 
        message: "No token found in database." 
      });
    }

    const tokenData = dbResult.rows[0];
    const currentTime = new Date();
    const expiryTime = new Date(tokenData.expires_at);
    
    // Calculate remaining time in minutes
    const remainingMinutes = Math.round((expiryTime - currentTime) / 60000);

    res.json({
      status: "success",
      token: tokenData.id_token,
      expires_at: tokenData.expires_at,
      is_valid: expiryTime > currentTime,
      minutes_remaining: remainingMinutes > 0 ? remainingMinutes : 0
    });
  } catch (error) {
    console.error("Token Check Error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));