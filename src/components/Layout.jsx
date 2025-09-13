// components/Layout.jsx
import React from "react";
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import "./Layout.css";

const Layout = ({ children, onLogout, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="layout">
      {/* Pass userData to Header */}
      <Header 
        onLogout={onLogout} 
        onToggleSidebar={handleToggleSidebar}
        userData={userData}
      />

      <div className="body-container">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;