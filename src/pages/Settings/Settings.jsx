// Settings.jsx
import React, { useState } from "react";
import "./Settings.css";


const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: "ZAFIRI CMS",
    siteDescription: "Content Management System",
    adminEmail: "admin@zafiri.com",
    timezone: "UTC+0",
    dateFormat: "YYYY-MM-DD",
    itemsPerPage: 10,
    enableNotifications: true,
    maintenanceMode: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setMessage("Settings saved successfully!");
      setIsLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }, 1000);
  };

  return (
    <section className="content-form">
      <h3>System Settings</h3>
      
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Site Name</label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Site Description</label>
          <textarea
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>Admin Email</label>
          <input
            type="email"
            name="adminEmail"
            value={settings.adminEmail}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Timezone</label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="form-control"
            >
              <option value="UTC+0">UTC+0</option>
              <option value="UTC+1">UTC+1</option>
              <option value="UTC+2">UTC+2</option>
              <option value="UTC+3">UTC+3</option>
              <option value="UTC-5">UTC-5 (EST)</option>
              <option value="UTC-8">UTC-8 (PST)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date Format</label>
            <select
              name="dateFormat"
              value={settings.dateFormat}
              onChange={handleChange}
              className="form-control"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Items Per Page</label>
          <input
            type="number"
            name="itemsPerPage"
            value={settings.itemsPerPage}
            onChange={handleChange}
            className="form-control"
            min="5"
            max="100"
          />
        </div>
        
        <div className="form-check">
          <input
            type="checkbox"
            name="enableNotifications"
            checked={settings.enableNotifications}
            onChange={handleChange}
            className="form-check-input"
            id="notificationsCheck"
          />
          <label className="form-check-label" htmlFor="notificationsCheck">
            Enable Email Notifications
          </label>
        </div>
        
        <div className="form-check">
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={settings.maintenanceMode}
            onChange={handleChange}
            className="form-check-input"
            id="maintenanceCheck"
          />
          <label className="form-check-label" htmlFor="maintenanceCheck">
            Maintenance Mode
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Settings;