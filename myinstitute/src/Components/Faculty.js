import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

function Faculty() {
  const [facultyList, setFacultyList] = useState([]);

  // Database se instructors load karne ka function
  const loadFaculty = async () => {
    try {
      // Wahi API use kar rahe hain jo Instructor.js mein hai
      const res = await axios.get("http://localhost:5000/api/instructors");
      
      // Sirf 'Active' faculty dikhane ke liye filter
      // Agar aap chahte hain ki 'On Leave' wale bhi dikhein, toh filter hata dein
      const activeFaculty = res.data.filter(f => f.status === "Active");
      setFacultyList(activeFaculty);
    } catch (err) {
      console.error("Error loading faculty on home page:", err);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  return (
    <section id="faculty" className="faculty">
      <div className="container">
        <div className="section-title">
          <h2>Our Faculty</h2>
          <p>Meet our experienced and dedicated trainers</p>
        </div>

        <div className="faculty-box" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          {facultyList.length > 0 ? (
            facultyList.map((faculty) => (
              <div className="faculty-card" key={faculty.id} style={{ textAlign: 'center', padding: '20px' }}>
                
                {/* Image Section Fix */}
                <div className="faculty-img-container" style={{ marginBottom: '15px' }}>
                   {faculty.photo_url ? (
                     <img 
                       src={faculty.photo_url} 
                       alt={faculty.name} 
                       style={{ 
                         width: '120px', 
                         height: '120px', 
                         borderRadius: '50%', 
                         objectFit: 'cover',
                         border: '4px solid #ffc107' // Yellow theme match karne ke liye
                       }} 
                     />
                   ) : (
                     <div className="faculty-img-placeholder" style={{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%', 
                        backgroundColor: '#ffc107', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '40px', 
                        color: '#fff',
                        margin: '0 auto'
                     }}>
                        {faculty.name.charAt(0)}
                     </div>
                   )}
                </div>

                <h3>{faculty.name}</h3>
                <span style={{ color: '#ff4d4d', fontWeight: '500' }}>{faculty.subject}</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%' }}>Loading our experts...</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Faculty;