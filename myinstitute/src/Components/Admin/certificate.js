import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCertificate, faDownload, faShareNodes, faSearch, 
  faCircleCheck,  faPlus 
} from "@fortawesome/free-solid-svg-icons";
import './certificate.css';

const Certificates = () => {
  const [filter, setFilter] = useState('All');

  const certData = [
    { id: "CERT-9921", student: "Arjun Mehta", course: "Full Stack Development", date: "04 Mar 2026", grade: "A+" },
    { id: "CERT-9922", student: "Sneha Rao", course: "UI/UX Design", date: "01 Mar 2026", grade: "O" },
    { id: "CERT-9923", student: "Karan Singh", course: "Python for Data Science", date: "25 Feb 2026", grade: "A" },
    { id: "CERT-9924", student: "Isha Gupta", course: "Digital Marketing", date: "20 Feb 2026", grade: "B+" },
  ];

  return (
    <div className="cert-page-wrapper">
      {/* Upper Control Bar */}
      <div className="cert-header-section">
        <div className="cert-title-area">
          <h1>Student Certificates</h1>
          <p>Issue and manage digital credentials for your graduates.</p>
        </div>
        <button className="cert-add-btn">
          <FontAwesomeIcon icon={faPlus} /> Issue New Certificate
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="cert-controls">
        <div className="cert-tabs">
          {['All', 'Issued', 'Drafts', 'Revoked'].map((tab) => (
            <button 
              key={tab} 
              className={`cert-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="cert-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input type="text" placeholder="Search by Student or ID..." />
        </div>
      </div>

      {/* Grid of Certificates */}
      <div className="cert-grid-display">
        {certData.map((cert) => (
          <div className="cert-card-v3" key={cert.id}>
            <div className="cert-card-inner">
              <div className="cert-seal">
                <FontAwesomeIcon icon={faCertificate} />
              </div>
              <div className="cert-body">
                <span className="cert-id">{cert.id}</span>
                <h3>{cert.student}</h3>
                <p className="cert-course-name">{cert.course}</p>
                <div className="cert-meta-info">
                  <div className="cert-date">
                    <small>Issued On</small>
                    <span>{cert.date}</span>
                  </div>
                  <div className="cert-grade">
                    <small>Grade</small>
                    <span className={`grade-tag ${cert.grade.charAt(0)}`}>{cert.grade}</span>
                  </div>
                </div>
              </div>
              <div className="cert-footer-actions">
                <button className="cert-btn-dl" title="Download PDF">
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                <button className="cert-btn-sh" title="Share Link">
                  <FontAwesomeIcon icon={faShareNodes} />
                </button>
                <div className="cert-verify-tag">
                  <FontAwesomeIcon icon={faCircleCheck} /> Verified
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;