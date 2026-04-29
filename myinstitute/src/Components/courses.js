import React, { useRef, useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import { 
  faTimes, faClock, faBookOpen,
  faArrowLeft, faAward, faInfoCircle, faGraduationCap, faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./style.css";
import defaultImg from "./images/full Stack.jfif";

function Courses() {
  const [dbCourses, setDbCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("curriculum");
  const courseGridRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const speed = 1;

  // --- Data Loading ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/get-view-courses");
        setDbCourses(res.data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    loadData();
  }, []);

  // --- Enrollment Logic (Updated with App.js Paths) ---
  const handleEnrollClick = (e, course) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const isAuth = localStorage.getItem("isAuth") === "true";
    const cId = course.Id || course.id || course._id;

    if (isAuth) {
      // App.js ke mutabik student dashboard ka path: /student/AdmissionForm
      navigate("/student/AdmissionForm", { state: { selectedCourseId: cId } });
    } else {
      // Public login path
      navigate("/login", { state: { fromCourseId: cId } });
    }
  };

  const duplicatedCourses = [...dbCourses, ...dbCourses, ...dbCourses];

  // --- Auto Scroll Logic ---
  const checkLoop = useCallback(() => {
    const grid = courseGridRef.current;
    if (!grid || dbCourses.length === 0) return;
    const singleSetWidth = grid.scrollWidth / 3;
    if (grid.scrollLeft >= singleSetWidth * 2) {
      grid.scrollLeft = singleSetWidth;
    } else if (grid.scrollLeft <= 0) {
      grid.scrollLeft = singleSetWidth;
    }
  }, [dbCourses.length]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (dbCourses.length === 0 || selectedCourse) return;
    intervalRef.current = setInterval(() => {
      if (courseGridRef.current) {
        courseGridRef.current.scrollLeft += speed;
        checkLoop();
      }
    }, 30);
  }, [speed, dbCourses.length, checkLoop, stopAutoScroll, selectedCourse]);

  useEffect(() => {
    const grid = courseGridRef.current;
    if (grid && dbCourses.length > 0) {
      const timer = setTimeout(() => {
        grid.scrollLeft = grid.scrollWidth / 3;
        startAutoScroll();
      }, 200);
      return () => { clearTimeout(timer); stopAutoScroll(); };
    }
  }, [dbCourses, startAutoScroll, stopAutoScroll]);

  const handleSwitchCourse = (course) => {
    setSelectedCourse(course);
    setActiveTab("curriculum");
  };

  return (
    <section className="courses" id="courses">
      <h1 className="title">OUR COURSES</h1>

      <div className="slider-container">
        <button type="button" className="arrow left" onClick={() => {
          stopAutoScroll();
          courseGridRef.current.scrollBy({ left: -315, behavior: "smooth" });
          setTimeout(startAutoScroll, 2000);
        }}>&#10094;</button>

        <div className="course-grid" ref={courseGridRef} onMouseEnter={stopAutoScroll} onMouseLeave={startAutoScroll}>
          {dbCourses.length > 0 ? (
            duplicatedCourses.map((course, index) => (
              <div className="course-card" key={index}>
                {course.duration && <div className="duration-badge">{course.duration}</div>}
                <img src={course.image_url || defaultImg} alt={course.title} />
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p className="price">₹{course.price}</p>
                  <div className="course-actions">
                    <button type="button" className="view-btn" onClick={() => setSelectedCourse(course)}>View Details</button>
                    <button type="button" className="enroll-btn" onClick={(e) => handleEnrollClick(e, course)}>Enroll Now</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>Loading amazing courses...</div>
          )}
        </div>

        <button type="button" className="arrow right" onClick={() => {
          stopAutoScroll();
          courseGridRef.current.scrollBy({ left: 315, behavior: "smooth" });
          setTimeout(startAutoScroll, 2000);
        }}>&#10095;</button>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="course-modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="portal-modal-container" onClick={(e) => e.stopPropagation()}>
            
            <div className="portal-header-minimal">
                <button type="button" className="p-back-link" onClick={() => setSelectedCourse(null)}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
                </button>
                <span className="p-header-title-text">{selectedCourse.title}</span>
                <button type="button" className="close-portal-x" onClick={() => setSelectedCourse(null)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <div className="portal-main-layout">
              <div className="portal-left-content">
                <div className="p-hero-card-modern">
                  <div className="p-hero-flex">
                    <div className="p-hero-main-info">
                        <span className="p-badge-top">Trending Program</span>
                        <h2>{selectedCourse.title} Specialization</h2>
                        <div className="p-badges">
                          <span><FontAwesomeIcon icon={faClock} /> {selectedCourse.duration || "3 Months"}</span>
                          <span className="gold"><FontAwesomeIcon icon={faAward} /> Govt. Verified</span>
                        </div>
                        <div className="p-price-action-row">
                          <div className="p-price-big">₹{selectedCourse.price}</div>
                          <button type="button" className="p-enroll-main-btn" onClick={(e) => handleEnrollClick(e, selectedCourse)}>Enroll Now</button>
                        </div>
                    </div>
                    <div className="p-hero-img-box">
                       <img src={selectedCourse.image_url || defaultImg} alt={selectedCourse.title} />
                    </div>
                  </div>
                </div>

                <div className="p-desc-section">
                  <h3><FontAwesomeIcon icon={faInfoCircle} /> Course Description</h3>
                  <p>{selectedCourse.description || "Expert-led professional training program."}</p>
                </div>

                <div className="p-tabs-container">
                  <div className="p-tabs-head">
                    <button type="button" className={activeTab === 'curriculum' ? 'active' : ''} onClick={() => setActiveTab('curriculum')}>
                      <FontAwesomeIcon icon={faBookOpen} /> Detailed Curriculum
                    </button>
                    <button type="button" className={activeTab === 'trainer' ? 'active' : ''} onClick={() => setActiveTab('trainer')}>
                      Trainer Info
                    </button>
                  </div>

                  <div className="p-tabs-content">
                    {activeTab === 'curriculum' ? (
                      <div className="p-syllabus-grid-professional">
                        {selectedCourse.content ? (
                          selectedCourse.content.split('\n').filter(l => l.trim()).map((line, idx) => (
                            <div className="syllabus-modern-card" key={idx}>
                              <div className="card-dot"></div>
                              <div className="card-content">
                                <h5>MODULE {idx + 1}</h5>
                                <p>{line}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-content">Syllabus details will be updated soon.</p>
                        )}
                      </div>
                    ) : (
                      <div className="trainer-info-tab">
                        <p>Learn from industry leaders who have mastered <strong>{selectedCourse.title}</strong>.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="portal-right-sidebar">
                <div className="p-side-nav">
                  <div className="side-nav-title"><FontAwesomeIcon icon={faGraduationCap} /> All Programs</div>
                  <div className="side-nav-links">
                    {dbCourses.map((c) => (
                      <div 
                        key={c.Id || c.id} 
                        className={`side-nav-item ${(String(selectedCourse.Id || selectedCourse.id) === String(c.Id || c.id)) ? 'current' : ''}`}
                        onClick={() => handleSwitchCourse(c)}
                      >
                        {c.title} <FontAwesomeIcon icon={faChevronRight} className="p-chevron" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Courses;