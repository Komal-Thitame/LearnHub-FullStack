import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  FaUsers, FaRupeeSign, FaSyncAlt, FaWhatsapp, 
  FaFilePdf, FaFileExcel, FaChartPie, FaHistory, FaCalendarAlt, 
  FaArrowLeft, FaGraduationCap, FaReceipt, FaSearch, FaFileInvoice, FaBookOpen, FaUserTie, FaClock, FaPrint, FaMoneyCheckAlt, FaEye, FaDownload
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import "./reports.css";

// --- HELPER FUNCTION TO LOAD IMAGE ---
const toDataURL = async (url) => {
  try {
    if (!url) return null;
    if (url.startsWith('data:')) return url; 
    let cleanPath = url.replace(/\\/g, '/');
    let fullPath = cleanPath;
    if (!cleanPath.startsWith('http')) {
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        fullPath = `http://localhost:5000/${cleanPath}`;
    }
    const response = await fetch(fullPath);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Image loading error:", e);
    return null;
  }
};

const Reports = () => {
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingList, setPendingList] = useState([]); 
  const [students, setStudents] = useState([]); 
  const [coursesList, setCoursesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("menu"); 
  const [activeTab, setActiveTab] = useState("paid"); 
  const [courseFilter, setCourseFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for Transaction History
  const [selectedStudentId, setSelectedStudentId] = useState(""); 

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [payRes, studRes, courRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/payments?filter=${timeRange}`),
        axios.get(`http://localhost:5000/api/admin/reports/admissions?filter=${timeRange}&course=${courseFilter}`),
        axios.get("http://localhost:5000/get-view-courses") 
      ]);

      const payments = Array.isArray(payRes.data) ? payRes.data : [];
      const studentsData = Array.isArray(studRes.data) ? studRes.data : [];
      const courses = Array.isArray(courRes.data) ? courRes.data : [];
      
      setCoursesList(courses);

      const enrichedStudents = studentsData.map(student => {
        const courseDetail = courses.find(c => String(c.Id) === String(student.course) || c.title === student.course);
        return { 
          ...student, 
          courseName: student.courseName || courseDetail?.title || "N/A" 
        };
      });

      setStudents(enrichedStudents);

      let calculatedPendingList = [];

      enrichedStudents.forEach(student => {
        const courseDetail = courses.find(c => String(c.Id) === String(student.course) || c.title === student.course);
        const coursePrice = courseDetail ? Number(courseDetail.price) : 0;
        const studentPayments = payments.filter(p => String(p.student_id) === String(student.id));
        const paidByStudent = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const bal = coursePrice - paidByStudent;
        
        if (bal > 0) {
          calculatedPendingList.push({
            student_id: student.id,
            student_name: student.name,
            course_name: courseDetail?.title || "Unknown",
            pending_amount: bal,
            contact: student.phone || "91",
            last_check: new Date().toLocaleDateString('en-GB') 
          });
        }
      });

      setRecentPayments(payments); 
      setPendingList(calculatedPendingList);
      setIsLoading(false);
    } catch (err) { 
      setIsLoading(false); 
      console.error("Fetch Error:", err);
    }
  }, [timeRange, courseFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getStudentBalanceForReceipt = (studentId, courseInput) => {
    const course = coursesList.find(c => String(c.Id) === String(courseInput) || String(c.title).toLowerCase() === String(courseInput)?.toLowerCase());
    const total = course ? Number(course.price) : 0;
    const paid = recentPayments.filter(p => String(p.student_id) === String(studentId)).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { total, paid, pending: total - paid };
  };

  // --- PROFESSIONAL RECEIPT DRAWING LOGIC ---
  const drawProfessionalReceipt = (doc, payment) => {
    const balance = getStudentBalanceForReceipt(payment.student_id, payment.course_name);

    // 1. HEADER SECTION
    doc.setFillColor(30, 41, 59); 
    doc.rect(0, 0, 220, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CSM COMPUTER", 15, 18);
    
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text("Software Development Training & Training", 15, 25);
    doc.text("Contact: +91 9876543210 | Web: www.eduhub.com", 15, 31);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", 195, 18, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(payment.payment_date || new Date()).toLocaleDateString('en-GB')}`, 195, 26, { align: "right" });
    doc.text(`Receipt No: #${payment.payment_id || 'REC-'+Math.floor(Math.random()*1000)}`, 195, 32, { align: "right" });

    // 2. STUDENT INFO SECTION
    let yPos = 50;
    doc.setFillColor(248, 250, 252); 
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

    const statusText = balance.pending <= 0 ? "FULLY PAID" : "PARTIALLY PAID";
    const statusColor = balance.pending <= 0 ? [34, 197, 94] : [239, 68, 68];

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
        ['1', `Tuition Fee Installment for ${payment.course_name}`, payment.method || "UPI", `Rs. ${payment.amount}`],
      ],
      headStyles: { 
        fillColor: [241, 245, 249], 
        textColor: [71, 85, 105],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      bodyStyles: { textColor: [30, 30, 30], fontSize: 10 },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40 }, 3: { cellWidth: 30, halign: 'right' } },
      theme: 'grid',
      tableLineColor: [226, 232, 240],
      margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // 4. TOTALS SECTION
    const totalsX = 130;
    const valueX = 195;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.setTextColor(100, 100, 100);
    doc.text("Current Payment:", totalsX, yPos);
    doc.setTextColor(30, 30, 30);
    doc.text(`Rs. ${payment.amount}`, valueX, yPos, { align: "right" });
    
    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Total Paid So Far:", totalsX, yPos);
    doc.setTextColor(34, 197, 94);
    doc.text(`Rs. ${balance.paid}`, valueX, yPos, { align: "right" });

    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Balance Due:", totalsX, yPos);
    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${balance.pending}`, valueX, yPos, { align: "right" });

    // 5. FOOTER
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 35, 195, pageHeight - 35);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Terms & Conditions:", 15, pageHeight - 28);
    doc.text("1. This is a computer-generated receipt and does not require a physical signature.", 15, pageHeight - 23);
    doc.text("2. Fee once paid is non-refundable unless stated otherwise.", 15, pageHeight - 18);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("For CSM Computer", 180, pageHeight - 25, { align: "center" });
    doc.line(155, pageHeight - 10, 195, pageHeight - 10); 
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Authorized Signatory", 175, pageHeight - 6, { align: "center" });
  };

  // --- STATEMENT PDF DRAWING LOGIC ---
  const drawStatementPDF = (doc, student, ledgerRows) => {
    // HEADER
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 220, 35, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CSM COMPUTER", 15, 15);
    
    doc.setFontSize(12);
    doc.text("Fee Statement Report", 195, 15, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 195, 22, { align: "right" });

    // STUDENT DETAILS
    let y = 45;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text(`Student Name: `, 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(student.name, 50, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`Course: `, 15, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(student.courseName || "N/A", 38, y);

    y += 6;
    const balance = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balance : 0;
    const balanceColor = balance > 0 ? [239, 68, 68] : [34, 197, 94];
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`Current Balance: `, 15, y);
    doc.setTextColor(...balanceColor);
    doc.text(`Rs. ${balance}`, 55, y);

    // TABLE
    autoTable(doc, {
      startY: y + 10,
      head: [['Date', 'Description', 'Debit (Paid)', 'Credit (Charge)', 'Balance']],
      body: ledgerRows.map(row => [
        row.date,
        row.description,
        row.debit > 0 ? `Rs. ${row.debit}` : '-',
        row.credit > 0 ? `Rs. ${row.credit}` : '-',
        `Rs. ${row.balance}`
      ]),
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 }
      },
      theme: 'grid',
    });

    // FOOTER
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer generated statement.", 105, pageHeight - 10, { align: "center" });
  };

  // --- ADMISSION FORM DRAWING LOGIC ---
  const drawAdmissionForm = async (doc, student) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20; 
    const contentWidth = pageWidth - (margin * 2);
    let y = 25; 

    // 1. HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("CSM COMPUTER", pageWidth / 2, y, { align: "center" });
    
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Software Development Training & Training", pageWidth / 2, y, { align: "center" });
    
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Address: In Front of PVP Senior College Post: Loni Kh Tal: Rahata Dist: Ahilyanagar pin: 413713  | Contact: +91 1234567890", pageWidth / 2, y, { align: "center" });

    y += 8;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 15; 

    // 2. FORM TITLE
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 12, "F");
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.text("ADMISSION FORM", pageWidth / 2, y + 8, { align: "center" });
    
    y += 22; 

    // 3. REGISTRATION INFO
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text(`Registration No: ${student.id || "N/A"}`, margin, y);
    doc.text(`Date: ${new Date(student.date || Date.now()).toLocaleDateString('en-GB')}`, pageWidth - margin, y, { align: "right" });
    
    y += 12; 

    // 4. PHOTO BOX
    const photoSize = 35;
    const photoX = pageWidth - margin - photoSize;
    
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.rect(photoX, y, photoSize, 40, "FD");
    
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("PASSPORT SIZE", photoX + photoSize/2, y + 18, { align: "center" });
    doc.text("PHOTO", photoX + photoSize/2, y + 24, { align: "center" });

    if (student.photo) {
        const imgData = await toDataURL(student.photo);
        if (imgData) {
            try { doc.addImage(imgData, 'JPEG', photoX + 1, y + 1, photoSize - 2, 38); } 
            catch (e) { console.log("Photo Error"); }
        }
    }

    // 5. PERSONAL DETAILS
    const colWidth = (photoX - margin) - 15; 
    
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text("1. PERSONAL DETAILS", margin, y);
    
    y += 8;

    const drawField = (label, value, x, width) => {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "bold");
        doc.text(label, x, y);
        
        const labelWidth = doc.getTextWidth(label) + 2;
        
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "normal");
        doc.text(String(value || "N/A"), x + labelWidth, y);
    };

    drawField("Name: ", student.name, margin, colWidth);
    y += 12; 
    
    const halfCol = colWidth / 2;
    drawField("DOB: ", student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : "N/A", margin, halfCol - 5);
    drawField("Gender: ", student.gender, margin + halfCol + 10, halfCol); 
    y += 30; 

    // 6. CONTACT DETAILS
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("2. CONTACT DETAILS", margin, y);
    y += 8;

    drawField("Address: ", student.address, margin, contentWidth);
    y += 12;
    
    const thirdCol = contentWidth / 3;
    drawField("City: ", student.city, margin, thirdCol);
    drawField("Phone: ", student.phone, margin + thirdCol + 10, thirdCol);
    drawField("Email: ", student.email, margin + 2*thirdCol + 20, thirdCol);
    y += 12;

    // 7. COURSE DETAILS
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("3. COURSE DETAILS", margin, y);
    y += 8;
    
    const courseDetail = coursesList.find(c => String(c.Id) === String(student.course) || c.title === student.course);
    const totalFee = courseDetail ? courseDetail.price : "N/A";

    drawField("Course Applied: ", student.courseName, margin, contentWidth/2);
    drawField("Duration: ", courseDetail?.duration || "N/A", margin + contentWidth/2 + 15, contentWidth/2 - 10);
    y += 12;

    drawField("Total Fee: ", `Rs. ${totalFee}`, margin, contentWidth/2);
    
    const statusX = margin + contentWidth/2 + 15;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Status:", statusX, y);
    
    const statusVal = student.status || "Active";
    const statusColor = statusVal === 'Active' ? [34, 197, 94] : (statusVal === 'Pending' ? [234, 179, 8] : [239, 68, 68]);
    
    doc.setFillColor(...statusColor);
    doc.roundedRect(statusX + 20, y - 4, 30, 6, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(statusVal.toUpperCase(), statusX + 35, y, { align: "center" });
    
    y += 20; 

    // 8. DECLARATION
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(254, 254, 254);
    doc.rect(margin, y, contentWidth, 26, "FD"); 
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("DECLARATION", margin + 4, y + 6);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    const decl = "I hereby declare that the information furnished above is true to the best of my knowledge. I promise to abide by the rules and regulations of the institute.";
    doc.text(doc.splitTextToSize(decl, contentWidth - 8), margin + 4, y + 12);
    
    y += 35;

    // 9. SIGNATURES
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("Student Signature", margin, y);
    doc.line(margin, y + 2, margin + 60, y + 2);
    
    doc.text("Parent/Guardian Signature", pageWidth - margin - 60, y);
    doc.line(pageWidth - margin - 60, y + 2, pageWidth - margin, y + 2);
    
    y += 15;

    // 10. OFFICE USE ONLY
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 20, "F");
    doc.setDrawColor(100, 100, 100);
    doc.rect(margin, y, contentWidth, 20);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("FOR OFFICE USE ONLY", margin + 2, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Remarks: ____________________________________________", margin + 2, y + 14);
    doc.text("Authorized Seal & Sign", pageWidth - margin - 45, y + 14);
  };

  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    drawProfessionalReceipt(doc, payment);
    doc.save(`Receipt_${payment.student_name}.pdf`);
  };

  const generateAdmissionForm = async (student) => {
    const doc = new jsPDF();
    await drawAdmissionForm(doc, student); 
    doc.save(`Admission_Form_${student.name}.pdf`);
  };

  // --- EXPORT HANDLER FOR TRANSACTION HISTORY ---
  const handleTransactionExport = (type) => {
    if (!selectedStudentId) {
      alert("Please select a student first.");
      return;
    }
    const student = students.find(s => String(s.id) === String(selectedStudentId));
    const ledgerRows = getLedgerRows();

    if (type === 'excel') {
      const data = ledgerRows.map(row => ({
        Date: row.date,
        Description: row.description,
        Debit: row.debit,
        Credit: row.credit,
        Balance: row.balance
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Statement");
      XLSX.writeFile(wb, `Statement_${student.name}.xlsx`);
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      drawStatementPDF(doc, student, ledgerRows);
      doc.save(`Statement_${student.name}.pdf`);
    }
  };

  const handleExport = (type, mode) => {
    let sourceData = [];
    if (mode === 'admission' || mode === 'students') sourceData = students;
    else if (mode === 'courses') sourceData = coursesList;
    else sourceData = (mode === 'receipts' || activeTab === "paid") ? recentPayments : pendingList;

    const filtered = sourceData.filter(item => {
      const name = (item.student_name || item.name || item.title || "").toLowerCase();
      const course = item.course_name || item.courseName || "";
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      const matchesCourse = courseFilter === "all" || course === courseFilter;
      return matchesSearch && matchesCourse;
    });

    if (filtered.length === 0) { alert("No data to export!"); return; }

    if (type === 'excel') {
      const data = filtered.map(item => ({ 
          Name: item.student_name || item.name || item.title, 
          Course: item.course_name || item.courseName || "N/A", 
          Amount: item.amount || item.pending_amount || item.price || 0,
          Date: item.payment_date || item.date || item.last_check || "N/A"
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${mode}_Report.xlsx`);
    } else {
      const doc = new jsPDF();
      if (mode === 'receipts' || (mode === 'payment' && activeTab === 'paid')) {
        filtered.forEach((payment, index) => {
            if (index !== 0) doc.addPage();
            drawProfessionalReceipt(doc, payment);
        });
        doc.save(`Bulk_Receipts_${courseFilter}.pdf`);
      } else if (mode === 'admission') {
        alert("Generating PDFs with images...");
        const generateBulk = async () => {
            for(let i = 0; i < filtered.length; i++) {
                if (i !== 0) doc.addPage();
                await drawAdmissionForm(doc, filtered[i]);
            }
            doc.save(`Admission_Forms_${courseFilter}.pdf`);
        };
        generateBulk();
      } else {
        doc.text(`${mode.toUpperCase()} REPORT`, 14, 15);
        autoTable(doc, { 
          startY: 20, 
          head: [['ID', 'NAME', 'COURSE', 'AMOUNT']], 
          body: filtered.map(item => [
            item.id || item.student_id || "#",
            item.student_name || item.name || item.title,
            item.course_name || item.courseName || "N/A",
            item.amount || item.pending_amount || item.price || "N/A"
          ])
        });
        doc.save(`${mode}_Report.pdf`);
      }
    }
  };

  if (isLoading) return <div className="edu-loader"><FaSyncAlt className="edu-spin" /> Syncing Data...</div>;

  // --- LEDGER LOGIC FOR TRANSACTION HISTORY ---
  const getStudentHistory = () => {
    if (!selectedStudentId) return [];
    return recentPayments
      .filter(p => String(p.student_id) === String(selectedStudentId))
      .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date)); 
  };

  const selectedStudentInfo = students.find(s => String(s.id) === String(selectedStudentId));
  
  // Calculate Running Balance for Ledger
  const getLedgerRows = () => {
    if(!selectedStudentInfo) return [];
    const courseInfo = coursesList.find(c => String(c.Id) === String(selectedStudentInfo.course) || c.title === selectedStudentInfo.course);
    const totalFee = courseInfo ? Number(courseInfo.price) : 0;
    
    const history = getStudentHistory();
    
    // 1. Opening Balance Row
    const rows = [{
      date: new Date(selectedStudentInfo.date).toLocaleDateString('en-GB'),
      description: "Course Fee (Opening Balance)",
      debit: 0, 
      credit: totalFee, 
      balance: totalFee,
      isHeader: true
    }];

    // 2. Payment Rows
    let runningBalance = totalFee;
    history.forEach(p => {
      runningBalance = runningBalance - Number(p.amount);
      rows.push({
        date: new Date(p.payment_date).toLocaleDateString('en-GB'),
        description: `Installment Received (Receipt #${p.payment_id})`,
        debit: Number(p.amount), 
        credit: 0,
        balance: runningBalance,
        isHeader: false
      });
    });

    return rows;
  };

  return (
    <div className="edu-reports-container">
      {/* MENU VIEW */}
      {viewMode === "menu" && (
        <div className="reports-main-menu">
          <div className="edu-reports-header">
            <h1>Reports Dashboard</h1>
            <p>Select a category to view reports</p>
          </div>
          <div className="edu-stats-grid">
            
            <div className="edu-card-static revenue" onClick={() => setViewMode("payment")} style={{ cursor: 'pointer' }}>
              <div className="edu-card-icon"><FaRupeeSign /></div>
              <div className="edu-card-info">
                <span>Payment</span><h3>Finance</h3>
                <span style={{ fontSize: '11px', color: '#4318FF', fontWeight: '600', marginTop: '5px', display: 'block' }}>View Details →</span>
              </div>
            </div>

            <div className="edu-card-static total" onClick={() => setViewMode("admission")} style={{ cursor: 'pointer' }}>
              <div className="edu-card-icon"><FaGraduationCap /></div>
              <div className="edu-card-info">
                <span>Admission</span><h3>Details</h3>
                <span style={{ fontSize: '11px', color: '#4318FF', fontWeight: '600', marginTop: '5px', display: 'block' }}>View Details →</span>
              </div>
            </div>

            <div className="edu-card-static pending" onClick={() => setViewMode("receipts")} style={{ cursor: 'pointer' }}>
              <div className="edu-card-icon"><FaReceipt /></div>
              <div className="edu-card-info">
                <span>Receipts</span><h3>Archive</h3>
                <span style={{ fontSize: '11px', color: '#4318FF', fontWeight: '600', marginTop: '5px', display: 'block' }}>View Details →</span>
              </div>
            </div>

            <div className="edu-card-static total" onClick={() => setViewMode("students")} style={{background: 'white', borderBottom: '4px solid #4318FF', cursor: 'pointer'}}>
              <div className="edu-card-icon" style={{background: '#4318FF', color: 'white'}}><FaUsers /></div>
              <div className="edu-card-info">
                <span style={{color: '#707EAE'}}>Students</span><h3 style={{color: '#1B2559'}}>Profiles</h3>
                <span style={{ fontSize: '11px', color: '#4318FF', fontWeight: '600', marginTop: '5px', display: 'block' }}>View Details →</span>
              </div>
            </div>

            <div className="edu-card-static revenue" onClick={() => setViewMode("courses")} style={{background: 'white', borderBottom: '4px solid #01B574', cursor: 'pointer'}}>
              <div className="edu-card-icon" style={{background: '#01B574', color: 'white'}}><FaBookOpen /></div>
              <div className="edu-card-info">
                <span style={{color: '#707EAE'}}>Courses</span><h3 style={{color: '#1B2559'}}>Catalog</h3>
                <span style={{ fontSize: '11px', color: '#01B574', fontWeight: '600', marginTop: '5px', display: 'block' }}>View Details →</span>
              </div>
            </div>

            {/* Transaction History Card */}
            <div className="edu-card-static pending" onClick={() => { setViewMode("transaction"); setSelectedStudentId(""); setSearchTerm(""); }} style={{background: 'white', borderBottom: '4px solid #f59e0b', cursor: 'pointer'}}>
              <div className="edu-card-icon" style={{background: '#f59e0b', color: 'white'}}><FaMoneyCheckAlt /></div>
              <div className="edu-card-info">
                <span style={{color: '#707EAE'}}>Transaction</span><h3 style={{color: '#1B2559'}}>History</h3>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600', marginTop: '5px', display: 'block' }}>View Details →</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC VIEW CONTENT */}
      {viewMode !== "menu" && (
        <div className="sap-content-fade">
            <div className="edu-reports-header">
              <button className="back-btn" onClick={() => {setViewMode("menu"); setTimeRange("all"); setSearchTerm(""); setSelectedStudentId("");}} style={{cursor: 'pointer', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '5px', color: '#4318FF', fontWeight: 'bold', marginBottom:'10px'}}><FaArrowLeft /> Back</button>
              <h1 style={{textTransform: 'capitalize'}}>{viewMode === "transaction" ? "Student Fee Statement" : viewMode + " Reports"}</h1>
            </div>

            {/* --- TRANSACTION HISTORY VIEW (NEW UI) --- */}
            {viewMode === "transaction" ? (
              <div className="transaction-layout" style={{display: 'flex', gap: '20px', height: 'calc(100vh - 150px)'}}>
                
                {/* LEFT COLUMN: STUDENT LIST */}
                <div className="student-list-panel" style={{flex: '0 0 300px', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
                  <div style={{padding: '15px', borderBottom: '1px solid #eee'}}>
                    <div style={{display: 'flex', alignItems: 'center', background: '#f5f7fa', borderRadius: '8px', padding: '8px 12px'}}>
                      <FaSearch style={{color: '#aaa', marginRight: '8px'}} />
                      <input 
                        type="text" 
                        placeholder="Search Student..." 
                        style={{border: 'none', background: 'transparent', width: '100%', outline: 'none'}} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="student-scroll-list" style={{overflowY: 'auto', flex: 1}}>
                    {students
                      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(s => (
                        <div 
                          key={s.id} 
                          className={`student-list-item ${selectedStudentId === s.id ? 'active' : ''}`} 
                          style={{
                            padding: '12px 15px', 
                            borderBottom: '1px solid #f0f0f0', 
                            cursor: 'pointer',
                            background: selectedStudentId === s.id ? '#eef2ff' : '#fff',
                            borderLeft: selectedStudentId === s.id ? '4px solid #4318FF' : '4px solid transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => setSelectedStudentId(s.id)}
                        >
                          <div>
                            <div style={{fontWeight: '600', color: '#333'}}>{s.name}</div>
                            <div style={{fontSize: '11px', color: '#888'}}>{s.courseName}</div>
                          </div>
                          <FaEye style={{color: selectedStudentId === s.id ? '#4318FF' : '#ccc'}} />
                        </div>
                      ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: STATEMENT VIEW */}
                <div className="statement-panel" style={{flex: 1, background: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px', overflowY: 'auto'}}>
                  
                  {selectedStudentId && selectedStudentInfo ? (
                    <>
                      {/* Statement Header */}
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
                        <div>
                          <h2 style={{margin: 0, color: '#333'}}>{selectedStudentInfo.name}</h2>
                          <p style={{margin: 0, color: '#666', fontSize: '13px'}}>Course: {selectedStudentInfo.courseName} | ID: #{selectedStudentInfo.id}</p>
                        </div>
                        <div className="export-actions" style={{display: 'flex', gap: '10px'}}>
                          <button className="edu-btn-export excel" onClick={() => handleTransactionExport('excel')}><FaFileExcel /> Excel</button>
                          <button className="edu-btn-export pdf" onClick={() => handleTransactionExport('pdf')}><FaFilePdf /> PDF</button>
                        </div>
                      </div>

                      {/* Ledger Table */}
                      <table className="edu-main-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                          <tr style={{background: '#f8f9fa'}}>
                            <th style={{padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb'}}>Date</th>
                            <th style={{padding: '10px', textAlign: 'left', borderBottom: '2px solid #e5e7eb'}}>Description</th>
                            <th style={{padding: '10px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', width: '100px'}}>Debit (Paid)</th>
                            <th style={{padding: '10px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', width: '100px'}}>Credit (Charge)</th>
                            <th style={{padding: '10px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', width: '100px'}}>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getLedgerRows().map((row, i) => (
                            <tr key={i} style={{background: row.isHeader ? '#fff8e1' : '#fff'}}>
                              <td style={{padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px'}}>{row.date}</td>
                              <td style={{padding: '10px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: row.isHeader ? 'bold' : 'normal'}}>{row.description}</td>
                              <td style={{padding: '10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', color: row.debit > 0 ? '#16a34a' : '#333', fontWeight: '500'}}>
                                {row.debit > 0 ? `₹${row.debit}` : '-'}
                              </td>
                              <td style={{padding: '10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', color: row.credit > 0 ? '#dc2626' : '#333', fontWeight: '500'}}>
                                {row.credit > 0 ? `₹${row.credit}` : '-'}
                              </td>
                              <td style={{padding: '10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 'bold', color: row.balance > 0 ? '#dc2626' : '#16a34a'}}>
                                ₹{row.balance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
                      <FaUsers style={{fontSize: '40px', marginBottom: '10px', opacity: 0.3}} />
                      <p>Select a student from the list to view their fee statement</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- EXISTING VIEWS LOGIC (Payment, Admission, etc.) ---
              <>
                <div className="sap-top-bar" style={{display:'flex', gap:'15px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center'}}>
                  <div className="edu-filter-pill" style={{display:'flex', alignItems:'center', background:'#fff', padding:'5px 15px', borderRadius:'8px', border:'1px solid #ddd', width: '250px'}}>
                    <FaSearch style={{marginRight:'10px', color:'#94a3b8'}} />
                    <input type="text" placeholder="Search..." style={{border:'none', outline:'none', width:'100%'}} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>

                  <div className="edu-filter-pill" style={{display:'flex', alignItems:'center', background:'#fff', padding:'5px 15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                    <FaCalendarAlt style={{marginRight:'10px', color:'#4318FF'}} />
                    <select className="edu-select-box" style={{border:'none', outline:'none'}} value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                      <option value="all">All Time</option>
                      <option value="weekly">This Week</option>
                      <option value="monthly">This Month</option>
                    </select>
                  </div>

                  {viewMode !== "courses" && (
                    <select className="edu-select-box" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                      <option value="all">All Courses</option>
                      {coursesList.map(c => <option key={c.Id} value={c.title}>{c.title}</option>)}
                    </select>
                  )}

                  <div className="edu-export-group" style={{marginLeft:'auto', display:'flex', gap:'10px'}}>
                    <button className="edu-btn-export excel" onClick={() => handleExport('excel', viewMode)}><FaFileExcel /> Excel</button>
                    <button className="edu-btn-export pdf" onClick={() => handleExport('pdf', viewMode)}><FaFilePdf /> PDF</button>
                  </div>
                </div>

                {viewMode === "payment" && (
                  <div className="edu-view-switcher" style={{marginBottom:'20px'}}>
                    <button className={`edu-tab-btn ${activeTab === 'paid' ? 'active-paid' : ''}`} onClick={() => setActiveTab('paid')}><FaHistory /> Paid History</button>
                    <button className={`edu-tab-btn ${activeTab === 'pending' ? 'active-pending' : ''}`} onClick={() => setActiveTab('pending')}><FaChartPie /> Pending List</button>
                  </div>
                )}

                <div className="edu-table-card">
                  <table className="edu-main-table">
                    <thead>
                      {viewMode === "students" ? (
                        <tr><th>ID</th><th>NAME</th><th>COURSE</th><th>CONTACT</th><th>EMAIL</th></tr>
                      ) : viewMode === "courses" ? (
                        <tr><th>ID</th><th>TITLE</th><th>INSTRUCTOR</th><th>DURATION</th><th>PRICE</th></tr>
                      ) : viewMode === "admission" ? (
                        <tr><th>ID</th><th>NAME</th><th>COURSE</th><th>DATE</th><th>FORM</th></tr>
                      ) : (
                        <tr><th>STUDENT</th><th>COURSE</th><th>AMOUNT</th><th>DATE/ACTION</th></tr>
                      )}
                    </thead>
                    <tbody>
                      {viewMode === "students" && students.filter(s => (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())).filter(s => courseFilter === "all" || s.courseName === courseFilter).map(s => (
                        <tr key={s.id}><td>#{s.id}</td><td className="txt-bold">{s.name}</td><td>{s.courseName}</td><td>{s.phone}</td><td>{s.email}</td></tr>
                      ))}

                      {viewMode === "courses" && coursesList.filter(c => (c.title || "").toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                        <tr key={c.Id}>
                          <td>#{c.Id}</td>
                          <td className="txt-bold">{c.title}</td>
                          <td><FaUserTie style={{marginRight:'5px', color:'#707EAE'}}/>{c.instructor_name || 'N/A'}</td>
                          <td><FaClock style={{marginRight:'5px', color:'#707EAE'}}/>{c.duration || 'N/A'}</td>
                          <td className="txt-bold">₹{c.price}</td>
                        </tr>
                      ))}

                      {(viewMode === "payment" || viewMode === "receipts") && 
                        (viewMode === "receipts" ? recentPayments : (activeTab === "paid" ? recentPayments : pendingList))
                        .filter(p => (p.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                        .filter(p => courseFilter === "all" || p.course_name === courseFilter)
                        .map((p, i) => (
                        <tr key={i}>
                          <td>{p.student_name}</td>
                          <td><span className="edu-tag">{p.course_name}</span></td>
                          <td className={viewMode === "receipts" || activeTab === "paid" ? "edu-amt-paid" : "edu-amt-pending"}>₹{p.amount || p.pending_amount}</td>
                          <td>
                            {viewMode === "receipts" ? (
                              <button className="edu-btn-export pdf" onClick={() => generateReceipt(p)}><FaFileInvoice /> Receipt</button>
                            ) : activeTab === "paid" ? (
                              new Date(p.payment_date).toLocaleDateString('en-GB')
                            ) : (
                              <button className="edu-wa-btn" onClick={() => window.open(`https://wa.me/${p.contact}`)}><FaWhatsapp /> Remind</button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {viewMode === "admission" && students.filter(s => (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())).filter(s => courseFilter === "all" || s.courseName === courseFilter).map(s => (
                        <tr key={s.id}>
                          <td>#{s.id}</td>
                          <td className="txt-bold">{s.name}</td>
                          <td>{s.courseName || "N/A"}</td>
                          <td>{new Date(s.date).toLocaleDateString('en-GB')}</td>
                          <td>
                            <button className="edu-btn-export pdf" style={{padding: '5px 10px'}} onClick={() => generateAdmissionForm(s)}>
                                <FaPrint /> Form
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
        </div>
      )}
    </div>
  );
};

export default Reports;