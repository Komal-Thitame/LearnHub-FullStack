import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faArrowLeft, faEnvelope, faUser, 
    faIdBadge, faCamera, faCheckCircle 
} from "@fortawesome/free-solid-svg-icons";
import "./dashbord.css"; 

function ProfilePage() {
    const navigate = useNavigate();
    
    // States
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState({
        name: "",
        email: "",
        role: "Super Admin",
        joined: "12 March 2026",
        phone: ""
    });
    const [image, setImage] = useState("https://via.placeholder.com/150");

    // 1. Fetch Profile Data on Load
    useEffect(() => {
        const fetchProfile = async () => {
            const adminEmail = localStorage.getItem("adminEmail");
            if (!adminEmail) {
                alert("Session expired. Please login again!");
                navigate("/login");
                return;
            }

            try {
                const res = await axios.get(`http://localhost:5000/admin-profile/${adminEmail}`);
                if (res.data) {
                    setAdmin({
                        name: res.data.full_name || "Admin",
                        email: res.data.email,
                        role: "Super Admin",
                        joined: "12 March 2026",
                        phone: res.data.phone || "+91 9876543210"
                    });
                    if (res.data.admin_photo) {
                        setImage(res.data.admin_photo);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setAdmin({ ...admin, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 2. Save Data to Database
    const handleSave = async () => {
        try {
            const payload = {
                full_name: admin.name,
                email: admin.email,
                admin_photo: image,
                phone: admin.phone 
            };

            const res = await axios.post("http://localhost:5000/admin-update", payload);
            
            if (res.data.success) {
                setIsEditing(false);
                alert("Profile Updated Successfully! ✅");
            } else {
                alert("Failed to update: " + res.data.message);
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert("Backend Error! Please try again.");
        }
    };

    if (loading) return <div className="loader">Loading Profile...</div>;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">
                {/* BACK BUTTON - navigate(-1) will take you to the PREVIOUS page */}
                <div className="back-btn-wrapper">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                    </button>
                </div>

                <div className="profile-card-main">
                    <div className="profile-header-bg"></div>
                    <div className="profile-info-content">
                        <div className="profile-img-wrapper">
                            <img 
                                src={image} 
                                alt="Admin" 
                                className="profile-img-large"
                            />
                            {isEditing && (
                                <label className="camera-overlay">
                                    <FontAwesomeIcon icon={faCamera} />
                                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </div>

                        {isEditing ? (
                            <input 
                                type="text" 
                                name="name" 
                                className="edit-input-name" 
                                value={admin.name} 
                                onChange={handleChange} 
                            />
                        ) : (
                            <h2>{admin.name}</h2>
                        )}
                        
                        <span className="role-tag">{admin.role}</span>

                        <div className="details-list">
                            <div className="detail-item">
                                <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
                                <div>
                                    <label>Email Address</label>
                                    <p>{admin.email}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <FontAwesomeIcon icon={faUser} className="detail-icon" />
                                <div>
                                    <label>Phone Number</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            name="phone" 
                                            className="edit-input-field"
                                            value={admin.phone} 
                                            onChange={handleChange} 
                                        />
                                    ) : (
                                        <p>{admin.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="detail-item">
                                <FontAwesomeIcon icon={faIdBadge} className="detail-icon" />
                                <div>
                                    <label>Member Since</label>
                                    <p>{admin.joined}</p>
                                </div>
                            </div>
                        </div>
                        
                        {isEditing ? (
                            <button className="save-btn" onClick={handleSave}>
                                <FontAwesomeIcon icon={faCheckCircle} /> Save Information
                            </button>
                        ) : (
                            <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                Edit Profile Information
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;