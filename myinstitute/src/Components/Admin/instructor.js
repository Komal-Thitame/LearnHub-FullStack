import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Saare icons use ho rahe hain ab niche
import { 
  faUserEdit, faPlus, faSearch, faTrashAlt, faTimes, 
  faChevronLeft, faChevronRight, faCamera 
} from "@fortawesome/free-solid-svg-icons";
import './instructor.css';

const Instructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", tasks: "0", performance: "80%", status: "Active" });

  // Pagination states (faChevron icons use karne ke liye)
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const loadInstructors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/instructors");
      setInstructors(res.data);
    } catch (err) { console.error("Load Error:", err); }
  };

  useEffect(() => { loadInstructors(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("subject", formData.subject);
    data.append("tasks", formData.tasks);
    data.append("performance", formData.performance);
    data.append("status", formData.status);
    
    if (selectedFile) data.append("photo", selectedFile);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editId) {
        await axios.put(`http://localhost:5000/api/instructors/${editId}`, data, config);
      } else {
        await axios.post("http://localhost:5000/api/instructors", data, config);
      }
      loadInstructors();
      setShowModal(false);
      setSelectedFile(null);
      setPreview(null);
      alert("Instructor Saved!");
    } catch (err) { 
      console.error("Save Error:", err);
      alert("Failed to save.");
    }
  };

  const handleOpenModal = (inst = null) => {
    if (inst) {
      setEditId(inst.id);
      setFormData({ ...inst });
      setPreview(inst.photo_url);
    } else {
      setEditId(null);
      setFormData({ name: "", email: "", subject: "", tasks: "0", performance: "80%", status: "Active" });
      setPreview(null);
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  // Search aur Filter logic (setSearchTerm aur setFilterStatus use ho gaya)
  const filteredData = instructors.filter(inst => 
    (inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || inst.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "All" || inst.status === filterStatus)
  );

  // Pagination Logic (faChevronLeft/Right use ho gaya)
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentRecords = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <div className="inst-page-wrapper">
      <div className="inst-top-bar">
        <h2>Instructor Management</h2>
        <div className="top-actions" style={{display:'flex', gap:'10px'}}>
           {/* Search Box */}
           <div className="search-box" style={{position:'relative'}}>
              <FontAwesomeIcon icon={faSearch} style={{position:'absolute', left:'10px', top:'10px', color:'#aaa'}} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{paddingLeft:'30px', height:'35px', borderRadius:'5px', border:'1px solid #ddd'}}
              />
           </div>
           {/* Filter Dropdown */}
           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{borderRadius:'5px', border:'1px solid #ddd'}}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
           </select>
           <button className="btn-add-main" onClick={() => handleOpenModal()}>
              <FontAwesomeIcon icon={faPlus} /> Add Instructor
           </button>
        </div>
      </div>

      <div className="inst-table-container">
          <table className="inst-main-table">
            <thead>
              <tr><th>Instructor</th><th>Subject</th><th>Assignments</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {currentRecords.map((inst) => (
                <tr key={inst.id}>
                  <td className="user-info">
                    {inst.photo_url ? <img src={inst.photo_url} alt="p" style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}} /> : <div className="user-img">{inst.name[0]}</div>}
                    <div>
                        <div className="u-name">{inst.name}</div>
                        <div className="u-email">{inst.email}</div>
                    </div>
                  </td>
                  <td>{inst.subject}</td>
                  <td>{inst.tasks} Active</td>
                  <td><span className={`status-dot ${inst.status === 'Active' ? 'online' : 'offline'}`}>{inst.status}</span></td>
                  <td className="action-btns">
                    <button className="act-icon edit" onClick={() => handleOpenModal(inst)}><FontAwesomeIcon icon={faUserEdit}/></button>
                    <button className="act-icon delete" onClick={async () => { if(window.confirm("Remove?")) { await axios.delete(`http://localhost:5000/api/instructors/${inst.id}`); loadInstructors(); } }}><FontAwesomeIcon icon={faTrashAlt}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination" style={{marginTop:'20px', display:'flex', justifyContent:'center', alignItems:'center', gap:'15px'}}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pag-btn">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span>Page {currentPage} of {totalPages || 1}</span>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="pag-btn">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
          </div>
      </div>

      {showModal && (
        <div className="inst-modal-overlay">
          <div className="inst-modal-content">
            <div className="inst-modal-header">
                <h3>{editId ? "Edit Instructor" : "Add Instructor"}</h3>
                <button onClick={() => setShowModal(false)}><FontAwesomeIcon icon={faTimes}/></button>
            </div>
            <form onSubmit={handleSave} className="inst-form">
              <div className="photo-upload-container" style={{textAlign:'center', marginBottom:'10px'}}>
                <div className="photo-preview">
                    {preview ? <img src={preview} alt="p" style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover'}}/> : <div className="no-img">No Image</div>}
                    <label htmlFor="file-input" className="upload-label"><FontAwesomeIcon icon={faCamera}/></label>
                    <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                </div>
              </div>
              <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-row">
                  <div className="form-group">
                      <label>Subject</label>
                      <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
                  </div>
                  
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-save">Save Instructor</button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructor;