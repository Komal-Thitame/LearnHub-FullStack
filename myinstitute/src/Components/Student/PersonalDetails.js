import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, faEnvelope, faPhone, faMapMarkerAlt, 
    faCamera, faSave,  faUserEdit, faIdCard,
    faInfoCircle, faAddressCard
} from "@fortawesome/free-solid-svg-icons";
import "./PersonalDetails.css";

const PersonalDetails = () => {
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        phone: "",
        city: ""
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const userEmail = localStorage.getItem("studentEmail");
    
    const defaultAvatar = `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=6366f1&color=fff&size=128`;
    const [previewUrl, setPreviewUrl] = useState(defaultAvatar);

    useEffect(() => {
        const cleanEmail = userEmail ? userEmail.replace(/['"]+/g, '') : null;
        const fetchProfile = async () => {
            if (!cleanEmail) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/get-admission-status?email=${cleanEmail}`);
                if (res.data.success) {
                    setFormData({
                        id: res.data.id || "N/A",
                        name: res.data.name || "",
                        email: res.data.email || cleanEmail,
                        phone: res.data.phone || "",
                        city: res.data.city || ""
                    });
                    if (res.data.photo) setPreviewUrl(res.data.photo);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userEmail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too large! Please upload under 2MB.");
                return;
            }
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const cleanEmail = userEmail ? userEmail.replace(/['"]+/g, '') : null;
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", cleanEmail);
        data.append("phone", formData.phone);
        data.append("city", formData.city);
        if (photoFile) data.append("photo", photoFile);

        try {
            const res = await axios.put(`http://localhost:5000/api/update-profile`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if(res.data.success) {
                alert("Profile Updated Successfully!");
                window.location.reload(); 
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update profile.");
        }
    };

    if (loading) return <div className="loader">Loading Profile...</div>;

    return (
        <div className="pd-container">
            {/* Header Section */}
            <header className="pd-header">
                <div className="header-content">
                    <h1><FontAwesomeIcon icon={faUserEdit} /> Profile Settings</h1>
                    <p>Update your personal information and profile picture.</p>
                </div>
            </header>

            <form className="pd-form-wrapper" onSubmit={handleSave}>
                
                {/* 1. Hero Banner Card (Profile Photo & Name) */}
                <div className="pd-card pd-hero-card">
                    <div className="profile-upload-section">
                        <div className="avatar-wrapper">
                            <img 
                                src={previewUrl} 
                                alt="Profile" 
                                onError={(e) => { e.target.src = defaultAvatar; }} 
                            />
                            <label className="upload-btn" title="Change Photo">
                                <FontAwesomeIcon icon={faCamera} />
                                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <div className="profile-identity">
                            <h2>{formData.name || "Student Name"}</h2>
                            <span className="id-badge"><FontAwesomeIcon icon={faIdCard} /> ID: {formData.id}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Form Content Grid */}
                <div className="pd-main-grid">
                    
                    {/* Left Column: Personal Information */}
                    <div className="pd-card">
                        <div className="card-header">
                            <h3><FontAwesomeIcon icon={faInfoCircle} /> Personal Info</h3>
                        </div>
                        <div className="form-content">
                            <div className="input-box">
                                <label>Full Name</label>
                                <div className="input-field">
                                    <FontAwesomeIcon icon={faUser} className="field-icon" />
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-box">
                                <label>Email (Registered)</label>
                                <div className="input-field disabled">
                                    <FontAwesomeIcon icon={faEnvelope} className="field-icon" />
                                    <input type="email" name="email" value={formData.email} readOnly />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Details */}
                    <div className="pd-card">
                        <div className="card-header">
                            <h3><FontAwesomeIcon icon={faAddressCard} /> Contact Details</h3>
                        </div>
                        <div className="form-content">
                            <div className="input-box">
                                <label>Mobile Number</label>
                                <div className="input-field">
                                    <FontAwesomeIcon icon={faPhone} className="field-icon" />
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 07498173337" />
                                </div>
                            </div>
                            <div className="input-box">
                                <label>Current City</label>
                                <div className="input-field">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="field-icon" />
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Sangamner" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="pd-footer-actions">
                   
                    <button type="submit" className="btn-primary">
                        <FontAwesomeIcon icon={faSave} /> Update Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PersonalDetails;