const express = require("express");
const router = express.Router();
const db = require("./dbcon"); 

// 1. GET: Saare payments fetch karna
// 1. GET: Payments with Filtering (Frontend ke filters ke liye)
router.get("/api/payments", (req, res) => {
    const { filter } = req.query;
    let dateCondition = "";

    // Date filtering logic based on filter param
    if (filter === "weekly") {
        dateCondition = "AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else if (filter === "monthly") {
        dateCondition = "AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    const sql = `
        SELECT p.*, a.name AS student_name, c.title AS course_name, c.price AS course_price
        FROM payments p 
        JOIN admissions a ON p.student_id = a.id 
        JOIN \`view-courses\` c ON a.course = c.Id
        WHERE 1=1 ${dateCondition}
        ORDER BY p.payment_date DESC
    `;
    
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// 2. GET: Admissions list (Dropdown ke liye)
router.get("/api/admissions", (req, res) => {
    const sql = "SELECT id, name, course FROM admissions";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 3. POST: Naya payment add karna (With Auto-Notification)
router.post("/api/payments", (req, res) => {
    const { student_id, amount, method, status } = req.body;
    const payment_id = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().split('T')[0];

    const sql = "INSERT INTO payments (payment_id, student_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [payment_id, student_id, amount, method, status, date], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // --- STEP: Student ka naam fetch karo notification ke liye ---
        db.query("SELECT name FROM admissions WHERE id = ?", [student_id], (errName, studentResult) => {
            const studentName = studentResult.length > 0 ? studentResult[0].name : "Unknown Student";

            // --- STEP: Notification table mein entry dalo ---
            const sqlNotif = "INSERT INTO notifications (`title`, `desc`, `type`, `color`) VALUES (?, ?, ?, ?)";
            const notifValues = [
                "Payment Received", 
                `A payment of ₹${amount} was received from ${studentName}.`, 
                "payment", 
                "#05CD99" // Green Color
            ];

            db.query(sqlNotif, notifValues, (errNotif) => {
                if (errNotif) console.error("Payment Notification Error:", errNotif);
                
                // Final Response
                res.json({ success: true, message: "Payment added & Notification sent", id: payment_id });
            });
        });
    });
});

// 4. DELETE: Payment delete karna
router.delete("/api/payments/:id", (req, res) => {
    const sql = "DELETE FROM payments WHERE payment_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Deleted successfully" });
    });
});

// 5. UPDATE: Payment update karna
router.put("/api/payments/:id", (req, res) => {
    const { status, amount, method } = req.body;
    const sql = "UPDATE payments SET status = ?, amount = ?, method = ? WHERE payment_id = ?";
    db.query(sql, [status, amount, method, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Updated successfully" });
    });
});

// Pending Payments Fetch Karne ke liye
router.get("/api/payments/pending-summary", (req, res) => {
    const sql = `
        SELECT 
            a.name AS student_name, 
            c.title AS course_name, 
            c.price AS total_fee,
            IFNULL(SUM(p.amount), 0) AS paid_amount,
            (c.price - IFNULL(SUM(p.amount), 0)) AS pending_amount
        FROM admissions a
        JOIN \`view-courses\` c ON a.course = c.Id
        LEFT JOIN payments p ON a.id = p.student_id
        GROUP BY a.id
        HAVING pending_amount > 0
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

module.exports = router;