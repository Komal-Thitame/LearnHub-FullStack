import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useLocation } from "react-router-dom";
import { 
  FaFilePdf, FaFileExcel, FaSearch, FaPlus, FaUserGraduate, 
  FaEdit, FaTrashAlt, FaFilter, FaCamera, FaArrowLeft, FaPhone, 
  FaEnvelope, FaMapMarkerAlt, FaIdCard, FaBirthdayCake
} from "react-icons/fa";
import "./student.css"; 

const Admission = () => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState("list"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [students, setStudents] = useState([]);
  const [dbCourses, setDbCourses] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [formData, setFormData] = useState({ 
    name: "", course: "", email: "", phone: "", address: "", 
    status: "Active", photo: null, gender: "", dob: "", city: ""
  });

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    try {
      const [courseRes, studentRes] = await Promise.all([
        axios.get("http://localhost:5000/get-courses"),
        axios.get("http://localhost:5000/api/admissions")
      ]);
      setDbCourses(courseRes.data);
      setStudents(studentRes.data.reverse()); 

      if (location.state && location.state.convertedStudent) {
        const student = location.state.convertedStudent;
        const matchedCourse = courseRes.data.find(c => c.title === student.course);
        
        setFormData(prev => ({
          ...prev,
          name: student.name,
          email: student.email,
          phone: student.phone,
          course: matchedCourse ? matchedCourse.Id : ""
        }));
        
        setViewMode("form");
        window.history.replaceState({}, document.title);
      }
    } catch (err) {
      console.error("Error loading data", err);
    }
  }, [location.state]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  // --- STATUS UPDATE LOGIC ---
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admission/status/${id}`, { status: newStatus });
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status");
    }
  };

  // --- EXPORT FUNCTIONS ---
  const exportToExcel = () => {
    const dataToExport = students.map(s => ({
      ID: s.id, Name: s.name, Course: s.courseName, Email: s.email, Phone: s.phone, Status: s.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdmissionData");
    XLSX.writeFile(workbook, "Student_List.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Student Admission Report", 14, 15);
    autoTable(doc, {
      head: [["ID", "Name", "Course", "Email", "Phone", "Status"]],
      body: students.map(s => [`#${s.id}`, s.name, s.courseName || "N/A", s.email, s.phone, s.status]),
      startY: 20,
    });
    doc.save("Admission_Report.pdf");
  };

  // --- SEARCH & FILTER ---
  const filteredData = students.filter(s => {
    const nameMatch = (s.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const courseMatch = (s.courseName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || courseMatch;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const currentRecords = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  // --- ACTIONS ---
  const handleEdit = (student) => {
    setEditId(student.id);
    setFormData({ 
        ...student, 
        dob: student.dob ? student.dob.split('T')[0] : "" 
    });
    setViewMode("form");
  };

  const deleteStudent = async (id) => {
    if(window.confirm("Delete this admission?")) {
      await axios.delete(`http://localhost:5000/api/admission/${id}`);
      loadData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Sirf wahi fields bhejein jo zaruri hain
    Object.keys(formData).forEach(key => {
      if (key !== 'photo' && key !== 'courseName') {
        data.append(key, formData[key] || "");
      }
    });

    if (formData.photo instanceof File) {
      data.append("photo", formData.photo);
    }

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/admission/${editId}`, data);
      } else {
        await axios.post("http://localhost:5000/api/admission", data);
      }
      setViewMode("list");
      setEditId(null);
      setFormData({ name: "", course: "", email: "", phone: "", address: "", status: "Active", photo: null, gender: "", dob: "", city: "" });
      loadData();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving data");
    }
  };

  return (
    <div className="sap-wrapper">
      {viewMode === "list" ? (
        <div className="sap-content-fade">
          <div className="sap-top-bar">
            <div className="sap-search-wrapper">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="sap-card">
            <div className="sap-card-header">
              <div className="sap-header-title">
                <div className="sap-icon-box"><FaUserGraduate /></div>
                <div>
                  <h3>Admission Database</h3>
                  <span>{filteredData.length} Total Students</span>
                </div>
              </div>
              <div className="sap-header-tools">
                <div className="sap-filter-dropdown">
                  <FaFilter />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <button className="btn-export-excel" onClick={exportToExcel}><FaFileExcel /> Excel</button>
                <button className="btn-export-pdf" onClick={exportToPDF}><FaFilePdf /> PDF</button>
                <button className="btn-new-admission" onClick={() => { setEditId(null); setViewMode("form"); setFormData({ name: "", course: "", email: "", phone: "", address: "", status: "Active", photo: null, gender: "", dob: "", city: "" }); }}><FaPlus /> New</button>
              </div>
            </div>

            <table className="sap-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>STUDENT NAME</th>
                  <th>COURSE</th>
                  <th>CONTACT</th>
                  <th>STATUS</th>
                  <th style={{textAlign: 'center'}}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((s) => (
                  <tr key={s.id}>
                    <td className="txt-bold">#{s.id}</td>
                    <td>
                      <div className="txt-name">{s.name}</div>
                      <div className="txt-sub">{s.email}</div>
                    </td>
                    <td><span className="badge-course">{s.courseName || "N/A"}</span></td>
                    <td>{s.phone}</td>
                    <td>
                      <select 
                        className={`status-select-inline ${s.status.toLowerCase()}`}
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="sap-actions-flex">
                        <button className="btn-edit-icon" onClick={() => handleEdit(s)} title="Edit"><FaEdit /></button>
                        <button className="btn-del-icon" onClick={() => deleteStudent(s.id)} title="Delete"><FaTrashAlt /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sap-pagination-footer">
              <button className="pag-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              <div className="pag-info">Page {currentPage} of {totalPages || 1}</div>
              <button className="pag-nav-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="sap-form-container sap-content-fade">
          <div className="sap-form-header">
            <button className="btn-back-list" onClick={() => setViewMode("list")}><FaArrowLeft /> Back</button>
            <h2>{editId ? "Update Student" : "New Registration"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="sap-detailed-form">
            <div className="form-inner-grid">
              <div className="form-sidebar">
                <div className="photo-frame">
                  {formData.photo ? (
                    <img 
                      src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : formData.photo} 
                      alt="Profile" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Photo"; }}
                    />
                  ) : (
                    <div className="upload-placeholder">
                        <FaCamera size={40} />
                        <p>Upload</p>
                    </div>
                  )}
                </div>
                <input type="file" id="photo-input" hidden onChange={(e) => setFormData({...formData, photo: e.target.files[0]})} />
                <label htmlFor="photo-input" className="photo-label">Select Photo</label>
              </div>

              <div className="form-main-fields">
                <h4 className="sec-title"><FaIdCard /> Personal Details</h4>
                <div className="field-row">
                  <div className="form-control">
                    <label>Full Name</label>
                    <input type="text" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-control">
                    <label>Gender</label>
                    <select value={formData.gender} onChange={(e)=>setFormData({...formData, gender: e.target.value})}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <div className="form-control">
                    <label><FaBirthdayCake /> DOB</label>
                    <input type="date" value={formData.dob} onChange={(e)=>setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div className="form-control">
                    <label><FaMapMarkerAlt /> City</label>
                    <input type="text" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})} />
                  </div>
                </div>

                <h4 className="sec-title"><FaPhone /> Contact & Course</h4>
                <div className="field-row">
                  <div className="form-control">
                    <label><FaEnvelope /> Email</label>
                    <input type="email" required value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-control">
                    <label><FaPhone /> Mobile</label>
                    <input type="tel" required value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="form-control">
                  <label>Course</label>
                  <select required value={formData.course} onChange={(e)=>setFormData({...formData, course: e.target.value})}>
                    <option value="">Select Course</option>
                    {dbCourses.map(c => <option key={c.Id} value={c.Id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="form-control">
                  <label>Address</label>
                  <textarea rows="2" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})}></textarea>
                </div>

                <div className="form-submit-row">
                  <button type="button" className="btn-discard" onClick={() => setViewMode("list")}>Cancel</button>
                  <button type="submit" className="btn-save-admission">Save Record</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admission;