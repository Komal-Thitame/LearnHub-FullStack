import React, { useState } from "react";
import "./style.css";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaSearch } from "react-icons/fa"; // Icons ke liye

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert("Searching for: " + searchQuery);
      // Yahan aap apni search logic daal sakte hain
    }
  };

  return (
    <>
      <nav className="navbar">
        {/* Updated Logo & Name */}
        <div className="logo">
          <div className="logo-icon-wrapper">
            <FaGraduationCap />
          </div>
          <span className="brand-text">Edu<span>Hub</span></span>
        </div>

        {/* Menu with Blog */}
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#courses">Courses</a></li>
          <li><a href="#admissions">Admissions</a></li>
          <li><a href="#faculty">Faculty</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="#blog">Blog</a></li> {/* Blog Added */}
        </ul>

        {/* Workable Search Box */}
        <form className="search-box" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit"><FaSearch /></button>
        </form>

        {/* Login Button */}
        <Link to="/login" className="login-btn">
          Login
        </Link>
      </nav>
    </>
  );
}

export default Navbar;