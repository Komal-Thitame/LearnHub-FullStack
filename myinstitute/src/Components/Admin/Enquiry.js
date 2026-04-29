import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable"; 
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, FaPhoneAlt, FaCheckCircle, FaTrashAlt, 
  FaPlus, FaEnvelope, FaCalendarAlt, FaTimes, 
  FaFilePdf, FaFileExcel, FaWhatsapp, FaCommentDots, FaEdit,
  FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import "./student.css";

const StudentEnquiry = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  const [dbCourses, setDbCourses] = useState([]); 
  const [enquiries, setEnquiries] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", course: "", message: "", status: "Pending" });

  // 1. Fetch Enquiries and Courses from Backend
  const fetchEnquiries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/enquiries");
      setEnquiries(res.data);
      const courseRes = await axios.get("http://localhost:5000/get-courses"); 
      setDbCourses(courseRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // 2. PDF Download Logic
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Student Enquiry Report", 14, 15);
    autoTable(doc, {
      head: [["ID", "Name", "Phone", "Course", "Date", "Status"]],
      body: enquiries.map(e => [e.id, e.name, e.phone, e.courseName || e.course, e.date, e.status]),
      startY: 20,
    });
    doc.save("Enquiry_Report.pdf");
  };

  // 3. Excel Export Logic
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(enquiries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, "Student_Enquiries.xlsx");
  };

  // 4. Save or Update Enquiry
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/enquiry/${editId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/enquiry", formData);
      }
      fetchEnquiries();
      closeModal();
    } catch (err) {
      alert("Database Error");
    }
  };

  const handleEdit = (enq) => {
    setEditId(enq.id);
    setFormData({ ...enq });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ name: "", email: "", phone: "", course: "", message: "", status: "Pending" });
  };

  // 5. Delete Enquiry
  const deleteEnquiry = async (id) => {
    if(window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        await axios.delete(`http://localhost:5000/api/enquiry/${id}`);
        fetchEnquiries();
      } catch (err) {
        alert("Error deleting record");
      }
    }
  };

  // 6. TOGGLE STATUS & CONVERT (FIXED NAVIGATION)
  const toggleStatus = async (id, currentStatus, enq) => {
    if (currentStatus === "Pending") {
      const confirm = window.confirm(`Convert ${enq.name} to Admission?`);
      if (confirm) {
        try {
          // 1. Update status in Database via PATCH
          await axios.patch(`http://localhost:5000/api/enquiry/status/${id}`, { status: "Converted" });
          
          // 2. Navigate to admission page and pass student data as state
          navigate("/admin/students/admission", { state: { convertedStudent: enq } });
          
        } catch (err) {
          console.error("Update Error:", err);
          alert("Error updating status");
        }
      }
    } else {
        // Toggle back to Pending if needed
        try {
            await axios.patch(`http://localhost:5000/api/enquiry/status/${id}`, { status: "Pending" });
            fetchEnquiries();
        } catch (err) {
            alert("Error updating status");
        }
    }
  };

  // 7. WhatsApp Logic
  const sendWhatsApp = (phone, name) => {
    const msg = `Hello ${name}, thank you for your enquiry!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // 8. Search & Pagination Logic
  const filteredData = enquiries.filter(enq => 
    (enq.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (enq.courseName || enq.course || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const currentRecords = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="seq-container">
      {/* HEADER SECTION */}
      <div className="seq-header">
        <div className="seq-search-bar">
          <FaSearch className="seq-search-icon" />
          <input 
            type="text" 
            placeholder="Search student or course..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="seq-header-actions">
          <button className="seq-btn-excel" onClick={exportToExcel}><FaFileExcel /> Excel</button>
          <button className="seq-btn-pdf" onClick={downloadPDF}><FaFilePdf /> PDF</button>
          <button className="seq-btn-add" onClick={() => setShowModal(true)}><FaPlus /> New Enquiry</button>
        </div>
      </div>

      {/* CARD GRID SECTION */}
      <div className="seq-card-grid">
        {currentRecords.map((enq) => (
          <div className={`seq-enquiry-card ${enq.status.toLowerCase()}`} key={enq.id}>
            <div className="seq-card-badge">{enq.status}</div>
            <div className="seq-user-info">
              <h3>{enq.name}</h3>
              <span className="seq-course-name">{enq.courseName || enq.course}</span>
            </div>
            <div className="seq-contact-details">
              <p><FaEnvelope className="seq-icon-small" /> {enq.email}</p>
              <p><FaPhoneAlt className="seq-icon-small" /> {enq.phone}</p>
              <div className="seq-message-box">
                <strong><FaCommentDots size={10} /> Message:</strong>
                <p>"{enq.message}"</p>
              </div>
              <p className="seq-date"><FaCalendarAlt className="seq-icon-small" /> {enq.date}</p>
            </div>
            <div className="seq-card-actions">
              <button 
                className={`seq-btn-status ${enq.status === 'Converted' ? 'active' : ''}`} 
                onClick={() => toggleStatus(enq.id, enq.status, enq)}
              >
                <FaCheckCircle /> {enq.status === "Pending" ? "Convert" : "Done"}
              </button>
              <button className="seq-btn-wa" onClick={() => sendWhatsApp(enq.phone, enq.name)}><FaWhatsapp /></button>
              <button className="seq-btn-edit" onClick={() => handleEdit(enq)}><FaEdit /></button>
              <button className="seq-btn-delete" onClick={() => deleteEnquiry(enq.id)}><FaTrashAlt /></button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION SECTION */}
      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <button className="pag-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft /> Prev</button>
          <span className="pag-info">Page {currentPage} of {totalPages}</span>
          <button className="pag-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next <FaChevronRight /></button>
        </div>
      )}

      {/* MODAL SECTION */}
      {showModal && (
        <div className="seq-modal-overlay">
          <div className="seq-modal-content">
            <div className="seq-modal-header">
              <h2>{editId ? "Update Enquiry" : "New Enquiry"}</h2>
              <button onClick={closeModal} className="seq-close-btn"><FaTimes /></button>
            </div>
            <form onSubmit={handleSave} className="seq-form">
              <div className="seq-form-group">
                <label>Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="seq-form-row">
                <div className="seq-form-group">
                  <label>Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="seq-form-group">
                  <label>Mobile</label>
                  <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="seq-form-group">
                <label>Course Name</label>
                <select 
                  required 
                  value={formData.course} 
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="seq-select-input"
                >
                  <option value="" disabled>Select course</option>
                  {dbCourses.map((course) => (
                    <option key={course.Id} value={course.title}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div className="seq-form-group">
                <label>Message</label>
                <textarea rows="3" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              <div className="seq-modal-btns">
                 <button type="button" className="seq-cancel-btn" onClick={closeModal}>Discard</button>
                 <button type="submit" className="seq-submit-btn">{editId ? "Update" : "Save Enquiry"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnquiry;