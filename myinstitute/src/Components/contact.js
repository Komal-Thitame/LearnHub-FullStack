import React, { useState } from "react";
import axios from "axios";
import "./style.css";

function Contact() {
  // 1. Form Data ko manage karne ke liye state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  // 2. Input fields ki typing handle karne ke liye function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Form Submit hone par data Admin Enquiry mein bhejne ke liye function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend API call - data save karne ke liye
      const response = await axios.post("http://localhost:5000/api/enquiry", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        course: "Website Enquiry", // Default value for general contact
        status: "Pending"          // Initial status for Admin
      });

      if (response.status === 200) {
        alert("Enquiry sent successfully! Admin will contact you soon.");
        // Form clear karein
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to send enquiry. Please check if backend is running.");
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="section-title">
        <h1>Get In Touch</h1>
        <p>
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="contact-container">
        {/* Left: Office Info + Map */}
        <div className="contact-left">
          <div className="office-details">
            <h3>Our Office</h3>
            <p>
              Office No: 201 & 202, 3rd Floor, Creative Tech Tower,<br />
              Near Bus Stand, Sangamner, Ahmednagar, Maharashtra – 422605
            </p>
            <p>📞 +91 91234 56789 | +91 98765 43210</p>
            <p>📧 info@example.com</p>
            <p>🕘 Timing: 9:00 AM – 7:00 PM</p>
          </div>

          <div className="map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.444632766!2d74.159!3d19.576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDM0JzMzLjYiTiA3NMKwMDknMzIuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="map"
            ></iframe>
          </div>
        </div>

        {/* Right: Form (Updated with Logic) */}
        <div className="contact-right">
          <form onSubmit={handleSubmit}>
            <h3>Send us a Message</h3>
            <input 
              type="text" 
              name="name" 
              placeholder="Your Name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Your Email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <input 
              type="text" 
              name="phone" 
              placeholder="Phone Number" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
            <textarea 
              name="message" 
              placeholder="Your Message" 
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;