import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook, faUsers, faDollarSign, faStar, faArrowUp,
  faChartLine, faChalkboardTeacher, faBriefcase,
  faCrown, faFire, faGraduationCap
} from "@fortawesome/free-solid-svg-icons";
import "./dashbord.css";

function Dashboard() {
  const navigate = useNavigate();

  const [liveData, setLiveData] = useState({
    courses: "0",
    students: "0",
    revenue: "₹0",
    rating: "4.8",
    teachers: "0",
    placement: "92%"
  });

  const chartRefs = {
    course: useRef(null),
    student: useRef(null),
    revenue: useRef(null),
    rating: useRef(null),
    teacher: useRef(null),
    placement: useRef(null),
    overview: useRef(null),
  };

  const chartInstances = useRef({});

  useEffect(() => {
    const currentInstances = chartInstances.current;

    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard-stats");
        if (res.data) {
          setLiveData({
            courses: res.data.totalCourses?.toString() || "0",
            students: res.data.totalStudents?.toLocaleString() || "0",
            revenue: "₹" + (res.data.totalRevenue?.toLocaleString() || "0"),
            rating: "4.8",
            teachers: res.data.totalTeachers?.toString() || "0",
            placement: (res.data.placementRate || "92") + "%"
          });

          // Chart Logic (Kept same as your original code)
          if (chartRefs.overview.current) {
            if (currentInstances.ov) currentInstances.ov.destroy();
            const labels = res.data.revenueGraph?.length > 0 ? res.data.revenueGraph.map(d => d.month) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
            const values = res.data.revenueGraph?.length > 0 ? res.data.revenueGraph.map(d => d.total) : [5, 7, 8, 12, 15, 18];

            currentInstances.ov = new Chart(chartRefs.overview.current, {
              type: "bar",
              data: {
                labels: labels,
                datasets: [{ 
                  data: values, 
                  backgroundColor: "#6366f1", 
                  borderRadius: 5 
                }],
              },
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: false } },
            });
          }

          const miniOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 0 } },
          };

          const initMini = (id, ref, data, color) => {
            if (!ref.current) return;
            if (currentInstances[id]) currentInstances[id].destroy();
            currentInstances[id] = new Chart(ref.current, {
              type: "line",
              data: { 
                labels: [1, 2, 3, 4, 5, 6], 
                datasets: [{ data, borderColor: color, backgroundColor: color + "20", fill: true }] 
              },
              options: miniOptions,
            });
          };

          const revValues = res.data.revenueGraph?.map(d => d.total) || [];
          initMini("course", chartRefs.course, [12, 19, 15, 25, 22, 30], "#4f46e5");
          initMini("student", chartRefs.student, [10, 15, 12, 20, 18, 25], "#10b981");
          initMini("revenue", chartRefs.revenue, revValues.length > 0 ? revValues : [5, 8, 7, 12, 10, 15], "#f59e0b");
          initMini("rating", chartRefs.rating, [4.2, 4.4, 4.3, 4.7, 4.6, 4.8], "#8b5cf6");
          initMini("teacher", chartRefs.teacher, [50, 60, 55, 75, 70, 85], "#4f46e5");
          initMini("placement", chartRefs.placement, [80, 85, 82, 88, 90, 92], "#10b981");
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };
    
    fetchData();

    return () => {
      Object.values(currentInstances).forEach(c => c?.destroy());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // UPDATED PATHS TO MATCH YOUR App.js ROUTES
  const stats = [
    { label: "Total Courses", val: liveData.courses, icon: faBook, color: "blue", ref: chartRefs.course, trend: "+12%", path: "/admin/courses/manage" }, 
    { label: "Total Students", val: liveData.students, icon: faUsers, color: "green", ref: chartRefs.student, trend: "+8%", path: "/admin/students/details" },
    { label: "Total Revenue", val: liveData.revenue, icon: faDollarSign, color: "orange", ref: chartRefs.revenue, trend: "+23%", path: "/admin/earnings" },
    { label: "Avg. Rating", val: liveData.rating, icon: faStar, color: "purple", ref: chartRefs.rating, trend: "+0.2" }, // No path
    { label: "Active Teachers", val: liveData.teachers, icon: faChalkboardTeacher, color: "blue", ref: chartRefs.teacher, trend: "+5%", path: "/admin/instructors" },
    { label: "Placement Rate", val: liveData.placement, icon: faBriefcase, color: "green", ref: chartRefs.placement, trend: "+3%" }, // No path
  ];

  const topCourses = [
    { name: "Fullstack Web Dev", sales: "120", growth: "Hot", icon: faFire, color: "text-orange" },
    { name: "UI/UX Mastery", sales: "85", growth: "Top", icon: faCrown, color: "text-purple" },
    { name: "Python for AI", sales: "64", growth: "New", icon: faGraduationCap, color: "text-blue" },
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="dashboard-container">
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((item, i) => (
            <div 
              className="stat-card" 
              key={i} 
              onClick={() => handleCardClick(item.path)}
              style={{ cursor: item.path ? 'pointer' : 'default' }}
            >
              <div className={`stat-icon ${item.color}`}><FontAwesomeIcon icon={item.icon} /></div>
              <div className="stat-details">
                <span className="stat-number">{item.val}</span>
                <span className="stat-label">{item.label}</span>
                <span className="stat-trend up"><FontAwesomeIcon icon={faArrowUp} /> {item.trend}</span>
              </div>
              <div className="stat-chart"><canvas ref={item.ref}></canvas></div>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-content">
        <div className="main-dashboard-grid">
          <div className="dashboard-left">
            <div className="content-card">
              <div className="card-header"><h3><FontAwesomeIcon icon={faChartLine} /> Revenue Overview</h3></div>
              <div className="chart-container"><canvas ref={chartRefs.overview}></canvas></div>
            </div>

            <div className="content-card top-courses-card">
              <div className="card-header"><h3><FontAwesomeIcon icon={faCrown} /> Top Selling Courses</h3></div>
              <div className="courses-list">
                {topCourses.map((course, idx) => (
                  <div className="course-item-mini" key={idx}>
                    <div className={`course-icon-bg ${course.color}`}>
                      <FontAwesomeIcon icon={course.icon} />
                    </div>
                    <div className="course-info-mini">
                      <h4>{course.name}</h4>
                      <p>{course.sales} Enrolled</p>
                    </div>
                    <span className={`course-badge ${course.growth.toLowerCase()}`}>{course.growth}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-right">
            <div className="content-card glass-panel">
              <div className="glass-content">
                <h3 className="glass-sub">Overall Integrity</h3>
                <h2 className="glass-title">System Pulse</h2>
                <div className="progress-ring-container">
                  <div className="ring-outer"></div>
                  <div className="ring-data">
                    <h1>98%</h1>
                    <p>Stable</p>
                  </div>
                </div>
                <div className="metrics-row">
                  <div className="metric-card"><span>UPTIME</span><strong>152 Days</strong></div>
                  <div className="metric-card"><span>LATENCY</span><strong>24ms</strong></div>
                </div>
                <button className="optimize-btn">System Health Check</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;