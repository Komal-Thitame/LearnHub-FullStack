const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "admin-dashbord" 
});

db.connect((err) => {
  if (err) console.log("❌ Database Connection Failed!", err);
  else console.log("✅ MySQL Connected...");
});

// Fetch All Courses
app.get("/get-courses", (req, res) => {
  db.query("SELECT * FROM `view-courses` ORDER BY Id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Add Course
app.post("/add-course", (req, res) => {
  const { title, instructor, price, status, description, duration } = req.body;
  const sql = "INSERT INTO `view-courses` (title, instructor, price, status, description, duration) VALUES (?,?,?,?,?,?)";
  db.query(sql, [title, instructor, price, status, description, duration], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ Id: result.insertId, ...req.body });
  });
});

// Update Course
app.put("/update-course/:id", (req, res) => {
  const { id } = req.params;
  const { title, instructor, price, status, description, duration } = req.body;
  const sql = "UPDATE `view-courses` SET title=?, instructor=?, price=?, status=?, description=?, duration=? WHERE Id=?";
  db.query(sql, [title, instructor, price, status, description, duration, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

// Delete Course - FIXED COLUMN NAME 'Id'
app.delete("/delete-course/:id", (req, res) => {
  const courseId = req.params.id;
  console.log(`📡 Delete request for Id: ${courseId}`);

  const sql = "DELETE FROM `view-courses` WHERE Id = ?";
  db.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course Id not found" });
    }

    console.log("✅ Row deleted successfully.");
    res.status(200).json({ message: "Deleted successfully" });
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));