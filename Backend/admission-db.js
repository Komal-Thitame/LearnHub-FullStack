const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "admin-dashbord" // Aapki DB spelling yahi hai
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected on Port 5000");
  }
});

// Photo Storage Setup (Multer Memory Storage for Binary BLOB)
const upload = multer({ storage: multer.memoryStorage() });

// --- 1. GET ALL COURSES (Dropdown ke liye) ---
app.get("/get-courses", (req, res) => {
  // Backticks zaroori hain kyunki table name mein hyphen (-) hai
  const sql = "SELECT Id, title FROM `view-courses` ORDER BY title ASC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

// --- 2. GET ALL ADMISSIONS (Table List ke liye) ---
app.get("/api/admissions", (req, res) => {
  const sql = `
    SELECT a.*, c.title AS courseName 
    FROM admissions a 
    LEFT JOIN \`view-courses\` c ON a.course = c.Id 
    ORDER BY a.id DESC`;
    
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    
    // Photo binary ko Base64 mein convert karna taaki frontend par dikhe
    const formattedData = result.map(row => {
      if (row.photo) {
        row.photo = `data:image/jpeg;base64,${row.photo.toString('base64')}`;
      }
      return row;
    });
    res.json(formattedData);
  });
});

// --- 3. ADD NEW ADMISSION (POST) ---
app.post("/api/admission", upload.single("photo"), (req, res) => {
  const { name, course, email, phone, address, status, gender, dob, city } = req.body;
  const photo = req.file ? req.file.buffer : null;
  const date = new Date().toISOString().split('T')[0];

  const sql = "INSERT INTO admissions (name, course, email, phone, address, status, gender, dob, city, date, photo) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
  db.query(sql, [name, course, email, phone, address, status, gender, dob, city, date, photo], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).send(err);
    }
    res.json({ success: true });
  });
});

// --- 4. UPDATE ADMISSION (PUT) ---
app.put("/api/admission/:id", upload.single("photo"), (req, res) => {
  const { name, course, email, phone, address, status, gender, dob, city } = req.body;
  let sql, params;

  if (req.file) {
    sql = "UPDATE admissions SET name=?, course=?, email=?, phone=?, address=?, status=?, gender=?, dob=?, city=?, photo=? WHERE id=?";
    params = [name, course, email, phone, address, status, gender, dob, city, req.file.buffer, req.params.id];
  } else {
    sql = "UPDATE admissions SET name=?, course=?, email=?, phone=?, address=?, status=?, gender=?, dob=?, city=? WHERE id=?";
    params = [name, course, email, phone, address, status, gender, dob, city, req.params.id];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// --- 5. DELETE ADMISSION ---
app.delete("/api/admission/:id", (req, res) => {
  db.query("DELETE FROM admissions WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// Server Listen
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});