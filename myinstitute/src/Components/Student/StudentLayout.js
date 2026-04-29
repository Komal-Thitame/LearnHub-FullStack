import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios"; // 1. Axios import kiya
import StudentSidebar from "./StudentSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch, faBars, faUserCircle, faCog, faSignOutAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./StudentLayout.css";
import Chatbot from "./Chatbot"; // ✅ Import Chatbot

const StudentLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [userName, setUserName] = useState("Guest");
    const [userPhoto, setUserPhoto] = useState(null); // 2. Photo ke liye state
    
    const navigate = useNavigate();

    // --- 3. UPDATED EFFECT: Database se latest data (photo & name) fetch karne ke liye ---
    useEffect(() => {
        const fetchUserData = async () => {
            const userEmail = localStorage.getItem("studentEmail");
            const cleanEmail = userEmail ? userEmail.replace(/['"]+/g, '') : null;

            if (cleanEmail) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/get-admission-status?email=${cleanEmail}`);
                    if (res.data.success) {
                        setUserName(res.data.name || "Guest");
                        setUserPhoto(res.data.photo || null); // DB se photo set hogi
                    }
                } catch (err) {
                    console.error("Header sync error:", err);
                }
            }
        };

        fetchUserData();
    }, []);

    // Workable Search: Ctrl + K shortcut focus
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.kh-search-box input');
                if(searchInput) searchInput.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="kh-app-container">
            <aside className={`kh-sidebar-wrapper ${isMenuOpen ? "kh-mobile-active" : ""}`}>
                <StudentSidebar closeMenu={() => setIsMenuOpen(false)} />
            </aside>

            <div className="kh-content-body">
                <header className="kh-top-nav">
                    <div className="kh-nav-left">
                        <button className="kh-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                        <div className="kh-brand-context">
                            <h1>Student Workspace</h1>
                            <p>Manage your journey & learning</p>
                        </div>
                    </div>

                    <div className="kh-nav-right">
                        <div className="kh-search-box">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search courses..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <FontAwesomeIcon icon={faTimes} className="clear-search" onClick={() => setSearchQuery("")} />
                            )}
                        </div>

                        <button className="kh-icon-btn">
                            <FontAwesomeIcon icon={faBell} />
                            <span className="kh-dot"></span>
                        </button>

                        <div className="kh-profile-section">
                            <div className="kh-user-pill" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div className="kh-user-info">
                                    <span className="kh-user-name">{userName}</span>
                                    <span className="kh-user-role">Verified Student</span>
                                </div>
                                
                                {/* --- 4. DYNAMIC PHOTO: Agar photo hai toh image dikhegi, nahi toh initial --- */}
                                <div className="kh-user-avatar">
                                    {userPhoto ? (
                                        <img src={userPhoto} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        userName.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>

                            {isProfileOpen && (
                                <>
                                    <div className="kh-dropdown-backdrop" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="kh-profile-menu">
                                        <div className="kh-menu-link" onClick={() => { navigate("/student/PersonalDetails"); setIsProfileOpen(false); }}>
                                            <FontAwesomeIcon icon={faUserCircle} /> Profile
                                        </div>
                                        <div className="kh-menu-link" onClick={() => { navigate("/settings"); setIsProfileOpen(false); }}>
                                            <FontAwesomeIcon icon={faCog} /> Settings
                                        </div>
                                        <div className="kh-menu-divider"></div>
                                        <div className="kh-menu-link kh-logout" onClick={handleLogout}>
                                            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="kh-main-view">
                    <Outlet />
                </main>
            </div>
                  <Chatbot />

            {isMenuOpen && <div className="kh-mobile-mask" onClick={() => setIsMenuOpen(false)}></div>}
        </div>
    );
};

export default StudentLayout;