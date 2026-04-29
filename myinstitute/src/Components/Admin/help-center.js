import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSearch, faQuestionCircle, faEnvelope, faPhoneAlt, 
  faChevronDown, faChevronUp, faLifeRing, faPaperPlane 
} from "@fortawesome/free-solid-svg-icons";
import './help-center.css';

const HelpCenter = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formStatus, setFormStatus] = useState("");

  const faqs = [
    { id: 1, q: "How do I reset my password?", a: "Go to Settings > Security and click on 'Forgot Password'. Follow the email instructions to reset it." },
    { id: 2, q: "How to add new students?", a: "Navigate to the Students tab in your sidebar and click the 'Add New' button at the top right corner." },
    { id: 3, q: "Is there a mobile app available?", a: "Yes, EduMaster is available for both Android and iOS. You can download it from the respective stores." },
    { id: 4, q: "How do I generate student certificates?", a: "Once a student completes 100% of the course, a 'Generate' button will appear in their profile under the certificates section." }
  ];

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("Sending...");
    setTimeout(() => {
        setFormStatus("Message Sent! We will contact you soon.");
        e.target.reset();
    }, 2000);
  };

  return (
    <div className="help-wrapper">
      <div className="help-hero">
        <div className="help-hero-content">
          <h1>How can we help you?</h1>
          <div className="help-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input type="text" placeholder="Search for articles, topics..." />
          </div>
        </div>
      </div>

      <div className="help-container">
        {/* FAQ Section */}
        <section className="help-section">
          <div className="help-title">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`} onClick={() => toggleFaq(faq.id)}>
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <FontAwesomeIcon icon={activeFaq === faq.id ? faChevronUp : faChevronDown} />
                </div>
                {activeFaq === faq.id && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Grid */}
        <div className="help-grid">
          <div className="help-contact-form">
            <h3>Send us a Message</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Subject" required />
              <textarea placeholder="Describe your issue..." rows="5" required></textarea>
              <button type="submit" className="help-submit-btn">
                <span>{formStatus || "Send Message"}</span>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>

          <div className="help-contact-info">
            <h3>Other ways to connect</h3>
            <div className="info-card">
              <FontAwesomeIcon icon={faEnvelope} />
              <div>
                <strong>Email Support</strong>
                <p>support@edumaster.com</p>
              </div>
            </div>
            <div className="info-card">
              <FontAwesomeIcon icon={faPhoneAlt} />
              <div>
                <strong>Call Us</strong>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div className="info-card">
              <FontAwesomeIcon icon={faLifeRing} />
              <div>
                <strong>24/7 Live Chat</strong>
                <p>Chat with our experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;