import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { 
  FaFilePdf, FaFileExcel, FaSearch, FaGraduationCap, 
  FaEye, FaTrashAlt, FaChevronLeft, FaChevronRight, FaTimes 
} from "react-icons/fa";
import "./view-manage-courses.css";

const ViewCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get-view-courses");
      setCourses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`http://localhost:5000/delete-course/${id}`);
        fetchCourses(); 
      } catch (err) {
        alert("Delete failed!");
      }
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(courses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
    XLSX.writeFile(workbook, "Course_Directory.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Course Directory Report", 14, 15);
    autoTable(doc, {
      head: [["ID", "Course Name", "Instructor", "Price", "Status"]],
      // PDF mein bhi instructor_name use kiya hai
      body: courses.map(c => [c.Id, c.title, c.instructor_name || "N/A", `₹${c.price}`, c.status]),
      startY: 20
    });
    doc.save("Course_Directory.pdf");
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) // Search by Name
  );

  const currentItems = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;

  return (
    <div className="manage-courses-page">
      <div className="page-top-header">
        <div className="search-wrapper-center">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search directory..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="content-card">
        <div className="card-header-flex">
          <div className="title-section">
            <div className="icon-circle"><FaGraduationCap /></div>
            <div>
              <h3>Course Directory</h3>
              <p>Total {filteredCourses.length} courses</p>
            </div>
          </div>
          <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-excel" onClick={exportToExcel}><FaFileExcel /> Excel</button>
            <button className="btn-pdf" onClick={exportToPDF}><FaFilePdf /> PDF</button>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>COURSE NAME</th>
              <th>INSTRUCTOR</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th style={{ textAlign: "center" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(course => (
              <tr key={course.Id}>
                <td>#{course.Id}</td>
                <td className="bold-text">{course.title}</td>
                {/* Fixed: Yahan instructor_name show hoga */}
                <td style={{ fontWeight: "600", color: "#2c3e50" }}>
                    {course.instructor_name || "Not Assigned"}
                </td>
                <td className="price-tag">₹{course.price}</td>
                <td><span className={`pill ${course.status?.toLowerCase()}`}>{course.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button className="view-icon-btn" onClick={() => handleView(course)}>
                      <FaEye />
                    </button>
                    <button className="delete-icon-btn" style={{ color: "#e74c3c" }} onClick={() => handleDelete(course.Id)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-container" style={{ display: "flex", justifyContent: "center", padding: "25px", gap: "10px" }}>
          <button className="pagi-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}><FaChevronLeft /></button>
          <span>Page {currentPage} of {totalPages}</span>
          <button className="pagi-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}><FaChevronRight /></button>
        </div>
      </div>

      {/* --- VIEW MODAL (Premium Enquiry Look) --- */}
      {showViewModal && selectedCourse && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-window" style={{ backgroundColor: 'white', width: '480px', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Course Info</h2>
              <FaTimes onClick={() => setShowViewModal(false)} style={{ cursor: 'pointer', color: '#aaa' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                <label style={{ fontSize: '11px', color: '#888', fontWeight: '700' }}>COURSE TITLE</label>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{selectedCourse.title}</div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#888', fontWeight: '700' }}>PRICE</label>
                  <div style={{ fontWeight: '600', color: '#6366f1' }}>₹{selectedCourse.price}</div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#888', fontWeight: '700' }}>INSTRUCTOR</label>
                  {/* Fixed: Modal mein bhi instructor_name */}
                  <div style={{ fontWeight: '600' }}>{selectedCourse.instructor_name || "N/A"}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                <label style={{ fontSize: '11px', color: '#888', fontWeight: '700' }}>DESCRIPTION</label>
                <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>{selectedCourse.description || "No description provided."}</div>
              </div>
            </div>

            <button onClick={() => setShowViewModal(false)} style={{ width: "100%", marginTop: "25px", padding: "12px", background: "#6366f1", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCourses;