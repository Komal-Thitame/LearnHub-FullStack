const express = require("express");
const router = express.Router();
const db = require("./dbcon"); // Aapki DB connection file

// 1. Saare notifications laane ke liye (GET)
router.get("/notifications", (req, res) => {
    const sql = "SELECT * FROM notifications ORDER BY id DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).send(err);
        return res.json(data);
    });
});

// 2. Naya notification save karne ke liye (POST)
router.post("/notifications", (req, res) => {
    const { title, desc, type, color } = req.body;
    const sql = "INSERT INTO notifications (`title`, `desc`, `type`, `color`) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, desc, type, color], (err, result) => {
        if (err) return res.status(500).send(err);
        return res.json({ message: "Notification Sent!", id: result.insertId });
    });
});

// 3. Delete karne ke liye
router.delete("/notifications/:id", (req, res) => {
    const sql = "DELETE FROM notifications WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        return res.json({ message: "Deleted Successfully" });
    });
});

module.exports = router;