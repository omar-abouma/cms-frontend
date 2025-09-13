// src/pages/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Sample content data
  const [content] = useState([
    { id: 1, title: 'Welcome Post', status: 'Published', date: '2023-05-15' },
    { id: 2, title: 'Product Update', status: 'Draft', date: '2023-05-10' },
    { id: 3, title: 'Company News', status: 'Published', date: '2023-05-05' }
  ]);

  return (
    <div className="dashboard-page">
      <main className="main-panel">
        {activeSection === 'dashboard' && (
          <div className="dashboard-section">
            <h2>Welcome to your CMS</h2>
            <div className="stats-container">
              <div className="stat-card">
                <h3>5</h3>
                <p>Published Posts</p>
              </div>
              <div className="stat-card">
                <h3>3</h3>
                <p>Draft Posts</p>
              </div>
              <div className="stat-card">
                <h3>128</h3>
                <p>Media Files</p>
              </div>
              <div className="stat-card">
                <h3>2</h3>
                <p>Active Users</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div className="content-section">
            <h2>Content Management</h2>
            <button className="add-content-btn">Add New Content</button>
            <table className="content-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {content.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>
                      <span className={`status ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'media' && (
          <div className="media-section">
            <h2>Media Library</h2>
            <p>Upload and manage your media files here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
