import React from "react";
import"./style.css";
import whyImg from "./images/why-choose-us-image.png"; // image import karo

function WhySection() {
  return (
    <section className="why">
      <h2>WHY YOU SHOULD START LEARNING WITH US?</h2>

      <div className="why-container">
        <div className="why-left">
          <div className="why-box">
            <div className="icon yellow"></div>
            <div>
              <h4>What Sets Us Apart</h4>
              <p>Cutting-edge curriculum with real projects and support.</p>
            </div>
          </div>

          <div className="why-box">
            <div className="icon red"></div>
            <div>
              <h4>Our Approach</h4>
              <p>Custom training and hands-on learning experience.</p>
            </div>
          </div>

          <div className="why-box">
            <div className="icon blue"></div>
            <div>
              <h4>Expert Instructors</h4>
              <p>Industry experienced trainers guiding you.</p>
            </div>
          </div>
        </div>

        <div className="why-right">
          <img src={whyImg} alt="student" />
        </div>
      </div>
    </section>
  );
}

export default WhySection;