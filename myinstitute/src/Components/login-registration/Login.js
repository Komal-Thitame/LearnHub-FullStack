import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios"; 
import styles from "./Login.module.css";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserPlus, FaSignInAlt } from "react-icons/fa";

function Login() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Courses page se aaya hua course ID (agar hai toh)
  const fromCourseId = location.state?.fromCourseId;

  // --- States for Login ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // --- States for Sign Up ---
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });

  // Toggle Function with Form Reset
  const handleToggle = () => {
    setIsActive(!isActive);
    setLoginEmail("");
    setLoginPass("");
    setSignUpData({ fullName: "", email: "", password: "", phone: "" });
  };

  // --- Handle Login Logic ---
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email: loginEmail,
        password: loginPass
      });

      if (response.data.success) {
        const { role, user } = response.data;

        // Common items for both Admin and Student
        localStorage.setItem("isAuth", "true");
        localStorage.setItem("userRole", role);

        if (role === "admin") {
          // --- UPDATED: Storing Admin Email for Settings & Header Sync ---
          localStorage.setItem("adminEmail", loginEmail); 
          localStorage.setItem("adminName", user.name); // <-- Ye line add karein
          alert("Welcome Admin! Redirecting...");
          navigate("/admin");
        } else {
          // Student specific data save karein
          localStorage.setItem("studentName", user.name);
          localStorage.setItem("studentEmail", loginEmail);

          alert(`Welcome ${user.name}!`);

          // REDIRECT LOGIC: Admission form ya Student Dashboard
          if (fromCourseId) {
            navigate("/admission", { state: { selectedCourseId: fromCourseId } });
          } else {
            navigate("/student");
          }
        }
      } else {
        alert(response.data.message || "Invalid Credentials!");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Server is not responding. Make sure backend is running!");
    }
  };

  // --- Handle Sign Up Logic ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", signUpData);
      
      if (response.data.success) {
        alert(`Account created for ${signUpData.fullName}! Please Login.`);
        setIsActive(false); 
      } else {
        alert(response.data.message || "Registration failed!");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      alert("Error connecting to server!");
    }
  };

  const handleGoogleAuth = () => {
    alert("Google Authentication coming soon...");
  };

  return (
    <div className={styles.authWrapper}>
      <div className={`${styles.authMainBox} ${isActive ? styles.isPanelActive : ""}`}>
        
        {/* --- Sign In (Login Form) --- */}
        <div className={`${styles.authFormPart} ${styles.authSignIn}`}>
          <form className={styles.authForm} onSubmit={handleLogin}>
            <h2 className={styles.authTitle}>Login</h2>
            <div className={styles.authInputGroup}>
              <FaEnvelope className={styles.authIcon} />
              <input 
                className={styles.authField}
                type="email" 
                placeholder="Email Address" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
              />
            </div>
            <div className={styles.authInputGroup}>
              <FaLock className={styles.authIcon} />
              <input 
                className={styles.authField}
                type="password" 
                placeholder="Password" 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required 
              />
            </div>
            <div className={styles.authExtraRow}>
              <label className={styles.authCheckLabel}>
                <input type="checkbox" /> Remember Me
              </label>
              <span onClick={() => alert("Redirecting...")} className={styles.authLinkText} style={{cursor:'pointer'}}>
                Forgot Password?
              </span>
            </div>
            <button type="submit" className={styles.authSubmitBtn}>
              <FaSignInAlt /> Login
            </button>
          </form>
        </div>

        {/* --- Sign Up Form --- */}
        <div className={`${styles.authFormPart} ${styles.authSignUp}`}>
          <form className={styles.authForm} onSubmit={handleSignUp}>
            <h2 className={styles.authTitle}>Create Account</h2>
            <div className={styles.authInputGroup}>
              <FaUser className={styles.authIcon} />
              <input 
                className={styles.authField} 
                type="text" 
                placeholder="Full Name" 
                value={signUpData.fullName}
                onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})}
                required 
              />
            </div>
            <div className={styles.authInputGroup}>
              <FaEnvelope className={styles.authIcon} />
              <input 
                className={styles.authField} 
                type="email" 
                placeholder="Email" 
                value={signUpData.email}
                onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                required 
              />
            </div>
            <div className={styles.authInputGroup}>
              <FaLock className={styles.authIcon} />
              <input 
                className={styles.authField} 
                type="password" 
                placeholder="Password" 
                value={signUpData.password}
                onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                required 
              />
            </div>
            <div className={styles.authInputGroup}>
              <FaPhone className={styles.authIcon} />
              <input 
                className={styles.authField} 
                type="tel" 
                placeholder="Contact Number" 
                value={signUpData.phone}
                onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                required 
              />
            </div>
            <button type="submit" className={styles.authSubmitBtn}><FaUserPlus /> Sign Up</button>
            <button type="button" className={styles.authGoogleBtn} onClick={handleGoogleAuth}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" />
              Sign up with Google
            </button>
          </form>
        </div>

        {/* --- Overlay (Moving Text/Button) --- */}
        <div className={styles.authOverlaySide}>
          <div className={styles.authOverlayBase}>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80" 
              alt="overlay" 
              className={styles.authOverlayImg} 
            />
            <h2>{isActive ? "Join Us Today!" : "Welcome Back!"}</h2>
            <p>{isActive ? "Enter your details to start your journey" : "Keep connected with us by logging in with your info"}</p>
            <button onClick={handleToggle} className={styles.authToggleBtn}>
              {isActive ? <FaSignInAlt /> : <FaUserPlus />}
              {isActive ? " Go to Login" : " Create Account"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;