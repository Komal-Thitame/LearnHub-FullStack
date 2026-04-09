const express = require("express");
const router = express.Router();
const db = require("./dbcon");

// 1. Get Settings
router.get("/api/settings", (req, res) => {
    const sql = "SELECT * FROM admin_settings WHERE id = 1";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("GET Error:", err);
            return res.status(500).json(err);
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "No settings found for ID 1" });
        }
        res.json(result[0]);
    });
});

// 2. Update Settings (With Error Logging)
router.post("/api/settings/update", (req, res) => {
    const { 
        full_name, 
        email, 
        email_notif, 
        dark_mode, 
        two_factor, 
        admin_photo 
    } = req.body;

    // Console log to check if data is reaching backend
    console.log("Updating settings for:", full_name);

    const sql = `
        UPDATE admin_settings 
        SET 
            full_name = ?, 
            email = ?, 
            email_notif = ?, 
            dark_mode = ?, 
            two_factor = ?, 
            admin_photo = ? 
        WHERE id = 1
    `;
    
    const params = [
        full_name, 
        email, 
        email_notif ? 1 : 0, 
        dark_mode ? 1 : 0, 
        two_factor ? 1 : 0, 
        admin_photo
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            // Check your VS Code terminal for this message!
            console.error("!!! SQL UPDATE ERROR !!!:", err.message);
            return res.status(500).json({ error: "Database update failed", details: err.message });
        }
        
        if (result.affectedRows === 0) {
            console.warn("Update failed: No record found with ID 1");
            return res.status(404).json({ success: false, message: "Admin record not found in DB" });
        }

        console.log("✅ Settings updated successfully in DB");
        res.json({ success: true, message: "Settings and Photo updated successfully" });
    });
});

module.exports = router;