import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCheckCircle, faArrowRight, faArrowLeft, faIdCard, 
    faCamera, faBookOpen, faRocket,
    faStar, faLayerGroup, faChalkboardTeacher, faBriefcase, faBullseye
} from "@fortawesome/free-solid-svg-icons";
import "./AdmissionForm.css";

const AdmissionForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // State Management
    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [coursesList, setCoursesList] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        name: localStorage.getItem("studentName") || "",
        email: localStorage.getItem("studentEmail") || "",
        phone: "",
        city: "",
        address: "",
        gender: "", 
        dob: "",
        background: "Fresh Graduate",
        goal: ""
    });

    const [photoFile, setPhotoFile] = useState(null);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=6366f1&color=fff`;
    const [previewUrl, setPreviewUrl] = useState(defaultAvatar);

    // 1. DYNAMIC PHOTO FETCH (On Load)
   // 1. DYNAMIC PHOTO FETCH (On Load)
useEffect(() => {
    const fetchUserData = async () => {
        const email = localStorage.getItem("studentEmail");
        if (email) {
            try {
                const res = await axios.get(`http://localhost:5000/api/get-admission-status?email=${email}`);
                
                // FIXED: res.data.data ki jagah res.data use karein
                if (res.data.success && res.data.photo) {
                    setPreviewUrl(res.data.photo);
                    
                    // Optional: Agar aap chahte hain ki name bhi refresh par na jaye
                    if (res.data.name) {
                        setFormData(prev => ({ ...prev, name: res.data.name }));
                    }
                }
            } catch (err) {
                console.error("Error fetching existing profile:", err);
            }
        }
    };
    fetchUserData();
}, []);

    // 2. Fetch Courses Logic
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/get-courses"); 
                const allCourses = res.data || [];
                setCoursesList(allCourses);

                const passedCourseId = location.state?.selectedCourseId;
                if (passedCourseId && allCourses.length > 0) {
                    const course = allCourses.find(c => String(c.Id || c.id) === String(passedCourseId));
                    if (course) setSelectedCourse(course);
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Updated File Change for Dynamic Preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // File size validation (Optional: 2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert("File size is too large. Please select an image under 2MB.");
                return;
            }
            
            setPhotoFile(file);
            
            // FileReader use karke dynamic preview (Base64) set karna
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => setCurrentStep((prev) => prev + 1);
    const prevStep = () => setCurrentStep((prev) => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse) {
            alert("Please select a course first!");
            setCurrentStep(2);
            return;
        }

        // FormData object to handle text + file
        const data = new FormData();
        
        // Append text fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        const finalCourseId = selectedCourse?.Id || selectedCourse?.id;
        data.append("course", finalCourseId); 
        data.append("status", "Pending"); 
        
        // Append the actual file
        if (photoFile) {
            data.append("photo", photoFile);
        }

        try {
            const response = await axios.post("http://localhost:5000/api/admission", data, {
                headers: { 
                    "Content-Type": "multipart/form-data" 
                }
            });

            if (response.data.success) {
                setSubmitted(true);
            } else {
                alert("Submission failed: " + (response.data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Error connecting to server. Please check if your image is too large or server is down.");
        }
    };

    if (submitted) {
        return (
            <div className="lms-success-overlay">
                <div className="lms-success-card">
                    <FontAwesomeIcon icon={faCheckCircle} className="lms-success-icon" />
                    <h2>Application Submitted!</h2>
                    <p>Applied for: <strong>{selectedCourse?.title || selectedCourse?.Title}</strong>.</p>
                    <p className="lms-sub-msg">Check your status in the dashboard.</p>
                    <button className="lms-btn-finish" onClick={() => navigate("/student")}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="lms-page-wrapper">
            <aside className="lms-sidebar">
                <div className="lms-brand-box">
                    <div className="lms-logo-sq"><FontAwesomeIcon icon={faRocket} /></div>
                    <div>
                        <span className="lms-brand-name">SkillRise</span>
                        <span className="lms-brand-tag">LMS Portal</span>
                    </div>
                </div>

                <div className="lms-profile-card">
                    <div className="lms-avatar-box">
                        <img 
                            src={previewUrl} 
                            alt="User Profile" 
                            onError={(e) => { e.target.src = defaultAvatar; }} 
                        />
                        <label htmlFor="lms-photo" className="lms-cam-btn">
                            <FontAwesomeIcon icon={faCamera} />
                        </label>
                        <input 
                            type="file" 
                            id="lms-photo" 
                            hidden 
                            onChange={handleFileChange} 
                            accept="image/png, image/jpeg, image/jpg" 
                        />
                    </div>
                    <h4>{formData.name || "Student Name"}</h4>
                </div>

                <div className="lms-steps">
                    {["Account Details", "Select Course", "Career Goals", "Review"].map((label, i) => (
                        <div key={i} className={`lms-step ${currentStep >= i + 1 ? "active" : ""}`}>
                            <span className="lms-step-dot">{i + 1}</span> <span>{label}</span>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="lms-content">
                <form className="lms-form" onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <div className="lms-fade">
                            <h2 className="lms-title"><FontAwesomeIcon icon={faIdCard} /> Basic Information</h2>
                            <div className="lms-grid">
                                <div className="lms-group full">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                                </div>
                                <div className="lms-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required readOnly />
                                </div>
                                <div className="lms-group">
                                    <label>Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="XXXXX XXXXX" required />
                                </div>
                                <div className="lms-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="lms-group">
                                    <label>Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                                </div>
                                <div className="lms-group">
                                    <label>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                                </div>
                                <div className="lms-group full">
                                    <label>Full Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Your address here..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="lms-fade">
                            <h2 className="lms-title"><FontAwesomeIcon icon={faBookOpen} /> Choose Your Course</h2>
                            <div className="lms-course-grid">
                                {!loading ? (
                                    coursesList.map((course) => {
                                        const cId = course.Id || course.id;
                                        const isSelected = String(selectedCourse?.Id || selectedCourse?.id) === String(cId);
                                        return (
                                            <div 
                                                key={cId} 
                                                className={`lms-course-card ${isSelected ? "selected" : ""}`} 
                                                onClick={() => setSelectedCourse(course)}
                                            >
                                                <div className="lms-card-head">
                                                    <span className="lms-level-tag">{course.status || "Professional"}</span>
                                                    <FontAwesomeIcon icon={faLayerGroup} />
                                                </div>
                                                <h4>{course.title || course.Title}</h4>
                                                <div className="lms-card-meta">
                                                    <p><FontAwesomeIcon icon={faChalkboardTeacher} /> {course.instructor_name || "Expert Mentor"}</p>
                                                    <span className="lms-rating"><FontAwesomeIcon icon={faStar} /> 4.9</span>
                                                </div>
                                                <div className="lms-price-row">
                                                    <strong style={{ color: '#4318FF', fontSize: '1.2rem' }}>
                                                        {course.price ? `₹${course.price}` : "Free"}
                                                    </strong>
                                                    {isSelected && <FontAwesomeIcon icon={faCheckCircle} className="lms-check-tick" />}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>Connecting to database...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="lms-fade">
                            <h2 className="lms-title"><FontAwesomeIcon icon={faBriefcase} /> Career Goals</h2>
                            <div className="lms-group full">
                                <label>Current Background</label>
                                <select name="background" value={formData.background} onChange={handleChange}>
                                    <option value="Fresh Graduate">Fresh Graduate</option>
                                    <option value="Working Professional">Working Professional</option>
                                    <option value="Student">Student</option>
                                </select>
                            </div>
                            <div className="lms-group full">
                                <label><FontAwesomeIcon icon={faBullseye} /> Why do you want to join this course?</label>
                                <textarea name="goal" value={formData.goal} onChange={handleChange} rows="4" placeholder="How will this course help your career?"></textarea>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="lms-fade">
                            <h2 className="lms-title"><FontAwesomeIcon icon={faCheckCircle} /> Review Application</h2>
                            <div className="lms-summary-box">
                                <p><strong>Name:</strong> {formData.name}</p>
                                <p><strong>Email:</strong> {formData.email}</p>
                                <p><strong>Course:</strong> <span className="highlight-text">{selectedCourse?.title || selectedCourse?.Title || "Not Selected"}</span></p>
                                <p><strong>City:</strong> {formData.city}</p>
                                <p><strong>DOB:</strong> {formData.dob}</p>
                                <div className="review-notice">
                                    <small>By clicking submit, you confirm the details provided are correct.</small>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="lms-footer">
                        {currentStep > 1 && (
                            <button type="button" className="lms-prev-btn" onClick={prevStep}>
                                <FontAwesomeIcon icon={faArrowLeft} /> Back
                            </button>
                        )}
                        <div className="lms-nav-right">
                            {currentStep < 4 ? (
                                <button 
                                    type="button" 
                                    className="lms-next-btn" 
                                    onClick={nextStep} 
                                    disabled={currentStep === 2 && !selectedCourse}
                                >
                                    Next <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            ) : (
                                <button type="submit" className="lms-submit-btn">Submit Application</button>
                            )}
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AdmissionForm;