import React, { useState, useRef, useEffect } from "react";
// import axios from "axios"; // ❌ REMOVE: Not used currently
import { 
  FaRobot, FaTimes, FaPaperPlane
  // ❌ REMOVE UNUSED ICONS: FaUniversity, FaReceipt, FaPhone, etc.
} from "react-icons/fa";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Typing indicator
  const [studentName, setStudentName] = useState("Student");
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Student Name on start
  useEffect(() => {
    const name = localStorage.getItem("studentName") || "Student";
    setStudentName(name);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Initial Welcome Message
      setTimeout(() => {
        setMessages([
          { 
            sender: "bot", 
            text: `Hello ${studentName}! 👋 Welcome to CSM Computer.`,
            type: "text"
          },
          { 
            sender: "bot", 
            text: "I am your virtual assistant. Choose an option below or type your query.",
            type: "text"
          },
          { 
            sender: "bot", 
            type: "options",
            options: [
              { label: "💰 Check My Fees", action: "check_fees" },
              { label: "📅 Class Timings", action: "timings" },
              { label: "📞 Contact Support", action: "contact" },
              { label: "❓ Help", action: "help" }
            ]
          }
        ]);
      }, 500);
    }
  };

  // Handle Quick Option Click
  const handleOptionClick = async (action) => {
    // 1. Show User's choice as a message
    const optionLabel = getOptionLabel(action);
    setMessages((prev) => [...prev, { sender: "user", text: optionLabel, type: "text" }]);
    
    // 2. Show Typing Indicator
    setIsTyping(true);

    // 3. Process Request
    setTimeout(() => {
      const reply = processAction(action);
      setMessages((prev) => [...prev, ...reply]);
      setIsTyping(false);
    }, 1000);
  };

  const getOptionLabel = (action) => {
    switch(action) {
      case 'check_fees': return "Check My Fees";
      case 'timings': return "Class Timings";
      case 'contact': return "Contact Support";
      case 'help': return "I need Help";
      default: return action;
    }
  };

  // Process Actions (Logic)
  const processAction = (action) => {
    switch(action) {
      case 'check_fees':
        // You can call API here to get real fee status
        return [
          { sender: "bot", text: "I checked your record. Here is the summary:", type: "text" },
          { sender: "bot", type: "card", data: { title: "Fee Status", value: "Pending: ₹5000", status: "warning" } },
          { sender: "bot", text: "You can pay online via the 'Payments' section.", type: "text" }
        ];
      case 'timings':
        return [
          { sender: "bot", text: "🕐 Batch Timings:\n• Morning: 10:00 AM - 1:00 PM\n• Afternoon: 2:00 PM - 5:00 PM\n• Evening: 6:00 PM - 8:00 PM", type: "text" }
        ];
      case 'contact':
        return [
          { sender: "bot", text: "You can reach us here:", type: "text" },
          { 
            sender: "bot", 
            type: "link", 
            data: { 
              text: "📞 Call Now: +91 9876543210", 
              url: "tel:+919876543210" 
            } 
          }
        ];
      case 'help':
        return [
          { sender: "bot", text: "I can help you with:\n• Course Details\n• Fee Payments\n• Batch Timings\n• Certificate Status", type: "text" },
          { sender: "bot", text: "Just type your question!", type: "text" }
        ];
      default:
        return [{ sender: "bot", text: "I'm not sure about that.", type: "text" }];
    }
  };

  // Handle Text Input
  const handleSend = () => {
    if (inputValue.trim() === "") return;

    setMessages((prev) => [...prev, { sender: "user", text: inputValue, type: "text" }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(inputValue);
      setMessages((prev) => [...prev, ...reply]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotReply = (query) => {
    const q = query.toLowerCase();
    if (q.includes("fee") || q.includes("pay")) {
      return processAction('check_fees');
    }
    if (q.includes("time") || q.includes("batch")) {
      return processAction('timings');
    }
    if (q.includes("hi") || q.includes("hello")) {
      return [{ sender: "bot", text: `Hello ${studentName}! How can I help?`, type: "text" }];
    }
    return [{ sender: "bot", text: "I am still learning! 🤖 For now, please use the options below or contact support.", type: "text" }];
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="bot-title">
              <div className="bot-avatar"><FaRobot /></div>
              <span>CSM Support</span>
            </div>
            <button onClick={toggleChat} className="close-btn"><FaTimes /></button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
                
                {/* Standard Text Message */}
                {msg.type === "text" && (
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                )}

                {/* Options/Buttons Message */}
                {msg.type === "options" && (
                  <div className="quick-options">
                    {msg.options.map((opt, i) => (
                      <button key={i} className="quick-btn" onClick={() => handleOptionClick(opt.action)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Message (e.g., Fee Status) */}
                {msg.type === "card" && (
                  <div className="info-card">
                    <h4>{msg.data.title}</h4>
                    <p className={msg.data.status}>{msg.data.value}</p>
                  </div>
                )}

                {/* Link Message */}
                {msg.type === "link" && (
                  <a href={msg.data.url} target="_blank" rel="noreferrer" className="chat-link">
                    {msg.data.text}
                  </a>
                )}

              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="message-row bot-row">
                <div className="message-bubble bot typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="send-btn"><FaPaperPlane /></button>
          </div>
        </div>
      )}

      <button className="chatbot-toggle-btn" onClick={toggleChat}>
        <FaRobot size={24} />
        {!isOpen && <span className="pulse-ring"></span>}
      </button>
    </div>
  );
};

export default Chatbot;