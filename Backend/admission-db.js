const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("./dbcon"); // Database connection

const upload = multer({ storage: multer.memoryStorage() });

// Helper Function
const formatDateSafe = (dateVal) => {
  if (!dateVal || isNaN(new Date(dateVal).getTime())) return null;
  return new Date(dateVal).toISOString().split('T')[0];
};

// Isse copy karein aur apne purane /get-courses ki jagah paste karein
router.get("/get-courses", (req, res) => {
  // Humne yahan 'price' aur 'status' ko bhi SELECT query mein add kar diya hai
  const sql = "SELECT Id, title, price, status FROM `view-courses` ORDER BY title ASC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result); // Ab result mein price bhi jayega
  });
});

// 2. Get All Admissions (Admin Dashboard Fetching here)
router.get("/api/admissions", (req, res) => {
  const sql = "SELECT a.*, c.title AS courseName FROM admissions a LEFT JOIN `view-courses` c ON a.course = c.Id ORDER BY a.id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const formattedData = result.map(row => {
      if (row.photo) {
        row.photo = `data:image/jpeg;base64,${row.photo.toString('base64')}`;
      }
      row.dob = formatDateSafe(row.dob);
      row.date = formatDateSafe(row.date);
      return row;
    });
    res.json(formattedData);
  });
});

// 3. Register New Student (POST) - Ye Student Form aur Admin Form dono ke liye hai
router.post("/api/admission", upload.single("photo"), (req, res) => {
  // Frontend se 'course' ya 'courseId' jo bhi aaye, hum handle kar rahe hain
  const { name, course, courseId, email, phone, address, status, gender, dob, city } = req.body;
  
  const finalCourse = courseId || course; // Dono cases handle ho gaye
  const photo = req.file ? req.file.buffer : null;
  const date = new Date().toISOString().split('T')[0]; 

  const sqlAdmission = "INSERT INTO admissions (name, course, email, phone, address, status, gender, dob, city, date, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const params = [name, finalCourse, email, phone, address, status || 'Pending', gender, dob, city, date, photo];

  db.query(sqlAdmission, params, (err, result) => {
    if (err) {
        console.error("Insert Error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }

    // Admin ke liye notification
    const sqlNotif = "INSERT INTO notifications (`title`, `desc`, `type`, `color`) VALUES (?, ?, ?, ?)";
    const notifValues = ["New Enrollment", `${name} has applied for admission`, "enroll", "#4318FF"];

    db.query(sqlNotif, notifValues, () => {
      res.json({ success: true, message: "Registered Successfully", id: result.insertId });
    });
  });
});

// 4. Update Full Student Data
router.put("/api/admission/:id", upload.single("photo"), (req, res) => {
  const { name, course, email, phone, address, status, gender, dob, city } = req.body;
  const id = req.params.id;
  
  let sql, params;
  if (req.file) {
    sql = "UPDATE admissions SET name=?, course=?, email=?, phone=?, address=?, status=?, gender=?, dob=?, city=?, photo=? WHERE id=?";
    params = [name, course, email, phone, address, status, gender, dob, city, req.file.buffer, id];
  } else {
    sql = "UPDATE admissions SET name=?, course=?, email=?, phone=?, address=?, status=?, gender=?, dob=?, city=? WHERE id=?";
    params = [name, course, email, phone, address, status, gender, dob, city, id];
  }

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
});

// 5. UPDATE STATUS & SYNC (Yahan 'course_id' add kiya gaya hai)
router.put("/api/admission/status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query("UPDATE admissions SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const sqlGetDetails = `
      SELECT a.name, a.email, vc.Id AS course_id, vc.title AS course_name, ins.name AS instructor_name
      FROM admissions a 
      LEFT JOIN \`view-courses\` vc ON a.course = vc.Id 
      LEFT JOIN instructors ins ON vc.instructor_id = ins.id
      WHERE a.id = ?`;
    
    db.query(sqlGetDetails, [id], (errDet, results) => {
      if (errDet || results.length === 0) return res.json({ success: true });

      const student = results[0];
      const instructorName = student.instructor_name || "To be assigned";

      if (status === "Active") {
        // 'course_id' column ko database mein zaroor add karein pehle
        const sqlEnroll = `
          INSERT INTO enrollments (student_email, course_name, course_id, instructor, status) 
          VALUES (?, ?, ?, ?, 'Active') 
          ON DUPLICATE KEY UPDATE status='Active', instructor=?, course_id=?`;
        
        db.query(sqlEnroll, [student.email, student.course_name, student.course_id, instructorName, instructorName, student.course_id]);
      } else {
        db.query("UPDATE enrollments SET status = ? WHERE student_email = ?", [status, student.email]);
      }

      res.json({ success: true, message: `Status synced with course_id` });
    });
  });
});
// 6. Delete Student & Sync with Enrollments
router.delete("/api/admission/:id", (req, res) => {
  const id = req.params.id;

  db.query("SELECT email FROM admissions WHERE id = ?", [id], (err, results) => {
    if (err || results.length === 0) return res.status(500).json({ error: "Student not found" });

    const studentEmail = results[0].email;

    db.query("DELETE FROM enrollments WHERE student_email = ?", [studentEmail], (errEn) => {
      if (errEn) console.error("Enrollment delete error:", errEn);

      db.query("DELETE FROM admissions WHERE id = ?", [id], (errAd) => {
        if (errAd) return res.status(500).json({ error: errAd.message });
        res.json({ success: true, message: "Deleted from all tables" });
      });
    });
  });
});

// 7. GET ENROLLED COURSES WITH SYLLABUS (Most Important for Download)
router.get("/api/enrolled-courses", (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // JOIN is used to pull 'content' directly from 'view-courses'
    const sql = `
        SELECT 
            e.id, 
            e.course_name, 
            e.instructor, 
            e.status, 
            vc.content 
        FROM enrollments e
        JOIN \`view-courses\` vc ON e.course_name = vc.title
        WHERE e.student_email = ? AND e.status = 'Active'`;

    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results); 
    });
});



// 8. Get Single Student Profile by Email (CORRECTED)
router.get("/api/student-profile", (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // 'goal' hata diya gaya hai taaki query crash na ho
    const sql = "SELECT id, name, email, phone, city FROM admissions WHERE email = ?";
    
    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (result.length > 0) {
            res.json(result[0]); 
        } else {
            res.status(404).json({ message: "Profile not found" });
        }
    });
});

// 9. Update Profile (CORRECTED)
// 9. Update Profile (DETAILS + PHOTO TOGETHER)
// 'upload.single("photo")' add kiya gaya hai taaki image handle ho sake
router.put("/api/update-profile", upload.single("photo"), (req, res) => {
    const { name, phone, city, email } = req.body;
    const photo = req.file ? req.file.buffer : null;

    let sql, params;

    if (photo) {
        // Agar photo upload ki gayi hai
        sql = "UPDATE admissions SET name=?, phone=?, city=?, photo=? WHERE email=?";
        params = [name, phone, city, photo, email];
    } else {
        // Agar sirf text details update karni hain
        sql = "UPDATE admissions SET name=?, phone=?, city=? WHERE email=?";
        params = [name, phone, city, email];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully" });
    });
});
// Is route ko backend file mein add karein
// Is route ko use karein, ye Personal Details aur Summary dono ke liye best hai
router.get("/api/get-admission-status", (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    // SELECT * isliye taaki saara data mil jaye
    const sql = "SELECT * FROM admissions WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
            let studentData = result[0];
            
            // Photo handling
            if (studentData.photo) {
                studentData.photo = `data:image/jpeg;base64,${studentData.photo.toString('base64')}`;
            }

            // Date formatting
            studentData.dob = formatDateSafe(studentData.dob);
            studentData.date = formatDateSafe(studentData.date);

            // IMPORTANT: Direct studentData bhejein bina extra 'data' object ke
            // Taaki frontend mein profile.name direct chal jaye
            res.json({ 
                success: true, 
                ...studentData  // Ye saare fields (name, email, etc.) ko bahar nikaal dega
            });
        } else {
            res.status(404).json({ success: false, message: "No application found" });
        }
    });
});

// Isse student ke profile photo update karne ke liye use karein
router.put("/api/update-student-photo", upload.single("photo"), (req, res) => {
    const email = req.body.email;
    const photo = req.file ? req.file.buffer : null;

    if (!photo) return res.status(400).json({ success: false, message: "No photo uploaded" });

    const sql = "UPDATE admissions SET photo = ? WHERE email = ?";
    db.query(sql, [photo, email], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Photo updated successfully!" });
    });
});
module.exports = router;