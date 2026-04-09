const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("./dbcon"); // Aapka database connection file

// --- File Upload Setup (Multer) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, 'course-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 1. Fetch All Courses (Admin View)
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

// 2. Add New Course
router.post("/add-course", upload.single('courseImage'), (req, res) => {
    const { title, instructor_id, price, status, description, duration, content } = req.body;
    const imageUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const sql = "INSERT INTO `view-courses` (title, instructor_id, price, status, description, duration, image_url, content) VALUES (?,?,?,?,?,?,?,?)";
    db.query(sql, [title, instructor_id, price, status, description, duration, imageUrl, content], (err, result) => {
        if (err) return res.status(500).json(err);
        res.send("Success");
    });
});

// 3. Update Existing Course
router.put("/update-course/:id", upload.single('courseImage'), (req, res) => {
    const { title, instructor_id, price, status, description, duration, content } = req.body;
    let sql = "";
    let params = [];

    if (req.file) {
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        sql = "UPDATE `view-courses` SET title=?, instructor_id=?, price=?, status=?, description=?, duration=?, image_url=?, content=? WHERE Id=?";
        params = [title, instructor_id, price, status, description, duration, imageUrl, content, req.params.id];
    } else {
        sql = "UPDATE `view-courses` SET title=?, instructor_id=?, price=?, status=?, description=?, duration=?, content=? WHERE Id=?";
        params = [title, instructor_id, price, status, description, duration, content, req.params.id];
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        res.send("Updated");
    });
});

// 4. GET Enrolled Courses with Syllabus (JOIN is CRITICAL here)
router.get("/api/enrolled-courses", (req, res) => {
    const email = req.query.email;
    // JOIN is used to pull 'content' from the 'view-courses' table based on course_id
    const sql = `
        SELECT ec.id, vc.title AS course_name, ins.name AS instructor, ec.status, vc.content 
        FROM enrolled_courses ec
        JOIN \`view-courses\` vc ON ec.course_id = vc.id
        LEFT JOIN instructors ins ON vc.instructor_id = ins.id
        WHERE ec.email = ?`;

    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

module.exports = router;