import React from "react";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebook, 
  faTwitter, 
  faInstagram, 
  faLinkedin 
} from "@fortawesome/free-brands-svg-icons";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* About */}
        <div className="footer-box">
          <h2>MyInstitute</h2>
          <p>
            We provide quality education and industry-ready skills
            for students to grow and succeed in their careers.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-box">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/faculty">Faculty</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-box">
          <h3>Contact</h3>
          <p>Email: info@myinstitute.com</p>
          <p>Phone: +91 9876543210</p>
          <p>Location: India</p>
        </div>

        {/* Newsletter + Social Icons (Icons yahan move kar diye hain) */}
        <div className="footer-box">
          <h3>Subscribe</h3>
          <input type="email" placeholder="Enter Email" />
          <button className="subscribe-btn">Subscribe</button>

          {/* Icons exactly under Subscribe button */}
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 MyInstitute | All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;