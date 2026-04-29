import React, { useState } from "react";
import axios from "axios";
import "./style.css";

function Hero() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    course: "1" // Default course ID (aap dropdown bhi add kar sakte hain)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend API call jo aapne node.js mein likhi hai
      const response = await axios.post("http://localhost:5000/api/enquiry", {
        ...formData,
        status: "Pending" 
      });

      if (response.data.success) {
        alert("Enquiry Submitted Successfully! Admin will contact you.");
        setFormData({ name: "", email: "", phone: "", message: "", course: "1" });
      }
    } catch (err) {
      console.error("Error saving enquiry:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-left">
        <h1>BEST INSTITUTE FOR <br /> SOFTWARE & IT SKILL TRAINING!</h1>
        <p>Ignite your tech career with our expert-led courses...</p>
        <span className="badge">Trusted Software & IT Training Institute</span>
      </div>

      <div className="form-box">
        <h2>Enquiry Form</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" placeholder="Your Name" required 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Your Email" required 
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="text" placeholder="Your Phone" required 
            value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <textarea 
            placeholder="Your Message"
            value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
          ></textarea>

          <button type="submit">Submit</button>
        </form>
      </div>
    </section>
  );
}

export default Hero;