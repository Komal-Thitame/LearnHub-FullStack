import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUserEdit, faEnvelope, faPhone, faMapMarkerAlt, 
    faGraduationCap, faShieldAlt, faCamera 
} from "@fortawesome/free-solid-svg-icons";
import "./MyProfile.css";

const MyProfile = () => {
    const [user] = useState({
        name: "Komal Thitame",
        role: "Verified Student",
        email: "komal.t@learnhub.com",
        phone: "+91 98765 43210",
        address: "Pune, Maharashtra, India",
        joined: "January 2026",
        course: "Full Stack Web Development",
        studentId: "SLH-2026-089"
    });

    return (
        <div className="profile-page-container">
            {/* Top Header Card */}
            <div className="profile-header-card">
                <div className="profile-cover"></div>
                <div className="profile-info-main">
                    <div className="profile-avatar-wrapper">
                        <img 
                            src="https://ui-avatars.com/api/?name=Komal+Thitame&background=6366f1&color=fff&size=128" 
                            alt="User Profile" 
                        />
                        <button className="edit-avatar-btn">
                            <FontAwesomeIcon icon={faCamera} />
                        </button>
                    </div>
                    <div className="profile-names">
                        <h1>{user.name}</h1>
                        <span className="badge-verified">{user.role}</span>
                    </div>
                    <button className="btn-edit-profile">
                        <FontAwesomeIcon icon={faUserEdit} /> Edit Profile
                    </button>
                </div>
            </div>

            <div className="profile-grid">
                {/* Left Column: Contact & Personal */}
                <div className="profile-card">
                    <h3>Personal Information</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                            <div>
                                <label>Email Address</label>
                                <p>{user.email}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <FontAwesomeIcon icon={faPhone} className="info-icon" />
                            <div>
                                <label>Phone Number</label>
                                <p>{user.phone}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="info-icon" />
                            <div>
                                <label>Location</label>
                                <p>{user.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Academic & Security */}
                <div className="profile-card">
                    <h3>Academic Details</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <FontAwesomeIcon icon={faGraduationCap} className="info-icon" />
                            <div>
                                <label>Enrolled Course</label>
                                <p>{user.course}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <FontAwesomeIcon icon={faShieldAlt} className="info-icon" />
                            <div>
                                <label>Student ID</label>
                                <p><strong>{user.studentId}</strong></p>
                            </div>
                        </div>
                        <div className="info-item">
                            <FontAwesomeIcon icon={faShieldAlt} className="info-icon" style={{color: '#10b981'}} />
                            <div>
                                <label>Member Since</label>
                                <p>{user.joined}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;