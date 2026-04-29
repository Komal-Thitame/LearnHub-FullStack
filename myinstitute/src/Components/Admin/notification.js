import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 1. Axios import kiya
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBell, faCheckDouble, faUserPlus, faCreditCard, 
  faTrash, faPaperPlane, faEye 
} from "@fortawesome/free-solid-svg-icons";
import './notification.css';

const Notifications = () => {
  // 1. Initial Data (Ab khali array rakhenge taki DB se data aaye)
  const [notifs, setNotifs] = useState([]);

  // Form States
  const [newNotif, setNewNotif] = useState({ title: '', desc: '', type: 'system' });
  const [viewNotif, setViewNotif] = useState(null); 

  // --- DATABASE SE FETCH KARNE KA LOGIC ---
  const fetchNotifs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/notifications");
      setNotifs(res.data);
    } catch (err) {
      console.log("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifs(); // Page load hote hi data aayega
  }, []);

  // --- SEND NOTIFICATION LOGIC (SAVING TO DB) ---
  const handleSendNotif = async (e) => {
    e.preventDefault();
    if (!newNotif.title || !newNotif.desc) return alert("Bhai, saare fields bharo!");

    // Payload taiyar kiya
    const payload = {
      title: newNotif.title,
      desc: newNotif.desc,
      type: newNotif.type,
      color: newNotif.type === 'alert' ? '#FFB547' : '#6366f1'
    };

    try {
      // Backend ko data bheja
      await axios.post("http://localhost:5000/notifications", payload);
      setNewNotif({ title: '', desc: '', type: 'system' }); 
      fetchNotifs(); // List update karne ke liye
    } catch (err) {
      alert("Database error!");
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // --- DELETE LOGIC (DB SE PERMANENT DELETE) ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/notifications/${id}`);
      setNotifs(notifs.filter(n => n.id !== id));
    } catch (err) {
      alert("Delete failed!");
    }
  };

  const handleMarkAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, unread: false })));
  };

  // Function to determine which icon to show
  const getIcon = (type) => {
    if (type === 'enroll') return faUserPlus;
    if (type === 'payment') return faCreditCard;
    return faBell;
  };

  return (
    <div className="notif-scope">
      <div className="notif-grid">
        
        {/* LEFT SIDE: Admin Broadcast Form */}
        <div className="notif-form-container">
          <div className="form-header">
            <FontAwesomeIcon icon={faPaperPlane} />
            <h3>Broadcast to Students</h3>
          </div>
          <form onSubmit={handleSendNotif}>
            <div className="input-group">
              <label>Message Title</label>
              <input 
                type="text" 
                placeholder="Ex: Exam Results Out" 
                value={newNotif.title}
                onChange={(e) => setNewNotif({...newNotif, title: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>Priority Type</label>
              <select 
                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd'}}
                value={newNotif.type} 
                onChange={(e) => setNewNotif({...newNotif, type: e.target.value})}
              >
                <option value="system">System (Blue)</option>
                <option value="alert">Alert (Yellow)</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Description</label>
              <textarea 
                rows="4" 
                placeholder="Write message details..."
                value={newNotif.desc}
                onChange={(e) => setNewNotif({...newNotif, desc: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="send-btn">Send Notification</button>
          </form>
        </div>

        {/* RIGHT SIDE: Activity Feed */}
        <div className="notif-container">
          <div className="notif-header-flex">
            <div className="notif-intro">
              <div className="bell-bg"><FontAwesomeIcon icon={faBell} /></div>
              <div>
                <h2>Activity Feed</h2>
                <p>{notifs.filter(n => n.unread).length} Unread Notifications</p>
              </div>
            </div>
            <button className="notif-action-btn" onClick={handleMarkAllRead}>
              <FontAwesomeIcon icon={faCheckDouble} /> Mark All Read
            </button>
          </div>

          <div className="notif-main-list">
            {notifs.length > 0 ? notifs.map((n) => (
              <div 
                key={n.id} 
                className={`notif-card-row ${n.unread ? 'is-unread' : ''}`}
                onClick={() => handleMarkAsRead(n.id)}
              >
                <div className="notif-icon-circle" style={{ background: n.color }}>
                  <FontAwesomeIcon icon={getIcon(n.type)} />
                </div>
                
                <div className="notif-body-text">
                  <div className="notif-top-row">
                    <span className="notif-category" style={{color: n.color}}>{n.type.toUpperCase()}</span>
                    <span className="notif-date">{new Date(n.time).toLocaleTimeString()}</span>
                  </div>
                  <h3>{n.title}</h3>
                  <p>{n.desc.length > 50 ? n.desc.substring(0, 50) + "..." : n.desc}</p>
                </div>

                <div className="notif-end-tools">
                  <button className="notif-view-btn" onClick={(e) => { e.stopPropagation(); setViewNotif(n); }}>
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button className="notif-del-icon" onClick={(e) => handleDelete(e, n.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">No notifications left! 🎉</div>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewNotif && (
        <div className="notif-modal-overlay" onClick={() => setViewNotif(null)}>
          <div className="notif-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top" style={{backgroundColor: viewNotif.color}}>
              <FontAwesomeIcon icon={getIcon(viewNotif.type)} />
            </div>
            <div className="modal-content">
              <span className="modal-type">{viewNotif.type.toUpperCase()}</span>
              <h2>{viewNotif.title}</h2>
              <p>{viewNotif.desc}</p>
              <button className="close-modal-btn" onClick={() => setViewNotif(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;