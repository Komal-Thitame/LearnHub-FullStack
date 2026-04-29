import React from "react";
import "./style.css";

function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">

        {/* Text */}
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            We are committed to providing high-quality education and
            practical knowledge to help students build successful careers.
            Our institute focuses on modern technologies, innovation, and
            skill-based learning.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to empower students with technical skills,
            confidence, and creativity to excel in the professional world.
          </p>

          <button className="about-btn">Learn More</button>
        </div>

      </div>
    </section>
  );
}

export default About;