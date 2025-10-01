// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiImage,
  FiFileText,
  FiFolder,
  FiBookOpen,
  FiServer,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

import "./Sidebar.css";

const Sidebar = () => {
  const [expandedMenus, setExpandedMenus] = useState({
    media: false,
  });

  const location = useLocation();

  // Auto-expand parent menu if a child route is active
  useEffect(() => {
    if (
      location.pathname.startsWith("/news") ||
      location.pathname.startsWith("/events") ||
      location.pathname.startsWith("/gallery")
    ) {
      setExpandedMenus((prev) => ({ ...prev, media: true }));
    }
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <nav className="sidebar">
      <ul className="sidebar-menu">
        {/* Dashboard */}
        <li className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
          <Link to="/dashboard" className="menu-content">
            <FiHome className="menu-icon" />
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Media with submenu */}
        <li className={`menu-item ${expandedMenus.media ? "expanded" : ""}`}>
          <div
            className="menu-content"
            role="button"
            tabIndex={0}
            onClick={() => toggleMenu("media")}
            onKeyDown={(e) => e.key === "Enter" && toggleMenu("media")}
          >
            <FiImage className="menu-icon" />
            <span>Media</span>
            <span className="menu-arrow">
              {expandedMenus.media ? <FiChevronDown /> : <FiChevronRight />}
            </span>
          </div>
          {expandedMenus.media && (
            <ul className="submenu">
              <li className={`submenu-item ${location.pathname === "/news" ? "active" : ""}`}>
                <Link to="/news">News</Link>
              </li>
              <li className={`submenu-item ${location.pathname === "/events" ? "active" : ""}`}>
                <Link to="/events">Events</Link>
              </li>
              <li className={`submenu-item ${location.pathname === "/gallery" ? "active" : ""}`}>
                <Link to="/gallery">Gallery</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Researches */}
        <li className={`menu-item ${location.pathname === "/researches" ? "active" : ""}`}>
          <Link to="/researches" className="menu-content">
            <FiFileText className="menu-icon" />
            <span>Researches</span>
          </Link>
        </li>

        {/* Projects */}
        <li className={`menu-item ${location.pathname === "/projects" ? "active" : ""}`}>
          <Link to="/projects" className="menu-content">
            <FiFolder className="menu-icon" />
            <span>Projects</span>
          </Link>
        </li>

        {/* Publications */}
        <li className={`menu-item ${location.pathname === "/publications" ? "active" : ""}`}>
          <Link to="/publications" className="menu-content">
            <FiBookOpen className="menu-icon" />
            <span>Publications</span>
          </Link>
        </li>

        {/* Services */}
        <li className={`menu-item ${location.pathname === "/services" ? "active" : ""}`}>
          <Link to="/services" className="menu-content">
            <FiServer className="menu-icon" />
            <span>Services</span>
          </Link>
        </li>

        {/* ✅ Staff Management (was Organization Staff before) */}
        <li className={`menu-item ${location.pathname === "/staffmanagement" ? "active" : ""}`}>
          <Link to="/staffmanagement" className="menu-content">
            <FiSettings className="menu-icon" />
            <span>Staff Management</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
