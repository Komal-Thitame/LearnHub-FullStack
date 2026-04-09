const express = require("express");
const router = express.Router();
const db = require("./dbcon"); // Aapka MySQL connection file

// @route   GET /api/dashboard-stats
// @desc    Dashboard ke top boxes ke liye real-time data
// @route   GET /api/dashboard-stats
router.get("/api/dashboard-stats", (req, res) => {
    // 1. Total Students
    const qStudents = "SELECT COUNT(*) as totalStudents FROM admissions";
    
    // 2. Total Revenue Sum
    const qRevenue = "SELECT IFNULL(SUM(amount), 0) as totalRevenue FROM payments";
    
    // 3. Total Courses
    const qCourses = "SELECT COUNT(*) as totalCourses FROM `view-courses`";

    // 4. Active Instructors (Teachers) - NEW
    const qTeachers = "SELECT COUNT(*) as totalTeachers FROM instructors";

    // 5. Monthly Revenue for Graph - NEW (Last 6 Months)
    const qRevenueGraph = `
        SELECT DATE_FORMAT(payment_date, '%b') as month, SUM(amount) as total 
        FROM payments 
        GROUP BY MONTH(payment_date), month 
        ORDER BY MONTH(payment_date) ASC 
        LIMIT 6`;

    const combinedQuery = `${qStudents}; ${qRevenue}; ${qCourses}; ${qTeachers}; ${qRevenueGraph}`;

    db.query(combinedQuery, (err, results) => {
        if (err) {
            console.error("❌ Dashboard DB Error:", err.message);
            return res.status(500).json({ error: "Database query failed" });
        }

        res.json({
            totalStudents: results[0][0].totalStudents || 0,
            totalRevenue: results[1][0].totalRevenue || 0,
            totalCourses: results[2][0].totalCourses || 0,
            totalTeachers: results[3][0].totalTeachers || 0, // Dynamic value
            revenueGraph: results[4] || [], // Graph data array
            placementRate: 92
        });
    });
});
module.exports = router;