const express = require("express");
const router = express.Router();
const db = require("./dbcon");

// 1. DASHBOARD ANALYTICS ROUTE
router.get("/api/analytics-data", (req, res) => {
  const sql = `
    -- Stats for Top Boxes
    SELECT 
      (SELECT COUNT(*) FROM admissions) as totalEnrolments,
      (SELECT IFNULL(SUM(amount), 0) FROM payments) as totalRevenue;

    -- Revenue Growth Chart
    SELECT DATE_FORMAT(payment_date, '%b') as name, SUM(amount) as revenue 
    FROM payments 
    GROUP BY DATE_FORMAT(payment_date, '%b'), MONTH(payment_date) 
    ORDER BY MONTH(payment_date) ASC;

    -- Course Distribution Pie Chart
    SELECT c.title as name, COUNT(a.id) as value 
    FROM admissions a 
    JOIN \`view-courses\` c ON a.course = c.Id 
    GROUP BY c.title;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      stats: results[0][0] || { totalEnrolments: 0, totalRevenue: 0 },
      performanceData: results[1] || [],
      courseShare: results[2] || []
    });
  });
});

// 2. EARNINGS & TRANSACTIONS ROUTE
router.get("/api/earnings-data", (req, res) => {
  const sql = `
    -- Current Wallet Balance
    SELECT IFNULL(SUM(amount), 0) as currentRevenue FROM payments;

    -- Recent Transactions (Detailed Join)
    SELECT 
      a.name as user, 
      c.title as course, 
      p.amount as price, 
      DATE_FORMAT(p.payment_date, '%d %b, %h:%i %p') as time 
    FROM payments p
    JOIN admissions a ON p.student_id = a.id
    JOIN \`view-courses\` c ON a.course = c.Id
    ORDER BY p.payment_date DESC
    LIMIT 6;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      totalRevenue: results[0][0].currentRevenue || 0,
      recentTransactions: results[1] || []
    });
  });
});

// --- SETTINGS ROUTES ---

// 1. Settings Get karne ke liye (Page load hote hi data dikhane ke liye)
router.get("/api/settings", (req, res) => {
  const sql = "SELECT * FROM admin_settings WHERE id = 1";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0] || {});
  });
});

// 2. Settings Update karne ke liye (Save button ke liye)
router.post("/api/settings-update", (req, res) => {
  const { name, email, email_notif, dark_mode } = req.body;
  const sql = "UPDATE admin_settings SET name = ?, email = ?, email_notif = ?, dark_mode = ? WHERE id = 1";
  
  db.query(sql, [name, email, email_notif, dark_mode], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Update failed" });
    }
    res.json({ message: "Settings updated successfully!" });
  });
});
module.exports = router;

