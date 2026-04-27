const express = require("express");
const router = express.Router();
const db = require("./dbcon"); // Apne database connection ka sahi path dein

// ✅ Student Dashboard: Fetch receipts using Email
router.get("/student/email/:email", (req, res) => {
    const studentEmail = req.params.email;

    const sql = `
        SELECT 
            p.payment_id, 
            p.amount, 
            p.payment_date, 
            p.method, 
            a.name AS student_name, 
            a.course AS course_name
        FROM payments p
        JOIN admissions a ON p.student_id = a.id
        WHERE a.email = ?
        ORDER BY p.payment_date DESC
    `;

    db.query(sql, [studentEmail], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(results);
    });
});

module.exports = router;