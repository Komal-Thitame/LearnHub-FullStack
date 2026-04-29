import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaSearch, FaPlus, FaGraduationCap, FaEdit, FaTrashAlt, 
  FaTimes, FaChevronLeft, FaChevronRight, FaCloudUploadAlt 
} from "react-icons/fa";
import "./view-manage-courses.css";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    title: "", 
    instructor_id: "", 
    price: "", 
    status: "Active", 
    description: "", 
    duration: "",
    content: "" 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const courseRes = await axios.get("http://localhost:5000/get-view-courses");
      const insRes = await axios.get("http://localhost:5000/api/instructors");
      setCourses(courseRes.data || []);
      setInstructors(insRes.data || []);
    } catch (err) { console.error(err); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (selectedFile) data.append("courseImage", selectedFile);

    const url = editMode 
      ? `http://localhost:5000/update-course/${currentId}` 
      : "http://localhost:5000/add-course";

    try {
      await axios({
        method: editMode ? "put" : "post",
        url: url,
        data: data,
        headers: { "Content-Type": "multipart/form-data" }
      });
      loadData();
      closeModal();
    } catch (err) { alert("Error saving data"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`http://localhost:5000/delete-course/${id}`);
        loadData();
      } catch (err) { alert("Error deleting course"); }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedFile(null);
    setFormData({ title: "", instructor_id: "", price: "", status: "Active", description: "", duration: "", content: "" });
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="manage-courses-page">
      {/* Header Section */}
      <div className="page-top-header">
        <div className="search-wrapper-center">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="content-card">
        <div className="card-header-flex">
          <div className="title-section">
            <div className="icon-circle"><FaGraduationCap /></div>
            <div>
              <h3>Inventory & Control</h3>
              <p>Total {filtered.length} courses</p>
            </div>
          </div>
          <button className="btn-add-course" onClick={() => setShowModal(true)}>
            <FaPlus /> Add Course
          </button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>COURSE NAME</th>
              <th>INSTRUCTOR</th>
              <th>PRICE</th>
              <th style={{ textAlign: "center" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((c) => (
              <tr key={c.Id}>
                <td>#{c.Id}</td>
                <td className="bold-text">{c.title}</td>
                <td style={{ fontWeight: "600", color: "#2c3e50" }}>{c.instructor_name || "Not Assigned"}</td>
                <td className="price-tag">₹{c.price}</td>
                <td style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    <button className="edit-icon-btn" onClick={() => { 
                      setEditMode(true); 
                      setCurrentId(c.Id); 
                      setFormData(c); 
                      setShowModal(true); 
                    }}>
                      <FaEdit />
                    </button>
                    <button className="delete-icon-btn" style={{ color: "#e74c3c" }} onClick={() => handleDelete(c.Id)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-container">
          <button className="pagi-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <FaChevronLeft />
          </button>
          <span style={{ fontWeight: '600', color: '#555' }}>Page {currentPage} of {totalPages}</span>
          <button className="pagi-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* NEW SINGLE PAGE MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-window single-page-fit">
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                {editMode ? "Update Course" : "Create New Course"}
              </h2>
              <FaTimes onClick={closeModal} style={{ cursor: 'pointer', fontSize: '1.2rem' }} />
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="premium-form-container">
                {/* LEFT COLUMN */}
                <div className="form-left">
                  <div className="input-box">
                    <label>Course Cover Image</label>
                    <label className="upload-area-compact">
                      <FaCloudUploadAlt size={30} color="#6366f1" />
                      <p style={{ fontSize: '12px', margin: '5px 0' }}>
                        {selectedFile ? selectedFile.name : "Click to select image"}
                      </p>
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                        accept="image/*"
                      />
                    </label>
                  </div>
                  
                  <div className="input-box">
                    <label>Description</label>
                    <textarea 
                      rows="6" 
                      placeholder="Brief about the course..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="form-right">
                  <div className="input-box">
                    <label>Course Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Full Stack MERN Development" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="input-box" style={{ flex: 1 }}>
                      <label>Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="2999" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                      />
                    </div>
                    <div className="input-box" style={{ flex: 1 }}>
                      <label>Duration</label>
                      <input 
                        type="text" 
                        placeholder="3 Months" 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-box">
                    <label>Assign Instructor</label>
                    <select 
                      value={formData.instructor_id}
                      onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                      required
                    >
                      <option value="">Choose Instructor</option>
                      {instructors.map(ins => (
                        <option key={ins.id} value={ins.id}>{ins.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-box">
                    <label>Course Content (Syllabus)</label>
                    <textarea 
                      rows="4" 
                      placeholder="Module 1: Intro..."
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* FIXED FOOTER */}
              <div className="modal-footer-fixed">
                <button type="button" className="btn-secondary" onClick={closeModal}>Discard</button>
                <button type="submit" className="btn-primary">
                  {editMode ? "Save Changes" : "Publish Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;