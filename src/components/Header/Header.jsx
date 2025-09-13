import React, { useState, useEffect } from 'react';
import zafiriLogo from "../../assets/zafiri.png";
import './Header.css';
import { FiLogOut, FiUser, FiBell, FiMessageSquare, FiMenu, FiChevronDown, FiSettings } from 'react-icons/fi';

const Header = ({ onLogout, onToggleSidebar, userData }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationsCount] = useState(3);
  const [messagesCount] = useState(1);

  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);

  const handleLogout = () => {
    // Remove all authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    setShowProfileMenu(false);
    onLogout();
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.user-profile')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Get user information from userData prop or use defaults
  const user = {
    name: userData?.username || 'Admin User',
    role: userData?.email ? 'Administrator' : 'User',
    email: userData?.email || 'admin@example.com'
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <FiMenu />
        </button>
        <img src={zafiriLogo} alt="Zafiri Logo" className="logo-small" />
        <div className="header-title">
          <h1>CMS Dashboard</h1>
          <p>Welcome to your content management system</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <button className="icon-btn notification-btn">
            <FiBell />
            {notificationsCount > 0 && <span className="badge">{notificationsCount}</span>}
          </button>

          <button className="icon-btn messages-btn">
            <FiMessageSquare />
            {messagesCount > 0 && <span className="badge">{messagesCount}</span>}
          </button>
        </div>

        <div className="user-profile">
          <div className="profile-container" onClick={toggleProfileMenu}>
            <div className="user-avatar">
              <div className="avatar-placeholder">
                <FiUser />
              </div>
            </div>

            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>

            <FiChevronDown className={`dropdown-arrow ${showProfileMenu ? 'rotated' : ''}`} />
          </div>

          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <div className="user-avatar large">
                  <div className="avatar-placeholder large">
                    <FiUser />
                  </div>
                </div>
                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <small>{user.role}</small>
                </div>
              </div>

              <div className="menu-divider"></div>

              <button className="menu-item">
                <FiUser />
                <span>My Profile</span>
              </button>

              <button className="menu-item">
                <FiSettings />
                <span>Account Settings</span>
              </button>

              <div className="menu-divider"></div>

              <button className="menu-item logout-item" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Optional standalone mobile logout button */}
        <button className="mobile-logout-btn" onClick={handleLogout}>
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default Header;