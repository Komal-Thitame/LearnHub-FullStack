import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faColumns, faFileSignature, faSearchPlus, 
   faSignOutAlt, faGraduationCap, faAddressCard ,faFileInvoice
} from "@fortawesome/free-solid-svg-icons";
import SignOut from "./SignOut"; // Modal component import karein
import "./StudentNav.css";

const StudentSidebar = ({ closeMenu }) => {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    // Logout function jo modal confirm hone par chalega
    const handleLogoutConfirm = () => {
        localStorage.clear(); 
        sessionStorage.clear();
        navigate("/login"); // User ko login page par bhej dein
    };

    return (
        <>
            <aside className="modern-std-sidebar">
                {/* --- 1. BRAND LOGO SECTION --- */}
                <div className="sidebar-brand-area">
                    <div className="brand-logo-circle">
                        <FontAwesomeIcon icon={faGraduationCap} />
                    </div>
                    <div className="brand-texts">
                        <span className="main-logo-text">Smart LearnHub</span>
                        <span className="sub-logo-text">STUDENT PORTAL</span>
                    </div>
                </div>

                {/* --- 2. NAVIGATION MENU --- */}
                <nav className="sidebar-navigation">
                    <div className="nav-section">
                        <span className="section-title">Main Menu</span>
                        
                        <NavLink to="/student" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                            <FontAwesomeIcon icon={faColumns} className="nav-icon" />
                            <span>Dashboard Overview</span>
                        </NavLink>

                        <NavLink to="/student/PersonalDetails" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                            <FontAwesomeIcon icon={faAddressCard} className="nav-icon" />
                            <span>Personal Details</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <span className="section-title">Administration</span>

                        <NavLink to="/student/AdmissionForm" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                            <FontAwesomeIcon icon={faFileSignature} className="nav-icon" />
                            <span> New Admission</span>
                        </NavLink>
                        <NavLink to="/student/StudentReceipts" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                            <FontAwesomeIcon icon={faFileInvoice} className="nav-icon" />
                            <span>My Receipts</span>
                        </NavLink>
                        <NavLink to="/student/ViewSubmittedForm" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={closeMenu}>
                            <FontAwesomeIcon icon={faSearchPlus} className="nav-icon" />
                            <span>View Submitted Form</span>
                        </NavLink>

                        
                    </div>
                </nav>

                {/* --- 3. SIGN OUT FOOTER --- */}
                <div className="sidebar-footer-action">
                    {/* Link ki jagah button use karna better practice hai functions ke liye */}
                    <button className="logout-button" onClick={() => setIsLogoutModalOpen(true)}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Popup */}
            <SignOut 
                isOpen={isLogoutModalOpen} 
                onClose={() => setIsLogoutModalOpen(false)} 
                onConfirm={handleLogoutConfirm} 
            />
        </>
    );
};

export default StudentSidebar;