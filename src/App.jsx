// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import News from './pages/News/News';
import Events from './pages/Events/Events';
import Gallery from './pages/Gallery/Gallery';
import Researches from './pages/Researches/Researches';
import Projects from './pages/Projects/Projects';
import Publications from './pages/Publications/Publications';
import Services from './pages/Services/Services';
import Settings from './pages/Settings/Settings';

import Layout from './components/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (token && storedUserData) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUserData));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loginData) => {
    setIsAuthenticated(true);
    setUserData({
      userId: loginData.user_id,
      username: loginData.username,
      email: loginData.email
    });
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset state
    setIsAuthenticated(false);
    setUserData(null);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login */}
          <Route 
            path="/login" 
            element={
              isAuthenticated 
                ? <Navigate to="/dashboard" replace /> 
                : <Login onLogin={handleLogin} />
            } 
          />

          {/* Redirect root (/) to /dashboard */}
          <Route 
            path="/" 
            element={
              isAuthenticated 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/login" replace />
            } 
          />

          {/* Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Other protected pages */}
          <Route 
            path="/news" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <News />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/events" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Events />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/gallery" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Gallery />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/researches" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Researches />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/projects" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Projects />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/publications" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Publications />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/services" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Services />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/settings" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <Settings />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch all route - redirect to dashboard if authenticated, else to login */}
          <Route 
            path="*" 
            element={
              isAuthenticated 
                ? <Navigate to="/dashboard" replace /> 
                : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;