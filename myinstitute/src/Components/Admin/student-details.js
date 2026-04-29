import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  FaUserCircle, FaSearch, FaEnvelope, FaPhone, 
  FaCalendarCheck, FaTrashAlt, 
  FaFilePdf, FaFileExcel, FaTimes, FaExternalLinkAlt 
} from "react-icons/fa";
import "./student.css";

const StudentDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null); 
  const [students, setStudents] = useState([]); 

  // --- 1. Database se Students Load Karna ---
  const loadStudents = async () => {
    try {
      // Backend (payment-db.js) se data fetch ho raha hai
      const res = await axios.get("http://localhost:5000/api/admissions");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // --- 2. Database se Delete Karna ---
  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admissions/${id}`);
        loadStudents(); 
      } catch (err) {
        alert("Delete failed! Check if student has payment records.");
      }
    }
  };

  // --- 3. EXCEL EXPORT ---
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_Master_List.xlsx");
  };

  // --- 4. PDF EXPORT ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Directory Report", 14, 20);
    autoTable(doc, {
      head: [["ID", "Name", "Email", "Course", "Phone"]],
      body: students.map(s => [s.id, s.name, s.email, s.course, s.phone]),
      startY: 30,
    });
    doc.save("Students_Report.pdf");
  };

  // --- 5. SEARCH FILTER ---
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(s.id).includes(searchTerm)
  );

  return (
    <div className="sdp-container">
      {/* Search & Export Header */}
      <div className="sdp-header-section">
        <div className="sdp-search-box">
          <FaSearch className="sdp-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sdp-export-group">
           <button onClick={exportToExcel} className="sdp-btn-ex"><FaFileExcel /> Excel</button>
           <button onClick={exportToPDF} className="sdp-btn-pd"><FaFilePdf /> PDF</button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="sdp-card-grid">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div className="sdp-student-card" key={student.id}>
              <div className="sdp-card-top">
                <div className="sdp-profile-img">
                   <FaUserCircle size={45} color="#6366f1" />
                   <span className="sdp-online-indicator"></span>
                </div>
                <span className="sdp-id-badge">ID: {student.id}</span>
              </div>

              <div className="sdp-main-info">
                <h3>{student.name}</h3>
                <span className="sdp-course-tag">{student.course}</span>
              </div>

              <div className="sdp-details-list">
                {/* Database column 'email' fetch ho raha hai */}
                <div className="sdp-item"><FaEnvelope /> {student.email || "N/A"}</div>
                
                {/* Database column 'phone' fetch ho raha hai */}
                <div className="sdp-item"><FaPhone /> {student.phone || "N/A"}</div>
                
                {/* Database column 'date' fetch ho raha hai */}
                <div className="sdp-item">
                  <FaCalendarCheck /> Joined {student.date ? new Date(student.date).toLocaleDateString() : "N/A"}
                </div>
              </div>

              <div className="sdp-progress-bar-container">
                 <div className="sdp-progress-label">
                   <span>Status</span>
                   <span style={{color: '#6366f1'}}>{student.status || "Active"}</span>
                 </div>
                 <div className="sdp-progress-track">
                   <div className="sdp-progress-fill" style={{width: '100%'}}></div>
                 </div>
              </div>

              <div className="sdp-footer-actions">
                <button className="sdp-view-btn" onClick={() => setSelectedStudent(student)}>
                  <FaExternalLinkAlt size={12}/> Profile
                </button>
                <button className="sdp-delete-btn" onClick={() => deleteStudent(student.id)}>
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{textAlign:'center', gridColumn: '1/-1', padding: '20px'}}>No students found in Database.</p>
        )}
      </div>

      {/* Profile Modal */}
      {selectedStudent && (
        <div className="sdp-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="sdp-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sdp-modal-header">
              <h2>Student Profile</h2>
              <button onClick={() => setSelectedStudent(null)}><FaTimes /></button>
            </div>
            <div className="sdp-modal-body">
               <div className="sdp-profile-hero">
                  <FaUserCircle size={80} color="#6366f1" />
                  <h2>{selectedStudent.name}</h2>
                  <p>Student ID: {selectedStudent.id}</p>
               </div>
               <div className="sdp-detail-grid">
                  <div className="sdp-detail-box"><strong>Email:</strong> {selectedStudent.email}</div>
                  <div className="sdp-detail-box"><strong>Phone:</strong> {selectedStudent.phone}</div>
                  <div className="sdp-detail-box"><strong>Course:</strong> {selectedStudent.course}</div>
                  <div className="sdp-detail-box"><strong>Address:</strong> {selectedStudent.address || "N/A"}</div>
                  <div className="sdp-detail-box"><strong>Joined Date:</strong> {selectedStudent.date ? new Date(selectedStudent.date).toLocaleDateString() : "N/A"}</div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;