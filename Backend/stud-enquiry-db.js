/*const express = require("express");
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

app.listen(5000, () => console.log("🚀 Server running on port 5000"));*/
const express = require("express");
const router = express.Router();
const db = require("./dbcon"); // Ensure file name matches exactly

// 1. GET ALL ENQUIRIES (With Course Names)
router.get("/api/enquiries", (req, res) => {
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

// 2. FETCH COURSES (For Dropdown)
router.get("/get-courses", (req, res) => {
    const sql = "SELECT Id, title FROM `view-courses` WHERE status = 'Active'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 3. SAVE NEW ENQUIRY (POST)
router.post("/api/enquiry", (req, res) => {
    const { name, email, phone, course, message, status } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const sql = "INSERT INTO student_enquiries (name, email, phone, course, message, status, date) VALUES (?,?,?,?,?,?,?)";
    
    db.query(sql, [name, email, phone, course, message, status || 'Pending', date], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, id: result.insertId });
    });
});

// 4. UPDATE ENQUIRY / EDIT (PUT)
router.put("/api/enquiry/:id", (req, res) => {
    const { name, email, phone, course, message, status } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE student_enquiries 
        SET name=?, email=?, phone=?, course=?, message=?, status=? 
        WHERE id=?`;
        
    db.query(sql, [name, email, phone, course, message, status, id], (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json(err);
        }
        res.json({ success: true, message: "Enquiry updated successfully" });
    });
});

// 5. DELETE ENQUIRY (DELETE)
router.delete("/api/enquiry/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM student_enquiries WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json(err);
        }
        res.json({ success: true, message: "Enquiry deleted successfully" });
    });
});

// 6. CONVERT ENQUIRY TO ADMISSION (New Feature)
router.post("/api/enquiry/convert/:id", (req, res) => {
    const enquiryId = req.params.id;

    // Step 1: Enquiry ka data uthao
    const getSql = "SELECT * FROM student_enquiries WHERE id = ?";
    db.query(getSql, [enquiryId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: "Enquiry not found" });

        const data = results[0];
        const date = new Date().toISOString().split('T')[0];

        // Step 2: Admissions table mein insert karo
        // Note: Yahan aapne admission table ke columns check kar lena (name, email, phone, course, date)
        const insertSql = "INSERT INTO admissions (name, email, phone, course, date, status) VALUES (?,?,?,?,?,'Active')";
        db.query(insertSql, [data.name, data.email, data.phone, data.course, date], (err, result) => {
            if (err) return res.status(500).json({ message: "Insert into admission failed", error: err });

            // Step 3: Enquiry status ko 'Converted' kar do
            const updateSql = "UPDATE student_enquiries SET status = 'Converted' WHERE id = ?";
            db.query(updateSql, [enquiryId], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ success: true, message: "Successfully converted to Admission!" });
            });
        });
    });
});
// 7. PATCH Status Only (Required for toggleStatus in Frontend)
router.patch("/api/enquiry/status/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const sql = "UPDATE student_enquiries SET status = ? WHERE id = ?";
    
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Status Update Error:", err);
            return res.status(500).json(err);
        }
        res.json({ success: true, message: "Status updated successfully" });
    });
});

module.exports = router;