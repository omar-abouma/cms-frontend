import React, { useState, useEffect } from 'react';
import zafiriLogo from "../../assets/zafiri.png";
import './Header.css';
import { FiLogOut, FiUser, FiBell, FiMessageSquare, FiMenu, FiChevronDown, FiSettings, FiCamera, FiX, FiMail, FiServer, FiCheck } from 'react-icons/fi';

const Header = ({ onLogout, onToggleSidebar, userData }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSystemNotifications, setShowSystemNotifications] = useState(false);
  const [showEmailNotifications, setShowEmailNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: 'email',
      title: 'New Email Message',
      message: 'You have received a new email from client@example.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      icon: <FiMail />
    },
    {
      id: 2,
      type: 'system',
      title: 'System Update',
      message: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      icon: <FiServer />
    },
    {
      id: 3,
      type: 'email',
      title: 'Newsletter Subscription',
      message: 'New subscriber joined your newsletter',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      icon: <FiMail />
    },
    {
      id: 4,
      type: 'system',
      title: 'Content Published',
      message: 'New article has been published to the website',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      icon: <FiServer />
    }
  ];

  useEffect(() => {
    if (userData?.profile_picture) {
      setProfilePicture(userData.profile_picture);
    }
    // Load notifications from localStorage or API
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(sampleNotifications);
    }
  }, [userData]);

  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);
  const toggleSystemNotifications = () => {
    setShowSystemNotifications(prev => !prev);
    setShowEmailNotifications(false);
  };
  const toggleEmailNotifications = () => {
    setShowEmailNotifications(prev => !prev);
    setShowSystemNotifications(false);
  };

  const emailNotifications = notifications.filter(notif => notif.type === 'email');
  const systemNotifications = notifications.filter(notif => notif.type === 'system');
  
  const unreadEmailCount = emailNotifications.filter(notif => !notif.read).length;
  const unreadSystemCount = systemNotifications.filter(notif => !notif.read).length;

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowSystemNotifications(false);
    setShowEmailNotifications(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = (type = null) => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      read: type ? (notif.type === type ? true : notif.read) : true
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = (type = null) => {
    if (type) {
      const updatedNotifications = notifications.filter(notif => notif.type !== type);
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } else {
      setNotifications([]);
      localStorage.removeItem('notifications');
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
        updateProfilePicture(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfilePicture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/update-profile-picture/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.user-profile')) {
        setShowProfileMenu(false);
      }
      if (showLogoutModal && !event.target.closest('.logout-modal')) {
        setShowLogoutModal(false);
      }
      if (showSystemNotifications && !event.target.closest('.system-notifications-container')) {
        setShowSystemNotifications(false);
      }
      if (showEmailNotifications && !event.target.closest('.email-notifications-container')) {
        setShowEmailNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showLogoutModal, showSystemNotifications, showEmailNotifications]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const user = {
    name: userData?.username || 'Admin User',
    email: userData?.email || 'admin@example.com',
    role: 'Administrator'
  };

  return (
    <>
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
            {/* System Notifications Bell */}
            <div className="system-notifications-container">
              <button 
                className="icon-btn system-notification-btn"
                onClick={toggleSystemNotifications}
              >
                <FiBell />
                {unreadSystemCount > 0 && <span className="badge system-badge">{unreadSystemCount}</span>}
              </button>

              {showSystemNotifications && (
                <div className="notifications-dropdown system-dropdown">
                  <div className="notifications-header">
                    <h3><FiServer /> System Notifications</h3>
                    <div className="notifications-actions">
                      <button onClick={() => markAllAsRead('system')} className="action-btn" title="Mark all as read">
                        <FiCheck />
                      </button>
                      <button onClick={() => clearAllNotifications('system')} className="action-btn" title="Clear all">
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="notifications-content">
                    {systemNotifications.length > 0 ? (
                      systemNotifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                          <div className="notification-icon">{notif.icon}</div>
                          <div className="notification-content">
                            <h5>{notif.title}</h5>
                            <p>{notif.message}</p>
                            <span className="notification-time">{formatTime(notif.timestamp)}</span>
                          </div>
                          {!notif.read && (
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className="mark-read-btn"
                              title="Mark as read"
                            >
                              <FiCheck />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-notifications">
                        <FiServer />
                        <p>No system notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Email Notifications Message Icon */}
            <div className="email-notifications-container">
              <button 
                className="icon-btn email-notification-btn"
                onClick={toggleEmailNotifications}
              >
                <FiMessageSquare />
                {unreadEmailCount > 0 && <span className="badge email-badge">{unreadEmailCount}</span>}
              </button>

              {showEmailNotifications && (
                <div className="notifications-dropdown email-dropdown">
                  <div className="notifications-header">
                    <h3><FiMail /> Email Notifications</h3>
                    <div className="notifications-actions">
                      <button onClick={() => markAllAsRead('email')} className="action-btn" title="Mark all as read">
                        <FiCheck />
                      </button>
                      <button onClick={() => clearAllNotifications('email')} className="action-btn" title="Clear all">
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="notifications-content">
                    {emailNotifications.length > 0 ? (
                      emailNotifications.map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                          <div className="notification-icon">{notif.icon}</div>
                          <div className="notification-content">
                            <h5>{notif.title}</h5>
                            <p>{notif.message}</p>
                            <span className="notification-time">{formatTime(notif.timestamp)}</span>
                          </div>
                          {!notif.read && (
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className="mark-read-btn"
                              title="Mark as read"
                            >
                              <FiCheck />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-notifications">
                        <FiMail />
                        <p>No email notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="user-profile">
            <div className="profile-container" onClick={toggleProfileMenu}>
              <div className="user-avatar">
                {profilePicture ? (
                  <img src={profilePicture} alt={user.name} className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    <FiUser />
                  </div>
                )}
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
                    {profilePicture ? (
                      <img src={profilePicture} alt={user.name} className="avatar-image" />
                    ) : (
                      <div className="avatar-placeholder large">
                        <FiUser />
                      </div>
                    )}
                    <label htmlFor="profile-picture-upload" className="avatar-upload-btn">
                      <FiCamera />
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                      />
                    </label>
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

                <button className="menu-item logout-item" onClick={handleLogoutClick}>
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <button className="mobile-logout-btn" onClick={handleLogoutClick}>
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="close-btn" onClick={handleCancelLogout}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to logout from the CMS system?</p>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;