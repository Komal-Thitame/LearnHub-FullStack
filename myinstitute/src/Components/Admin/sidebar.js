import React from "react";
import { NavLink } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGraduationCap, faTimes, faHome, faBook, faChevronDown, 
  faEye, faEdit, faUsers, faQuestionCircle, faUserPlus, 
  faCreditCard, faIdCard, faChalkboardTeacher, faChartBar, 
  faWallet, faCertificate,  faBell, 
  faCog, faSignOutAlt 
} from "@fortawesome/free-solid-svg-icons";

import "./sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
    function handleDropdownClick(e) {
        e.stopPropagation();
        const parent = e.currentTarget.closest(".sidebar-item");
        parent.classList.toggle("active");
    }

    return (
        <aside className={`sidebar ${isOpen ? "active" : ""}`} id="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <FontAwesomeIcon icon={faGraduationCap} />
                    <span>EduMaster</span>
                </div>
                <button className="close-btn" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {/* --- Sabhi links ke aage /admin add kiya gaya hai --- */}
                
                <NavLink to="/admin" className="nav-item" end>
                    <FontAwesomeIcon icon={faHome} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/admin/analytics" className="nav-item">
                    <FontAwesomeIcon icon={faChartBar} />
                    <span>Analytics</span>
                </NavLink>

                {/* Courses Dropdown */}
                <li className="sidebar-item">
                    <div className="sidebar-link" onClick={handleDropdownClick}>
                        <div className="menu-left">
                            <FontAwesomeIcon icon={faBook} />
                            <span>Courses</span>
                        </div>
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    </div>
                    <ul className="sidebar-dropdown">
                        <li>
                            <NavLink to="/admin/courses/view">
                                <FontAwesomeIcon icon={faEye} />
                                <span>View Courses</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/courses/manage">
                                <FontAwesomeIcon icon={faEdit} />
                                <span>Manage Courses</span>
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Students Dropdown */}
                <li className="sidebar-item">
                    <div className="sidebar-link" onClick={handleDropdownClick}>
                        <div className="menu-left">
                            <FontAwesomeIcon icon={faUsers} />
                            <span>Students</span>
                        </div>
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    </div>
                    <ul className="sidebar-dropdown">
                        <li>
                            <NavLink to="/admin/students/enquiry">
                                <FontAwesomeIcon icon={faQuestionCircle} /> <span>Enquiry</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/students/admission">
                                <FontAwesomeIcon icon={faUserPlus} /> <span>Admission</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/students/payment">
                                <FontAwesomeIcon icon={faCreditCard} /> <span>Payment</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/students/details">
                                <FontAwesomeIcon icon={faIdCard} /> <span>Student Details</span>
                            </NavLink>
                        </li>
                    </ul>
                </li>

                <NavLink to="/admin/instructors" className="nav-item">
                    <FontAwesomeIcon icon={faChalkboardTeacher} />
                    <span>Instructors</span>
                </NavLink>

                <NavLink to="/admin/earnings" className="nav-item">
                    <FontAwesomeIcon icon={faWallet} />
                    <span>Earnings</span>
                </NavLink>
                 <NavLink to="/admin/Reports" className="nav-item">
                    <FontAwesomeIcon icon={faBell} />
                    <span>Reports</span>
                </NavLink>

                <NavLink to="/admin/certificates" className="nav-item">
                    <FontAwesomeIcon icon={faCertificate} />
                    <span>Certificates</span>
                </NavLink>

             

                <NavLink to="/admin/notifications" className="nav-item">
                    <FontAwesomeIcon icon={faBell} />
                    <span>Notifications</span>
                </NavLink>

                <NavLink to="/admin/settings" className="nav-item">
                    <FontAwesomeIcon icon={faCog} />
                    <span>Settings</span>
                </NavLink>

                <NavLink to="/admin/help" className="nav-item">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span>Help Center</span>
                </NavLink>

                <NavLink to="/admin/logout" className="nav-item logout">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;