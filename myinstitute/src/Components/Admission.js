import React from "react";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGraduationCap, faClock, faCheckCircle, 
  faBriefcase, faGift, faRocket, faUsers, faDesktop, faCertificate
} from "@fortawesome/free-solid-svg-icons";

const Admission = () => {
  return (
    <section id="admissions" className="adm-premium-wrapper">
      <div className="adm-container">
        
        {/* Header Section */}
        <div className="adm-header-box">
          <span className="adm-tag">Enrollment 2026</span>
          <h2>Admission <span className="adm-grad-text">Open Now</span></h2>
          <p>Join our community of learners and build a career in the world of technology.</p>
        </div>

        <div className="adm-main-layout">
          {/* LEFT PANEL - Highlights */}
          <div className="adm-highlight-panel">
            <div className="adm-panel-title">
               <h3>Why Join Us?</h3>
               <div className="adm-divider"></div>
            </div>
            
            <div className="adm-feature-card">
              <div className="adm-icon-cir blue-bg"><FontAwesomeIcon icon={faGraduationCap} /></div>
              <div className="adm-info">
                  <h4>Multiple Streams</h4>
                  <p>MCA, BCA & Full Stack Development</p>
              </div>
            </div>

            <div className="adm-feature-card">
              <div className="adm-icon-cir orange-bg"><FontAwesomeIcon icon={faClock} /></div>
              <div className="adm-info">
                  <h4>Flexible Duration</h4>
                  <p>3 Years (Full-time 6 Semesters)</p>
              </div>
            </div>

            <div className="adm-feature-card">
              <div className="adm-icon-cir green-bg"><FontAwesomeIcon icon={faCheckCircle} /></div>
              <div className="adm-info">
                  <h4>Easy Eligibility</h4>
                  <p>Graduation from any recognized stream</p>
              </div>
            </div>

            <div className="adm-feature-card">
              <div className="adm-icon-cir red-bg"><FontAwesomeIcon icon={faBriefcase} /></div>
              <div className="adm-info">
                  <h4>Career Support</h4>
                  <p>100% Placement & Interview Prep</p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Bento Grid */}
          <div className="adm-right-content">
            <h3 className="adm-panel-title" style={{marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <FontAwesomeIcon icon={faGift} style={{color: '#ff4d00'}} /> Special Benefits
            </h3>
            
            <div className="adm-benefits-grid">
              <div className="adm-benefit-card">
                <div className="adm-b-icon orange-i"><FontAwesomeIcon icon={faRocket} /></div>
                <h4>Early Bird</h4>
                <p>Register before March & get <strong style={{color: '#ea580c'}}>20% OFF</strong></p>
              </div>

              <div className="adm-benefit-card">
                <div className="adm-b-icon green-i"><FontAwesomeIcon icon={faUsers} /></div>
                <h4>Refer & Earn</h4>
                <p>Flat <strong style={{color: '#16a34a'}}>₹2000 Discount</strong></p>
              </div>

              <div className="adm-benefit-card">
                <div className="adm-b-icon purple-i"><FontAwesomeIcon icon={faDesktop} /></div>
                <h4>Demo Class</h4>
                <p>3 Days <strong style={{color: '#9b59b6'}}>Free Trial</strong></p>
              </div>

              <div className="adm-benefit-card">
                <div className="adm-b-icon blue-i"><FontAwesomeIcon icon={faCertificate} /></div>
                <h4>Certifications</h4>
                <p>Get <strong style={{color: '#0066ff'}}>ISO Verified</strong> certs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admission;