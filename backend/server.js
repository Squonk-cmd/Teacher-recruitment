const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


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
const upload = multer({ storage });

// Serve static files
app.use(express.static(DIST_PATH));
app.use(express.static(IMG));

app.get("/", async (req, res)=>{
    res.sendFile(path.join(DIST_PATH, "index.html"));
})

app.get("/img/Niyog.jpg", (req, res)=>{
    res.sendFile(path.join(IMG, "Niyog.jpg"));
})

// THE ROUTE
app.post('/api/apply', upload.single('cv'), async (req, res) => {
    try {
        const { name, phone, email, address, nid, lastDegree, subject, applyFor, selectedSubject } = req.body;
        const cvPath = req.file ? req.file.path : null;

        const query = `
            INSERT INTO applicants (name, phone, email, address, nid, last_degree, subject, apply_for, selected_subject, cv_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        
        const values = [name, phone, email, address, nid, lastDegree, subject, applyFor, selectedSubject, cvPath];
        const result = await pool.query(query, values);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));