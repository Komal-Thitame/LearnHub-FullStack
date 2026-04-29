import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileInvoice, FaDownload, FaSpinner } from "react-icons/fa";
import "./Recipts.css";

const StudentReceipts = () => {
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]); // Needed for Balance Calculation
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    try {
      const userEmail = localStorage.getItem("studentEmail");
      if (!userEmail) {
        setLoading(false);
        return;
      }

      // 1. Fetch Student's Payments
      // 2. Fetch All Courses (To calculate Total Fees)
      const [payRes, courRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/payments/student/email/${userEmail}`),
        axios.get("http://localhost:5000/get-view-courses")
      ]);

      setPayments(payRes.data || []);
      setCourses(courRes.data || []);

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  // ✅ EXACT LOGIC FROM ADMIN: StudentPayment.js
  const getStudentBalance = (studentId, courseInput) => {
    // Find course by ID or Title
    const course = courses.find(c => 
      String(c.Id) === String(courseInput) || 
      String(c.title).toLowerCase() === String(courseInput)?.toLowerCase()
    );
    
    const total = course ? Number(course.price) : 0;
    
    // Sum of payments (Filtered by student_id)
    const paid = payments
      .filter(p => String(p.student_id) === String(studentId))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return { paid, pending: total - paid };
  };

  // ✅ PROFESSIONAL RECEIPT GENERATOR (CSM COMPUTER Style)
  const generateReceipt = (payment) => {
    const balance = getStudentBalance(payment.student_id, payment.course_name);
    const doc = new jsPDF();

    // --- 1. HEADER SECTION (CSM COMPUTER) ---
    doc.setFillColor(30, 41, 59); // Dark Blue
    doc.rect(0, 0, 220, 40, "F");
    
    // Left Side: Branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CSM COMPUTER", 15, 18); // Changed to CSM COMPUTER
    
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text("Software Development Training & Institute", 15, 25);
    doc.text("Contact: +91 9876543210 | Web: www.csmcomputer.com", 15, 31);

    // Right Side: Receipt Info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", 195, 18, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(payment.payment_date || Date.now()).toLocaleDateString('en-GB')}`, 195, 26, { align: "right" });
    doc.text(`Receipt No: #${payment.payment_id}`, 195, 32, { align: "right" });

    // --- 2. STUDENT INFO SECTION ---
    let yPos = 50;
    
    // "Bill To" Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos, 90, 30, 2, 2, "F");

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("BILL TO", 19, yPos + 6);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(payment.student_name || "Student", 19, yPos + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Student ID: ${payment.student_id}`, 19, yPos + 19);
    doc.text(`Course: ${payment.course_name}`, 19, yPos + 25);

    // Status Badge
    const statusText = balance.pending <= 0 ? "FULLY PAID" : "PARTIALLY PAID";
    const statusColor = balance.pending <= 0 ? [34, 197, 94] : [239, 68, 68];

    doc.setFillColor(...statusColor);
    doc.roundedRect(150, yPos + 5, 45, 10, 3, 3, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(statusText, 172.5, yPos + 11.5, { align: "center" });

    yPos += 40;

    // --- 3. TABLE SECTION ---
    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Description', 'Payment Method', 'Amount']],
      body: [
        ['1', `Tuition Fee Installment for ${payment.course_name}`, payment.method || "Cash", `Rs. ${payment.amount}`],
      ],
      headStyles: { 
        fillColor: [241, 245, 249], 
        textColor: [71, 85, 105],
        fontStyle: 'bold', fontSize: 10, halign: 'left'
      },
      bodyStyles: { textColor: [30, 30, 30], fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' }
      },
      theme: 'grid',
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // --- 4. TOTALS SECTION ---
    const totalsX = 130;
    const valueX = 195;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Current Payment
    doc.setTextColor(100, 100, 100);
    doc.text("Current Payment:", totalsX, yPos);
    doc.setTextColor(30, 30, 30);
    doc.text(`Rs. ${payment.amount}`, valueX, yPos, { align: "right" });
    
    // Total Paid So Far
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Total Paid So Far:", totalsX, yPos);
    doc.setTextColor(34, 197, 94);
    doc.text(`Rs. ${balance.paid}`, valueX, yPos, { align: "right" });

    // Balance Due
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Balance Due:", totalsX, yPos);
    
    // Color Logic (Green if 0, Red if pending)
    if (balance.pending > 0) {
      doc.setTextColor(239, 68, 68); // Red
    } else {
      doc.setTextColor(34, 197, 94); // Green
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${balance.pending}`, valueX, yPos, { align: "right" });

    // --- 5. FOOTER ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 35, 195, pageHeight - 35);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Terms & Conditions:", 15, pageHeight - 28);
    doc.text("1. This is a computer-generated receipt.", 15, pageHeight - 23);
    doc.text("2. Fee once paid is non-refundable.", 15, pageHeight - 18);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("For CSM Computer", 180, pageHeight - 25, { align: "center" });
    
    doc.line(155, pageHeight - 10, 195, pageHeight - 10);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Authorized Signatory", 175, pageHeight - 6, { align: "center" });

    doc.save(`Receipt_${payment.student_name}.pdf`);
  };

  if (loading) {
    return (
      <div className="loader" style={{textAlign: 'center', marginTop: '50px'}}>
        <FaSpinner className="spin" /> <p>Loading your receipts...</p>
      </div>
    );
  }

  return (
    <div className="student-payment-page">
      <div className="spp-header">
        <h2><FaFileInvoice /> My Payment History</h2>
        <p>View and download your official course fee receipts.</p>
      </div>

      <table className="spp-table">
        <thead>
          <tr>
            <th>Receipt No</th>
            <th>Date</th>
            <th>Course</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((p) => (
              <tr key={p.payment_id}>
                <td><strong>#{p.payment_id}</strong></td>
                <td>{new Date(p.payment_date).toLocaleDateString('en-GB')}</td>
                <td>{p.course_name}</td>
                <td>₹{p.amount}</td>
                <td><span className="method-badge">{p.method}</span></td>
                <td>
                  <button className="download-btn" onClick={() => generateReceipt(p)}>
                    <FaDownload /> Download PDF
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentReceipts;