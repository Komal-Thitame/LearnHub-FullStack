const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 1. MySQL Connection Setup ---
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // XAMPP default password khali hota hai
    database: "admin-dashbord" // Ensure karein ki ye database aapke phpMyAdmin mein bana ho
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL Database.");
});

// --- 2. Create Table (Optional but recommended) ---
// Ise manually phpMyAdmin mein bhi run kar sakte hain
const createTableQuery = `
CREATE TABLE IF NOT EXISTS instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    tasks INT DEFAULT 0,
    performance VARCHAR(10) DEFAULT '80%',
    status ENUM('Active', 'On Leave') DEFAULT 'Active'
)`;

db.query(createTableQuery, (err) => {
    if (err) console.error("Error creating table:", err);
});

// --- 3. API Routes ---

// GET: Sabhi instructors ki list fetch karne ke liye
app.get("/api/instructors", (req, res) => {
    const sql = "SELECT * FROM instructors ORDER BY id DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// POST: Naya instructor add karne ke liye
app.post("/api/instructors", (req, res) => {
    const { name, email, subject, tasks, performance, status } = req.body;
    const sql = "INSERT INTO instructors (name, email, subject, tasks, performance, status) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [name, email, subject, tasks, performance, status], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Instructor added!", id: result.insertId });
    });
});

// PUT: Instructor details edit karne ke liye
app.put("/api/instructors/:id", (req, res) => {
    const { name, email, subject, tasks, performance, status } = req.body;
    const { id } = req.params;
    const sql = "UPDATE instructors SET name=?, email=?, subject=?, tasks=?, performance=?, status=? WHERE id=?";
    
    db.query(sql, [name, email, subject, tasks, performance, status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Instructor updated successfully!" });
    });
});

// DELETE: Instructor remove karne ke liye
app.delete("/api/instructors/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM instructors WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Instructor deleted!" });
    });
});

// --- 4. Server Listen ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});