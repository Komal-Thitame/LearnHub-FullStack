import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable"; 
import * as XLSX from "xlsx"; 
import { 
  FaFilePdf, FaFileExcel, FaSearch, FaPlus, 
  FaCreditCard, FaEdit, FaTrashAlt, FaFilter, FaTimes, 
  FaChevronLeft, FaChevronRight, FaFileInvoice 
} from "react-icons/fa";
import "./student.css";

const StudentPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]); 
  const [courses, setCourses] = useState([]); 
  const [feeStats, setFeeStats] = useState({ total: 0, paid: 0, pending: 0, courseName: "Not Selected" });

  const [formData, setFormData] = useState({ 
    student_id: "", amount: "", method: "UPI", status: "Paid" 
  });

  const loadData = async () => {
    try {
      const [payRes, studRes, courRes] = await Promise.all([
        axios.get("http://localhost:5000/api/payments"),
        axios.get("http://localhost:5000/api/admissions"),
        axios.get("http://localhost:5000/get-view-courses")
      ]);
      setPayments(payRes.data || []);
      setStudents(studRes.data || []);
      setCourses(courRes.data || []);
    } catch (err) { console.error("Error loading data:", err); }
  };

  useEffect(() => { loadData(); }, []);

  const getStudentBalance = (studentId, courseInput) => {
    const course = courses.find(c => String(c.Id) === String(courseInput) || String(c.title).toLowerCase() === String(courseInput)?.toLowerCase());
    const total = course ? Number(course.price) : 0;
    const paid = payments.filter(p => String(p.student_id) === String(studentId) && p.status === "Paid").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { paid, pending: total - paid };
  };

  // --- Export to Excel ---
  const exportToExcel = () => {
    const data = filteredPayments.map(p => {
      const balance = getStudentBalance(p.student_id, p.course_name);
      return {
        "Payment ID": p.payment_id,
        "Student Name": p.student_name,
        "Course": p.course_name,
        "Amount Paid": p.amount,
        "Total Paid": balance.paid,
        "Remaining Pending": balance.pending,
        "Status": balance.pending <= 0 ? "Fully Paid" : "Partially Paid"
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "Student_Payments.xlsx");
  };

  // --- Export to PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Student Payment Report", 14, 15);
    const tableColumn = ["ID", "Student", "Course", "Amount", "Paid", "Pending", "Status"];
    const tableRows = filteredPayments.map(p => {
      const balance = getStudentBalance(p.student_id, p.course_name);
      return [
        p.payment_id,
        p.student_name,
        p.course_name,
        `Rs.${p.amount}`,
        `Rs.${balance.paid}`,
        `Rs.${balance.pending}`,
        balance.pending <= 0 ? "Fully Paid" : "Partially Paid"
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("Student_Payments.pdf");
  };

  // --- PROFESSIONAL RECEIPT GENERATOR ---
  const generateReceipt = (payment) => {
    const balance = getStudentBalance(payment.student_id, payment.course_name);
    const doc = new jsPDF();

    // 1. HEADER SECTION
    doc.setFillColor(30, 41, 59); // Dark Slate Blue
    doc.rect(0, 0, 220, 40, "F");
    
    // Logo / Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EduHub", 15, 18);
    
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text("Software & IT Skill Training Institute", 15, 25);
    doc.text("Contact: +91 9876543210 | Web: www.eduhub.com", 15, 31);

    // Right Side Header Info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", 195, 18, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 26, { align: "right" });
    doc.text(`Receipt No: #${payment.payment_id}`, 195, 32, { align: "right" });

    // 2. STUDENT INFO SECTION
    let yPos = 50;
    
    // "Bill To" Box
    doc.setFillColor(248, 250, 252); // Light Gray Background
    doc.roundedRect(15, yPos, 90, 30, 2, 2, "F");

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("BILL TO", 19, yPos + 6);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(payment.student_name, 19, yPos + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Student ID: ${payment.student_id}`, 19, yPos + 19);
    doc.text(`Course: ${payment.course_name}`, 19, yPos + 25);

    // Status Badge on Right
    const statusText = balance.pending <= 0 ? "FULLY PAID" : "PARTIALLY PAID";
    const statusColor = balance.pending <= 0 ? [34, 197, 94] : [239, 68, 68]; // Green or Red

    doc.setFillColor(...statusColor);
    doc.roundedRect(150, yPos + 5, 45, 10, 3, 3, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(statusText, 172.5, yPos + 11.5, { align: "center" });

    yPos += 40;

    // 3. TABLE SECTION
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Description', 'Payment Method', 'Amount']],
      body: [
        ['1', `Tuition Fee Installment for ${payment.course_name}`, payment.method, `Rs. ${payment.amount}`],
      ],
      headStyles: { 
        fillColor: [241, 245, 249], 
        textColor: [71, 85, 105],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      bodyStyles: { 
        textColor: [30, 30, 30],
        fontSize: 10 
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' }
      },
      theme: 'grid',
      tableLineColor: [226, 232, 240],
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // 4. TOTALS SECTION (Right Aligned)
    const totalsX = 130;
    const valueX = 195;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Current Payment
    doc.setTextColor(100, 100, 100);
    doc.text("Current Payment:", totalsX, yPos);
    doc.setTextColor(30, 30, 30);
    doc.text(`Rs. ${payment.amount}`, valueX, yPos, { align: "right" });
    
    // Total Paid
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Total Paid So Far:", totalsX, yPos);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Rs. ${balance.paid}`, valueX, yPos, { align: "right" });

    // Balance Due
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Balance Due:", totalsX, yPos);
    doc.setTextColor(239, 68, 68); // Red
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${balance.pending}`, valueX, yPos, { align: "right" });

    // 5. FOOTER
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 35, 195, pageHeight - 35);

    // Terms
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Terms & Conditions:", 15, pageHeight - 28);
    doc.text("1. This is a computer-generated receipt and does not require a physical signature.", 15, pageHeight - 23);
    doc.text("2. Fee once paid is non-refundable unless stated otherwise.", 15, pageHeight - 18);

    // Signature Area
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("For EduHub", 180, pageHeight - 25, { align: "center" });
    
    doc.setDrawColor(150, 150, 150);
    doc.line(155, pageHeight - 10, 195, pageHeight - 10); // Signature line
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Authorized Signatory", 175, pageHeight - 6, { align: "center" });

    // Save
    doc.save(`Receipt_${payment.student_name}.pdf`);
  };

  const handleStudentSelection = (id) => {
    setFormData(prev => ({ ...prev, student_id: id }));
    if (!id) {
      setFeeStats({ total: 0, paid: 0, pending: 0, courseName: "Not Selected" });
      return;
    }
    const student = students.find(s => String(s.id) === String(id));
    const course = courses.find(c => 
      String(c.Id) === String(student?.course) || 
      String(c.title).toLowerCase() === String(student?.course).toLowerCase()
    );
    const totalFee = course ? Number(course.price) : 0;
    const alreadyPaid = payments
      .filter(p => String(p.student_id) === String(id) && p.status === "Paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    setFeeStats({ total: totalFee, paid: alreadyPaid, pending: totalFee - alreadyPaid, courseName: course ? course.title : (student?.course || "N/A") });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await axios.put(`http://localhost:5000/api/payments/${editId}`, formData); }
      else { await axios.post("http://localhost:5000/api/payments", formData); }
      loadData(); closeModal();
    } catch (err) { alert("Error saving payment"); }
  };

  const closeModal = () => {
    setShowModal(false); setEditId(null);
    setFormData({ student_id: "", amount: "", method: "UPI", status: "Paid" });
    setFeeStats({ total: 0, paid: 0, pending: 0, courseName: "Not Selected" });
  };

  const filteredPayments = payments.filter(p => {
    const balance = getStudentBalance(p.student_id, p.course_name);
    const isFullyPaid = balance.pending <= 0;
    const currentStatus = isFullyPaid ? "Fully Paid" : "Partially Paid";

    const matchesSearch = (p.student_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);
  const currentRecords = filteredPayments.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="student-payment-page">
      <div className="spp-top-header">
         <div className="spp-search-container">
            <FaSearch className="spp-search-icon" />
            <input type="text" placeholder="Search student name..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
         </div>
      </div>

      <div className="spp-main-card">
        <div className="spp-card-header">
          <div className="spp-title-box">
            <div className="spp-icon-circle"><FaCreditCard /></div>
            <div>
              <h3>Fee Transactions</h3>
              <p>Found {filteredPayments.length} records</p>
            </div>
          </div>
          <div className="spp-actions">
            <div className="spp-filter-box">
               <FaFilter size={12} color="#94a3b8" />
               <select value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
                 <option value="All">All Status</option>
                 <option value="Fully Paid">Fully Paid</option>
                 <option value="Partially Paid">Partially Paid</option>
               </select>
            </div>
            <button className="spp-btn-excel" onClick={exportToExcel}><FaFileExcel /> Excel</button>
            <button className="spp-btn-pdf" onClick={exportToPDF}><FaFilePdf /> PDF</button>
            <button className="spp-btn-add" onClick={() => setShowModal(true)}><FaPlus /> Add Payment</button>
          </div>
        </div>

        <table className="spp-table">
          <thead>
            <tr>
              <th>ID</th><th>STUDENT</th><th>COURSE</th><th>TRANSACTION</th><th>FEE SUMMARY</th><th>FINAL STATUS</th><th style={{textAlign: 'center'}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map(p => {
              const balance = getStudentBalance(p.student_id, p.course_name);
              const isFullyPaid = balance.pending <= 0;
              return (
                <tr key={p.payment_id}>
                  <td className="spp-id-txt">{p.payment_id}</td>
                  <td className="spp-name-txt">{p.student_name}</td>
                  <td>{p.course_name}</td>
                  <td className="spp-amt-txt">₹{p.amount}</td>
                  <td>
                    <div className="fee-summary-cell">
                        <span className="paid-txt">Paid: ₹{balance.paid}</span>
                        <span className="pending-txt">Pending: ₹{balance.pending}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`spp-status-pill ${isFullyPaid ? 'fully-paid' : 'partially-paid'}`}>
                      <span className="spp-dot-icon"></span> 
                      {isFullyPaid ? "FULLY PAID" : "PARTIALLY PAID"}
                    </span>
                  </td>
                  <td>
                    <div className="spp-action-buttons-container">
                      <button 
                        className="btn-act view" 
                        title="Receipt" 
                        onClick={() => generateReceipt(p)}
                      >
                        <FaFileInvoice />
                      </button>
                      <button className="btn-act edit" onClick={() => { setEditId(p.payment_id); setFormData(p); setShowModal(true); handleStudentSelection(p.student_id); }}><FaEdit /></button>
                      <button className="btn-act delete" onClick={async () => { if(window.confirm("Are you sure?")) { await axios.delete(`http://localhost:5000/api/payments/${p.payment_id}`); loadData(); } }}><FaTrashAlt /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="spp-pagination-container">
          <div className="pagination-wrapper">
            <button className="pag-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>
              <FaChevronLeft/> Previous
            </button>
            <div className="page-numbers">
                Page <b>{currentPage}</b> of {totalPages || 1}
            </div>
            <button className="pag-nav-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(c => c + 1)}>
              Next <FaChevronRight/>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="spp-modal-overlay">
          <div className="spp-modal-content" style={{ maxWidth: '450px', borderRadius: '15px' }}>
            <div className="spp-modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>
                {editId ? "Update Transaction" : "New Payment"}
              </h3>
              <FaTimes onClick={closeModal} style={{ cursor: 'pointer', color: '#94a3b8' }} />
            </div>

            <div style={{ 
                background: '#f8faff', 
                padding: '12px', 
                borderRadius: '8px', 
                margin: '15px 0', 
                fontSize: '13px', 
                border: '1px dashed #6366f1' 
            }}>
              <div style={{ marginBottom: '5px' }}><strong>Course:</strong> {feeStats.courseName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total: ₹{feeStats.total}</span>
                <span style={{ color: '#10b981' }}>Paid: ₹{feeStats.paid}</span>
                <span style={{ color: '#ef4444' }}>Due: ₹{feeStats.pending}</span>
              </div>
            </div>

            <form onSubmit={handleSave} className="spp-form">
              <div className="spp-form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Student</label>
                <select 
                  required 
                  value={formData.student_id} 
                  onChange={(e) => handleStudentSelection(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Method</label>
                  <select 
                    value={formData.method} 
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="spp-modal-btns" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontWeight: '600' }}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayment;