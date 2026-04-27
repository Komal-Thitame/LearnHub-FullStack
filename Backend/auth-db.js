const express = require("express");
const router = express.Router();
const db = require("./dbcon");

// 1. REGISTER API (Students)
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

// 2. UNIFIED LOGIN API (Admin & Student)
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const adminSql = "SELECT * FROM admins WHERE email = ? AND password = ?";
    db.query(adminSql, [email, password], (err, adminData) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });

        if (adminData.length > 0) {
            return res.json({ 
                success: true, 
                role: 'admin', 
                user: { name: adminData[0].full_name, email: adminData[0].email } 
            });
        } else {
            const studentSql = "SELECT * FROM students WHERE email = ? AND password = ?";
            db.query(studentSql, [email, password], (err, studentData) => {
                if (err) return res.status(500).json({ success: false, message: "Database Error" });

                if (studentData.length > 0) {
                    return res.json({ 
                        success: true, 
                        role: 'student', 
                        user: { name: studentData[0].full_name, email: studentData[0].email } 
                    });
                } else {
                    return res.json({ success: false, message: "Invalid email or password" });
                }
            });
        }
    });
});

// 3. GET ADMIN PROFILE (Header & Settings ke liye)
router.get("/admin-profile/:email", (req, res) => {
    const email = req.params.email;
    // FETCH ALL COLUMNS INCLUDING two_factor
    const sql = "SELECT full_name, email, password, admin_photo, email_notif, dark_mode, two_factor FROM admins WHERE email = ?";
    
    db.query(sql, [email], (err, data) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (data.length > 0) {
            res.json(data[0]);
        } else {
            res.status(404).json({ success: false, message: "Admin not found" });
        }
    });
});

// 4. UPDATE ADMIN PROFILE (Final Fixed Version)
router.post("/admin-update", (req, res) => {
    const { full_name, email, password, admin_photo, email_notif, dark_mode, two_factor } = req.body;
    
    // SQL Query with ALL 6 columns + WHERE clause
    const sql = `
        UPDATE admins 
        SET full_name = ?, 
            password = ?, 
            admin_photo = ?, 
            email_notif = ?, 
            dark_mode = ?,
            two_factor = ?
        WHERE email = ?
    `;
    
    // Values order must match the '?' in the SQL string above
    const values = [
        full_name, 
        password, 
        admin_photo || null, 
        email_notif ? 1 : 0, 
        dark_mode ? 1 : 0, 
        two_factor ? 1 : 0, 
        email
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Update Error Detail:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Database Update Failed", 
                error: err.code 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "No admin found with this email" });
        }

        res.json({ success: true, message: "Profile updated successfully!" });
    });
});

// Settings Update Route
router.post("/api/auth/admin-update", (req, res) => {
    const { full_name, email, password, admin_photo, email_notif, dark_mode, two_factor } = req.body;

    const sql = `
        UPDATE admins 
        SET full_name = ?, 
            password = ?, 
            admin_photo = ?, 
            email_notif = ?, 
            dark_mode = ?, 
            two_factor = ? 
        WHERE email = ?`;

    db.query(sql, [full_name, password, admin_photo, email_notif, dark_mode, two_factor, email], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ success: false, message: "Database update failed" });
        }
        res.json({ success: true, message: "Profile updated successfully!" });
    });
});
module.exports = router;