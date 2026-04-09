const express = require("express");
const router = express.Router();
const db = require("./dbcon"); // Aapka existing connection use karega

// 1. REGISTER API (Sign Up ke liye)
router.post("/register", (req, res) => {
    const { fullName, email, password, phone } = req.body;
    const sql = "INSERT INTO students (full_name, email, password, phone) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [fullName, email, password, phone], (err, result) => {
        if (err) {
            console.error("Signup Error:", err);
            return res.json({ success: false, message: "Email already exists!" });
        }
        return res.json({ success: true });
    });
});

// 2. STUDENT LOGIN API
router.post("/student-login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, data) => {
        if (err) return res.status(500).json({ success: false });
        if (data.length > 0) {
            // Student mil gaya
            return res.json({ 
                success: true, 
                user: { name: data[0].full_name, email: data[0].email } 
            });
        } else {
            return res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

module.exports = router;