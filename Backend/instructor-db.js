/*const express = require("express");
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
});*/
const express = require("express");
const router = express.Router();
const db = require("./dbcon"); 
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Folder creation logic
const uploadDir = path.join(__dirname, "uploads/faculty/");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        cb(null, "faculty-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET ALL
router.get("/api/instructors", (req, res) => {
    db.query("SELECT * FROM instructors ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// POST (Add New)
router.post("/api/instructors", upload.single("photo"), (req, res) => {
    const { name, email, subject, tasks, performance, status } = req.body;
    const photo_url = req.file ? `http://localhost:5000/uploads/faculty/${req.file.filename}` : null;

    const sql = "INSERT INTO instructors (name, email, subject, tasks, performance, status, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [name, email, subject, tasks || 0, performance || '80%', status, photo_url];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ error: err.sqlMessage });
        }
        res.json({ success: true });
    });
});

// PUT (Update)
router.put("/api/instructors/:id", upload.single("photo"), (req, res) => {
    const { name, email, subject, tasks, performance, status } = req.body;
    const { id } = req.params;

    let sql = "UPDATE instructors SET name=?, email=?, subject=?, tasks=?, performance=?, status=? WHERE id=?";
    let params = [name, email, subject, tasks || 0, performance || '80%', status, id];

    if (req.file) {
        const photo_url = `http://localhost:5000/uploads/faculty/${req.file.filename}`;
        sql = "UPDATE instructors SET name=?, email=?, subject=?, tasks=?, performance=?, status=?, photo_url=? WHERE id=?";
        params = [name, email, subject, tasks || 0, performance || '80%', status, photo_url, id];
    }

    db.query(sql, params, (err) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).json({ error: err.sqlMessage });
        }
        res.json({ success: true });
    });
});

// DELETE
router.delete("/api/instructors/:id", (req, res) => {
    db.query("DELETE FROM instructors WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

module.exports = router;