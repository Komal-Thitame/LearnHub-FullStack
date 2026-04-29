import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faFileInvoice, faUser, faGraduationCap, 
    faSpinner, faPrint, faCheckCircle, faEye, faArrowLeft, faDownload
} from "@fortawesome/free-solid-svg-icons";
import "./ViewSubmittedForm.css";

// --- HELPER FUNCTION TO LOAD IMAGE ---
const toDataURL = async (url) => {
    try {
        if (!url) return null;
        // If already base64
        if (url.startsWith('data:')) return url; 
        
        // Clean path
        let cleanPath = url.replace(/\\/g, '/');
        let fullPath = cleanPath;
        
        // Construct URL if relative path
        if (!cleanPath.startsWith('http')) {
            if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
            fullPath = `http://localhost:5000/${cleanPath}`;
        }

        const response = await fetch(fullPath);
        if (!response.ok) return null; // Image not found
        
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

const ViewSubmittedForm = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null); 
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const email = localStorage.getItem("studentEmail");
            try {
                // Fetch Profile (Should contain 'photo' field from DB)
                const profileRes = await axios.get(`http://localhost:5000/api/get-admission-status?email=${email}`);
                setStudentProfile(profileRes.data);

                // Fetch Enrolled Courses
                const enrollRes = await axios.get(`http://localhost:5000/api/enrolled-courses?email=${email}`);
                setEnrolledCourses(enrollRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- FUNCTION: Generate Admission Form PDF (WITH PHOTO) ---
    const generateAdmissionFormPDF = async (course) => {
        if (!studentProfile) {
            alert("Student profile not loaded.");
            return;
        }

        const doc = new jsPDF();
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
        doc.text("Software Development Training & Institute", pageWidth / 2, y, { align: "center" });
        
        y += 5;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Address: In Front of PVP Senior College, Loni Kh | Contact: +91 1234567890", pageWidth / 2, y, { align: "center" });

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
        doc.text(`Registration No: ${studentProfile.id || "N/A"}`, margin, y);
        doc.text(`Date: ${new Date(studentProfile.date || Date.now()).toLocaleDateString('en-GB')}`, pageWidth - margin, y, { align: "right" });
        
        y += 12; 

        // 4. PHOTO BOX LOGIC
        const photoSize = 35;
        const photoX = pageWidth - margin - photoSize;
        
        // Draw Photo Box
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(255, 255, 255);
        doc.rect(photoX, y, photoSize, 40, "FD"); // Filled with white, Draw border
        
        // Default Placeholder Text
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text("PASSPORT SIZE", photoX + photoSize/2, y + 15, { align: "center" });
        doc.text("PHOTO", photoX + photoSize/2, y + 22, { align: "center" });

        // --- ✅ LOAD AND INSERT ACTUAL PHOTO ---
        if (studentProfile.photo) {
            try {
                const imgData = await toDataURL(studentProfile.photo);
                if (imgData) {
                    // Add image inside the box (x+1, y+1 to leave border)
                    doc.addImage(imgData, 'JPEG', photoX + 1, y + 1, photoSize - 2, 38);
                }
            } catch(e) {
                console.log("Error adding photo to PDF", e);
            }
        }

        // 5. PERSONAL DETAILS
        const colWidth = (photoX - margin) - 15; 
        
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text("1. PERSONAL DETAILS", margin, y);
        
        y += 8;

        const drawField = (label, value, x) => {
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont("helvetica", "bold");
            doc.text(label, x, y);
            
            const labelWidth = doc.getTextWidth(label) + 2;
            
            doc.setTextColor(30, 30, 30);
            doc.setFont("helvetica", "normal");
            doc.text(String(value || "N/A"), x + labelWidth, y);
        };

        drawField("Name: ", studentProfile.name, margin);
        y += 10; 
        
        const halfCol = colWidth / 2;
        drawField("DOB: ", studentProfile.dob ? new Date(studentProfile.dob).toLocaleDateString('en-GB') : "N/A", margin);
        drawField("Gender: ", studentProfile.gender, margin + halfCol + 10);
        
        // Give space for photo height
        y += 30; 

        // 6. CONTACT DETAILS
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("2. CONTACT DETAILS", margin, y);
        y += 8;

        drawField("Address: ", studentProfile.address, margin);
        y += 10;
        
        const thirdCol = contentWidth / 3;
        drawField("City: ", studentProfile.city, margin);
        drawField("Phone: ", studentProfile.phone, margin + thirdCol + 10);
        drawField("Email: ", studentProfile.email, margin + 2*thirdCol + 20);
        y += 15;

        // 7. COURSE DETAILS
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("3. COURSE DETAILS", margin, y);
        y += 8;
        
        drawField("Course Applied: ", course.course_name, margin);
        y += 10;
        drawField("Instructor: ", course.instructor, margin);
        y += 10;
        
        // Status Logic
        const statusVal = course.status || "Active";
        const statusColor = statusVal === 'Active' ? [34, 197, 94] : [239, 68, 68];
        
        drawField("Status: ", "", margin); // Label only
        
        // Draw Status Badge
        doc.setFillColor(...statusColor);
        doc.roundedRect(margin + 25, y - 4, 25, 6, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(statusVal.toUpperCase(), margin + 37.5, y, { align: "center" });

        y += 20; 

        // 8. SIGNATURES
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text("Student Signature", margin, y);
        doc.line(margin, y + 2, margin + 60, y + 2);
        
        doc.text("Parent/Guardian Signature", pageWidth - margin - 60, y);
        doc.line(pageWidth - margin - 60, y + 2, pageWidth - margin, y + 2);

        // Save PDF
        doc.save(`Admission_Form_${studentProfile.name}.pdf`);
    };

    if (loading) return <div className="loader-box"><FontAwesomeIcon icon={faSpinner} spin size="3x" /></div>;

    // --- VIEW 1: DETAILED VIEW (On Screen) ---
    if (selectedCourse) {
        return (
            <div className="vfs-container">
                <div className="vfs-action-bar vfs-no-print">
                    <button className="vfs-btn-back" onClick={() => setSelectedCourse(null)}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Back to List
                    </button>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button className="vfs-btn-print" onClick={() => window.print()}>
                            <FontAwesomeIcon icon={faPrint} /> Print Letter
                        </button>
                        <button 
                            className="vfs-btn-print" 
                            style={{background: '#4318FF'}}
                            onClick={() => generateAdmissionFormPDF(selectedCourse)}
                        >
                            <FontAwesomeIcon icon={faDownload} /> Download Form
                        </button>
                    </div>
                </div>

                <div className="vfs-receipt-card">
                    <div className="vfs-receipt-header">
                        <div className="vfs-brand-info">
                            <h1>SMART LEARNHUB</h1>
                            <p style={{color: '#a3aed0', fontSize: '14px', marginTop: '4px'}}>Academic Year 2026-27 | Admission Receipt</p>
                        </div>
                        <div className="vfs-status-tag">
                            <FontAwesomeIcon icon={faCheckCircle} /> {selectedCourse.status}
                        </div>
                    </div>

                    <div className="vfs-receipt-content">
                        <div className="vfs-info-block">
                            <h4 className="vfs-block-title"><FontAwesomeIcon icon={faUser} /> Personal Details</h4>
                            <div className="vfs-details-grid">
                                <div className="vfs-detail-item"><label>Application ID:</label> <span>#{selectedCourse.id}</span></div>
                                <div className="vfs-detail-item"><label>Full Name:</label> <span>{studentProfile?.name}</span></div>
                                <div className="vfs-detail-item"><label>Email Address:</label> <span>{studentProfile?.email}</span></div>
                                <div className="vfs-detail-item"><label>Phone Number:</label> <span>{studentProfile?.phone || "N/A"}</span></div>
                                <div className="vfs-detail-item vfs-full"><label>Location:</label> <span>{studentProfile?.address}, {studentProfile?.city}</span></div>
                            </div>
                        </div>

                        <hr className="vfs-divider" />

                        <div className="vfs-info-block">
                            <h4 className="vfs-block-title"><FontAwesomeIcon icon={faGraduationCap} /> Enrollment Details</h4>
                            <div className="vfs-details-grid">
                                <div className="vfs-detail-item"><label>Course Name:</label> <span className="vfs-highlight-text">{selectedCourse.course_name}</span></div>
                                <div className="vfs-detail-item"><label>Instructor:</label> <span>{selectedCourse.instructor}</span></div>
                                <div className="vfs-detail-item"><label>Batch Type:</label> <span>Regular Online</span></div>
                                <div className="vfs-detail-item"><label>Enrollment Date:</label> <span>{selectedCourse.enrolled_date || "08-04-2026"}</span></div>
                            </div>
                        </div>

                        <div className="vfs-receipt-footer">
                            <p style={{fontStyle: 'italic', fontSize: '12px', color: '#a3aed0'}}>* This is a verified electronic receipt for your admission in {selectedCourse.course_name}.</p>
                            <div className="vfs-signature-box">
                                <div className="vfs-sig-line"></div>
                                <p style={{fontSize: '14px', fontWeight: '700', color: '#1b2559'}}>Head of Admissions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: MAIN LIST VIEW ---
    return (
        <div className="vfs-container">
            <div className="vfs-list-header">
                <h2><FontAwesomeIcon icon={faFileInvoice} /> My Applications</h2>
                <p style={{color: '#a3aed0'}}>Manage and view your course admission receipts.</p>
            </div>

            <div className="vfs-list-card">
                <table className="vfs-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Course Name</th>
                            <th>Instructor</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrolledCourses.length > 0 ? enrolledCourses.map((course) => (
                            <tr key={course.id}>
                                <td>#{course.id}</td>
                                <td className="vfs-course-cell">{course.course_name}</td>
                                <td>{course.instructor}</td>
                                <td><span className="vfs-status-pill active">{course.status}</span></td>
                                <td>
                                    <button 
                                        className="vfs-view-btn" 
                                        style={{marginRight: '5px', background: '#4318FF', color: '#fff'}}
                                        onClick={() => generateAdmissionFormPDF(course)}
                                    >
                                        <FontAwesomeIcon icon={faDownload} /> Form
                                    </button>
                                    
                                    <button className="vfs-view-btn" onClick={() => setSelectedCourse(course)}>
                                        <FontAwesomeIcon icon={faEye} /> View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No Applications Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewSubmittedForm;