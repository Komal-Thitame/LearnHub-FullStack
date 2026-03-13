const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", 
    database: "admin-dashbord" // Aapka DB Name
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL Database");

    // 2. Relationship Table Create logic
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS payments (
            payment_id VARCHAR(20) PRIMARY KEY,
            student_id INT,
            amount DECIMAL(10, 2) NOT NULL,
            method ENUM('UPI', 'Card', 'Cash') DEFAULT 'UPI',
            status ENUM('Paid', 'Pending') DEFAULT 'Paid',
            payment_date DATE,
            FOREIGN KEY (student_id) REFERENCES admissions(id) ON DELETE CASCADE
        )
    `;
    db.query(createTableQuery, (err) => {
        if (err) console.log("Table creation error:", err);
    });
});

// --- API ROUTES ---

// 3. GET: Saare payments fetch karna (Student Name ke saath)
app.get("/api/payments", (req, res) => {
    const sql = `
        SELECT p.*, a.name AS student_name 
        FROM payments p 
        JOIN admissions a ON p.student_id = a.id 
        ORDER BY p.payment_date DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// 4. GET: Admissions table se students fetch karna (Dropdown FIX)
app.get("/api/admissions", (req, res) => {
    const sql = "SELECT id, name, course FROM admissions";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Fetch Admissions Error:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// 5. POST: Naya payment record karna
app.post("/api/payments", (req, res) => {
    const { student_id, amount, method, status } = req.body;
    const payment_id = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().split('T')[0];

    const sql = "INSERT INTO payments (payment_id, student_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [payment_id, student_id, amount, method, status, date], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Payment added successfully", id: payment_id });
    });
});

// 6. DELETE: Payment record delete karna
app.delete("/api/payments/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM payments WHERE payment_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Payment deleted successfully" });
    });
});

// 7. UPDATE: Payment status update karna
app.put("/api/payments/:id", (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const sql = "UPDATE payments SET status = ? WHERE payment_id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Status updated" });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});