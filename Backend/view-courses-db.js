const express = require("express");
const router = express.Router();
const db = require("./dbcon"); // Aapki database connection file

// 1. GET ALL COURSES (With Instructor Name)
router.get("/get-view-courses", (req, res) => {
  const sql = `
    SELECT vc.*, ins.name AS instructor_name 
    FROM \`view-courses\` vc 
    LEFT JOIN instructors ins ON vc.instructor_id = ins.id`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result); 
  });
});

// 2. GET INSTRUCTORS (Dropdown list ke liye)
router.get("/api/instructors", (req, res) => {
  db.query("SELECT id, name FROM instructors", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 3. ADD NEW COURSE
router.post("/add-course", (req, res) => {
  const { title, instructor_id, price, status, description, duration } = req.body;
  const sql = "INSERT INTO `view-courses` (title, instructor_id, price, status, description, duration) VALUES (?,?,?,?,?,?)";
  db.query(sql, [title, instructor_id, price, status, description, duration], (err, result) => {
    if (err) return res.status(500).json(err);
    res.send("Success");
  });
});

// 4. UPDATE COURSE
router.put("/update-course/:id", (req, res) => {
  const { title, instructor_id, price, status, description, duration } = req.body;
  const sql = "UPDATE `view-courses` SET title=?, instructor_id=?, price=?, status=?, description=?, duration=? WHERE Id=?";
  db.query(sql, [title, instructor_id, price, status, description, duration, req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.send("Updated");
  });
});

module.exports = router;