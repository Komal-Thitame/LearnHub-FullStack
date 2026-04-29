import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";
import "./AdminLayout.css";
function AdminLayout() {
  // Sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-layout-container">
      {/* 1. Sidebar: isOpen aur toggleSidebar props pass kiye */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* 2. Mobile Overlay: Jab sidebar khulega tab piche ka area dark hoga */}
      <div 
        className={`overlay ${isSidebarOpen ? "active" : ""}`} 
        onClick={toggleSidebar}
      ></div>

      <div className="admin-main-wrapper">
        {/* 3. Header: Isme bhi toggle function pass kiya taaki menu button chale */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* 4. Page Content Area: Jahan aapke baki pages load honge */}
        <div className="admin-page-content-area">
          <Outlet />
        </div>
      
      </div>
    </div>
  );
}

export default AdminLayout;