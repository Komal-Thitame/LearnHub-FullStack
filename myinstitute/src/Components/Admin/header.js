import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from 'axios'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faBars, faSearch, faChevronDown, faUser, faCog, faSignOutAlt, faLink 
} from "@fortawesome/free-solid-svg-icons";

function Header({ toggleSidebar }) { 
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(""); 
    const [searchResults, setSearchResults] = useState([]); 
    const [adminName, setAdminName] = useState("Admin User"); 
    const [adminPhoto, setAdminPhoto] = useState(""); 
    
    const profileRef = useRef(null); 
    const searchRef = useRef(null);

    // --- Memoized Fetch function taaki baar baar recreate na ho ---
    const fetchAdminData = useCallback(async () => {
        const adminEmail = localStorage.getItem("adminEmail"); 
        
        if (!adminEmail) return; 

        try {
            // URL check karein: admins table se data lane wala API
            const res = await axios.get(`http://localhost:5000/admin-profile/${adminEmail}`);
            if (res.data) {
                // Sahi mapping: DB column 'full_name' hai
                setAdminName(res.data.full_name || "Admin User"); 
                setAdminPhoto(res.data.admin_photo || ""); 
            }
        } catch (err) {
            console.log("Header sync error:", err);
        }
    }, []);

    useEffect(() => {
        // Initial load
        fetchAdminData();

        // Settings page se aane wale signal ko listen karna
        const handleSettingsChange = () => {
            fetchAdminData();
        };

        window.addEventListener("settingsChanged", handleSettingsChange);
        
        return () => {
            window.removeEventListener("settingsChanged", handleSettingsChange);
        };
    }, [fetchAdminData]);

    const menuItems = [
        { title: "Dashboard", path: "/admin" },
        { title: "View Courses", path: "/admin/courses/view" },
        { title: "Manage Courses", path: "/admin/courses/manage" },
        { title: "Admission", path: "/admin/students/admission" },
        { title: "Student Details", path: "/admin/students/details" },
        { title: "Payments", path: "/admin/students/payment" },
        { title: "Instructors", path: "/admin/instructors" },
        { title: "My Profile", path: "/admin/profile" },
        { title: "Settings", path: "/admin/settings" }
    ];

    const handleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.trim() !== "") {
            const filtered = menuItems.filter(item => 
                item.title.toLowerCase().includes(value.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const handleAction = (e, path) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(path); 
        setOpenDropdown(null); 
        setSearchTerm(""); 
        setSearchResults([]);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("adminEmail"); 
        localStorage.removeItem("isAuth");
        localStorage.removeItem("userRole");
        setOpenDropdown(null);
        navigate("/admin/logout"); 
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target) &&
                searchRef.current && !searchRef.current.contains(e.target)) {
                setOpenDropdown(null);
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="top-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <div className="breadcrumb">
                    {/* First Name split logic update kiya hai fallback ke sath */}
                    <h1>Welcome back, {(adminName || "User").split(' ')[0]}! 👋</h1>
                    <p>Here's what's happening today.</p>
                </div>
            </div>

            <div className="header-right">
                <div className="search-container" ref={searchRef}>
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {searchResults.length > 0 && (
                        <ul className="search-results-dropdown">
                            {searchResults.map((item, index) => (
                                <li key={index} onMouseDown={(e) => handleAction(e, item.path)}>
                                    <FontAwesomeIcon icon={faLink} className="res-icon" /> {item.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="header-actions">
                    <div className="admin-profile" onClick={() => handleDropdown('profile')} ref={profileRef}>
                        {adminPhoto ? (
                            <img 
                                src={adminPhoto} 
                                alt="Admin" 
                                style={{
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '2px solid #e2e8f0'
                                }} 
                            />
                        ) : (
                            <div className="default-avatar-circle" style={{
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: '#4e73df', 
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="profile-info">
                            <span className="profile-name">{adminName}</span>
                            <span className="profile-role">Admin Panel</span>
                        </div>
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`profile-arrow ${openDropdown === 'profile' ? 'rotate' : ''}`} 
                        />
                        
                        {openDropdown === 'profile' && (
                            <ul className="profile-dropdown-list">
                                <li onMouseDown={(e) => handleAction(e, "/admin/profile")}>
                                    <FontAwesomeIcon icon={faUser} className="dropdown-icon" /> My Profile
                                </li>
                                <li onMouseDown={(e) => handleAction(e, "/admin/settings")}>
                                    <FontAwesomeIcon icon={faCog} className="dropdown-icon" /> Settings
                                </li>
                                <hr />
                                <li 
                                    onMouseDown={(e) => handleLogout(e)} 
                                    style={{color: '#e74c3c', fontWeight: 'bold'}}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" /> Logout
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;