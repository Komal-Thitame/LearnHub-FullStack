import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faLock, faBell, faCloudUploadAlt, 
  faCheckCircle, faShieldAlt, faEye, faEyeSlash 
} from "@fortawesome/free-solid-svg-icons";
import './settings.css';

const Settings = () => {
  // State initialization
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [toggles, setToggles] = useState({ emailNotif: 0, darkMode: 0, twoFactor: 0 });
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(""); 

  // --- UPDATED DATA FETCHING LOGIC ---
  useEffect(() => {
    const fetchSettings = async () => {
      const adminEmail = localStorage.getItem("adminEmail");
      if (!adminEmail) return;

      try {
         const res = await axios.get(`http://localhost:5000/admin-profile/${adminEmail}`);
        if (res.data) {
          // FIX: Agar backend array bhej raha hai toh data[0] lo, warna direct data lo
          // Yeh issue "Admin User" dikhane ka main karan hai.
          const userData = Array.isArray(res.data) ? res.data[0] : res.data;

          if (userData) {
            setProfile({ 
              name: userData.full_name || "", 
              email: userData.email || "" 
            });
            setImage(userData.admin_photo || "");
            setToggles({
              emailNotif: userData.email_notif || 0,
              darkMode: userData.dark_mode || 0,
              twoFactor: userData.two_factor || 0
            });
            // Password logic usually best handled by separate logic, but keeping as is
            setPasswords(prev => ({...prev, current: userData.password || ""}));
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchSettings();
  }, []);

  // 2. Image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Optimized Save Logic
  const handleSave = async () => {
    try {
      const adminEmail = localStorage.getItem("adminEmail");
      
      const payload = {
        full_name: profile.name, 
        email: adminEmail,
        password: passwords.new || passwords.current,
        admin_photo: image,
        email_notif: toggles.emailNotif ? 1 : 0,
        dark_mode: toggles.darkMode ? 1 : 0,
        two_factor: toggles.twoFactor ? 1 : 0
      };

      const res = await axios.post("http://localhost:5000/api/auth/admin-update", payload);

      if (res.data.success) {
        setSaved(true);
        window.dispatchEvent(new Event("settingsChanged")); 
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to update: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Backend Server Error. Check console or ensure DB columns exist.");
    }
  };

  return (
    <div className="set-wrapper">
      <div className="set-container">
        <header className="set-header">
          <div className="header-info">
            <h2>Account Settings</h2>
            <p>Manage your profile and dashboard preferences.</p>
          </div>
          <div className="header-actions">
             {saved && <span className="save-msg animate-fade"><FontAwesomeIcon icon={faCheckCircle} /> Changes Saved!</span>}
             <button className="save-main-btn" onClick={handleSave}>Save Changes</button>
          </div>
        </header>

        <div className="set-grid">
          <div className="set-column">
            <section className="set-section">
              <div className="set-sec-title"><FontAwesomeIcon icon={faUser} /> Profile Identity</div>
              <div className="set-profile-card">
                <div className="avatar-section">
                  <div className="avatar-container">
                    {image ? (
                        <img src={image} alt="Profile" className="img-preview" />
                    ) : (
                        <div className="set-preview">{profile.name ? profile.name.charAt(0).toUpperCase() : "A"}</div>
                    )}
                    <label htmlFor="file-upload" className="upload-btn">
                      <FontAwesomeIcon icon={faCloudUploadAlt} />
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} hidden />
                  </div>
                  <div className="avatar-text">
                    {/* Yahan ab 'Komal Thitame' dikhega agar backend se aaya to */}
                    <h4>{profile.name || "Admin User"}</h4>
                    <p>Update your photo and personal details.</p>
                  </div>
                </div>

                <div className="set-inputs">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input 
                        type="text" 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})} 
                        placeholder="Enter full name"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address (Read Only)</label>
                    <input 
                        type="email" 
                        value={profile.email} 
                        readOnly 
                        style={{background: '#f4f7fe', cursor: 'not-allowed'}}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="set-section">
              <div className="set-sec-title"><FontAwesomeIcon icon={faBell} /> System Preferences</div>
              <div className="pref-box">
                <div className="toggle-row">
                  <span>Enable Email Alerts</span>
                  <label className="switch-ui">
                    <input 
                      type="checkbox" 
                      checked={!!toggles.emailNotif} 
                      onChange={() => setToggles({...toggles, emailNotif: toggles.emailNotif ? 0 : 1})} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className="set-column">
            <section className="set-section">
              <div className="set-sec-title"><FontAwesomeIcon icon={faLock} /> Security & Auth</div>
              <div className="pass-card">
                <div className="input-group">
                  <label>Current Password</label>
                  <div className="pass-input-wrapper">
                    <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={passwords.current} 
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                    />
                    <FontAwesomeIcon 
                        icon={showPass ? faEyeSlash : faEye} 
                        className="pass-toggle" 
                        onClick={() => setShowPass(!showPass)} 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password to change" 
                    value={passwords.new} 
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                  />
                </div>
                
                <div className="toggle-row" style={{marginTop: '20px'}}>
                  <div className="toggle-info">
                    <strong><FontAwesomeIcon icon={faShieldAlt} /> Two-Factor Auth</strong>
                    <p style={{fontSize: '11px', color: '#A3AED0'}}>Secure your login with 2FA</p>
                  </div>
                  <label className="switch-ui">
                    <input 
                      type="checkbox" 
                      checked={!!toggles.twoFactor} 
                      onChange={() => setToggles({...toggles, twoFactor: toggles.twoFactor ? 0 : 1})} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </section>

            <section className="security-status-card">
              <div className="status-header">
                <div className="pulse-icon"></div>
                <h4>Account Security: <strong>Active</strong></h4>
              </div>
              <p>Everything is now managed in the <code>admins</code> table.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;