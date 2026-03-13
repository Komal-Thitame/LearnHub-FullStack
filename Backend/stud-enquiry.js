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
  if (err) console.log("❌ Connection Failed!", err);
  else console.log("✅ MySQL Connected!");
});

// 1. Get Enquiries with Course Titles
app.get("/api/enquiries", (req, res) => {
  // Backticks are essential for 'view-courses' table name
  const sql = `
    SELECT e.*, c.title AS courseName 
    FROM student_enquiries e 
    LEFT JOIN \`view-courses\` c ON e.course = c.Id 
    ORDER BY e.id DESC`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 2. NEW: Fetch Courses for the Dropdown
app.get("/get-courses", (req, res) => {
  const sql = "SELECT Id, title FROM `view-courses` WHERE status = 'Active'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 3. Save New Enquiry
app.post("/api/enquiry", (req, res) => {
  const { name, email, phone, course, message, status } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const sql = "INSERT INTO student_enquiries (name, email, phone, course, message, status, date) VALUES (?,?,?,?,?,?,?)";
  db.query(sql, [name, email, phone, course, message, status || 'Pending', date], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, ...req.body, date });
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));