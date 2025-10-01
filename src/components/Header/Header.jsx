import React, { useState, useEffect } from 'react';
import zafiriLogo from "../../assets/zafiri.png";
import './Header.css';
import { FiLogOut, FiUser, FiBell, FiMessageSquare, FiMenu, FiChevronDown, FiSettings, FiCamera, FiX, FiMail, FiServer, FiCheck, FiEdit } from 'react-icons/fi';

const Header = ({ onLogout, onToggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile from backend or localStorage
  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (storedProfile) {
      setUserProfile(storedProfile);
      if (storedProfile.profile_picture) setProfilePicture(storedProfile.profile_picture);
    } else {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/user-profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        if (data.profile_picture) setProfilePicture(data.profile_picture);
        localStorage.setItem('userProfile', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userProfile');
    setShowLogoutModal(false);
    onLogout();
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await fetch('http://localhost:8000/api/profile-picture/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.profile_picture);
        const updatedProfile = { ...userProfile, profile_picture: data.profile_picture };
        setUserProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      } else {
        console.error('Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    const username = prompt('Enter new username:', userProfile?.username || '');
    const bio = prompt('Enter bio:', userProfile?.bio || '');
    const phone = prompt('Enter phone:', userProfile?.phone || '');
    if (username !== null && bio !== null && phone !== null) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/api/user-profile/', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bio, phone }),
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          localStorage.setItem('userProfile', JSON.stringify(data));
          alert('Profile updated successfully');
        } else {
          console.error('Failed to update profile');
        }
      } catch (err) {
        console.error('Update error:', err);
      }
    }
  };

  const user = {
    name: userProfile?.username || 'Admin User',
    email: userProfile?.email || 'admin@example.com',
    role: 'Administrator',
    bio: userProfile?.bio || '',
    phone: userProfile?.phone || '',
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar}><FiMenu /></button>
          <img src={zafiriLogo} alt="Zafiri Logo" className="logo-small" />
          <div className="header-title">
            <h1>CMS Dashboard</h1>
            <p>Welcome to your content management system</p>
          </div>
        </div>

        <div className="header-right">
          <div className="user-profile">
            <div className="profile-container" onClick={toggleProfileMenu}>
              <div className="user-avatar">
                {profilePicture ? <img src={profilePicture} alt={user.name} className="avatar-image" /> : <FiUser />}
                {loading && <div className="avatar-loading">Uploading...</div>}
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
                    {profilePicture ? <img src={profilePicture} alt={user.name} className="avatar-image" /> : <FiUser />}
                    <label htmlFor="profile-picture-upload" className="avatar-upload-btn">
                      <FiCamera />
                      <input id="profile-picture-upload" type="file" accept="image/*" onChange={handleProfilePictureChange} style={{ display: 'none' }} disabled={loading} />
                    </label>
                  </div>
                  <div className="user-details">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    {user.bio && <p>{user.bio}</p>}
                    {user.phone && <p>{user.phone}</p>}
                  </div>
                </div>

                <div className="menu-divider"></div>

                <button className="menu-item" onClick={handleEditProfile}><FiEdit /> Edit Profile</button>
                <button className="menu-item"><FiSettings /> Account Settings</button>

                <div className="menu-divider"></div>
                <button className="menu-item logout-item" onClick={handleLogoutClick}><FiLogOut /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="close-btn" onClick={handleCancelLogout}><FiX /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout from the CMS system?</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCancelLogout}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirmLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;