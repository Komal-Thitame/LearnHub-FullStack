import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf"; // PDF generation ke liye
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faDownload, faVideo, faChartBar, 
    faCheckCircle, faExternalLinkAlt, faClock
} from "@fortawesome/free-solid-svg-icons";
import "./StudentDashboard.css";

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const studentEmail = localStorage.getItem("studentEmail") || "thitamekomal@gmail.com"; 

    const fetchEnrolledCourses = useCallback(async () => {
        if (!studentEmail) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/enrolled-courses?email=${studentEmail}`);
            if (Array.isArray(res.data)) {
                setCourses(res.data);
            }
        } catch (err) {
            console.error("Error fetching enrolled courses:", err);
        } finally {
            setLoading(false);
        }
    }, [studentEmail]);

    useEffect(() => {
        fetchEnrolledCourses();
    }, [fetchEnrolledCourses]);

    // --- PDF DOWNLOAD LOGIC ---
    const handleDownloadPDF = (contentData, courseName, instructor) => {
        if (!contentData || contentData === "NULL" || contentData.trim() === "") {
            alert(`Syllabus for "${courseName}" is not available yet.`);
            return;
        }

        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();

            // --- PDF Header Design ---
            doc.setFillColor(67, 24, 255); // Dark Blue Theme
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text("COURSE SYLLABUS", 105, 20, { align: "center" });
            
            doc.setFontSize(12);
            doc.text("EduMaster Learning Management System", 105, 30, { align: "center" });

            // --- Course Details ---
            doc.setTextColor(40, 40, 40);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(`Course: ${courseName}`, 20, 55);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text(`Instructor: ${instructor || "Not Assigned"}`, 20, 65);
            doc.text(`Date of Download: ${date}`, 20, 72);

            // --- Syllabus Content ---
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 80, 190, 80); // Horizontal Line

            doc.setFont("helvetica", "bold");
            doc.text("Detailed Topics:", 20, 90);

            doc.setFont("helvetica", "normal");
            const splitContent = doc.splitTextToSize(contentData, 170); // Auto Wrap Text
            doc.text(splitContent, 20, 100);

            // --- Footer ---
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("This is an electronically generated syllabus by EduMaster Portal.", 105, 285, { align: "center" });

            // Save the PDF
            doc.save(`${courseName.replace(/\s+/g, '_')}_Syllabus.pdf`);
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("Error creating PDF. Please try again.");
        }
    };

    const handleAction = (msg) => {
        alert(msg);
    };

    return (
        <div className="std-dash-wrapper">
            <header className="std-dash-header">
                <div className="header-info">
                    <h1>Student Learning Portal</h1>
                    <p>Welcome back! Track your progress and access your materials below.</p>
                </div>
            </header>

            <div className="std-action-grid">
                {courses.length > 0 ? (
                    courses.map((course, index) => (
                        <div key={course.id || index} className="std-glass-card">
                            <div className="card-top">
                                <span className="label-blue">ENROLLED COURSE</span>
                                <FontAwesomeIcon icon={faClock} className="icon-muted" />
                            </div>
                            <h3>{course.course_name}</h3>
                            <p className="topic-text">Instructor: {course.instructor || "To be assigned"}</p>
                            <div className="card-actions">
                                <button 
                                    className="btn-outline-blue" 
                                    onClick={() => handleDownloadPDF(course.content, course.course_name, course.instructor)}
                                >
                                    <FontAwesomeIcon icon={faDownload} /> Download Syllabus (PDF)
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="std-glass-card">
                        <p>{loading ? "Loading courses..." : "No active courses found."}</p>
                    </div>
                )}
            </div>

            <div className="std-bottom-section">
                <div className="std-table-card">
                    <div className="table-header-row">
                        <h2>Enrolled Courses Overview</h2>
                        <button className="btn-text-link" onClick={fetchEnrolledCourses}>
                            {loading ? "Refreshing..." : "Refresh List"}
                        </button>
                    </div>
                    <div className="table-container">
                        <table className="std-table">
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Course Name</th>
                                    <th>Instructor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length > 0 ? (
                                    courses.map((course, index) => (
                                        <tr key={course.id || index}>
                                            <td>#{index + 1}</td>
                                            <td><strong>{course.course_name}</strong></td>
                                            <td>{course.instructor || "To be assigned"}</td>
                                            <td>
                                                <span className={`status-tag ${(course.status || 'Active').toLowerCase()}`}>
                                                    {course.status || "Active"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table-msg">
                                            {loading ? "Fetching your data..." : "No active enrollments found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className="std-resources-card">
                    <h3>Quick Resources</h3>
                    <ul className="resource-list">
                        <li onClick={() => handleAction("Opening Handbook...")}>
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="res-icon" /> Student Handbook
                        </li>
                        <li onClick={() => handleAction("Viewing Roadmap...")}>
                            <FontAwesomeIcon icon={faChartBar} className="res-icon" /> Learning Roadmap
                        </li>
                        <li onClick={() => handleAction("Joining Community...")}>
                            <FontAwesomeIcon icon={faCheckCircle} className="res-icon" /> Community Forum
                        </li>
                        <li onClick={() => handleAction("Opening Lectures...")}>
                            <FontAwesomeIcon icon={faVideo} className="res-icon" /> Recorded Sessions
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default StudentDashboard;