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
import StaffManagement from './pages/StaffManagement/StaffManagement';
import OrganizationStructure from "./pages/Organizationstructure/Organizationstructure";
import HomeManagement from "./pages/HomeManagement/HomeManagement";


import Layout from './components/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUserData = localStorage.getItem('userData');
      
      if (token && storedUserData) {
        // Verify token is still valid by making a simple API call
        try {
          const response = await fetch('http://localhost:8000/api/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userDataFromApi = await response.json();
            setIsAuthenticated(true);
            setUserData(userDataFromApi);
            // Update localStorage with fresh user data
            localStorage.setItem('userData', JSON.stringify(userDataFromApi));
          } else if (response.status === 401) {
            // Token might be expired, try to refresh it
            await refreshToken();
          } else {
            console.error('Auth check failed with status:', response.status);
            handleLogout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          handleLogout();
        }
      } else {
        // No token or user data found
        handleLogout();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        
        // Get updated user data
        const userResponse = await fetch('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${data.access}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsAuthenticated(true);
          setUserData(userData);
          localStorage.setItem('userData', JSON.stringify(userData));
          return true;
        } else {
          throw new Error('Failed to fetch user profile after token refresh');
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      handleLogout();
      return false;
    }
  };

  const handleLogin = async (loginData) => {
    // loginData should contain { access, refresh, user }
    localStorage.setItem('access_token', loginData.access);
    localStorage.setItem('refresh_token', loginData.refresh);
    localStorage.setItem('userData', JSON.stringify(loginData.user));
    
    setIsAuthenticated(true);
    setUserData(loginData.user);
  };

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
            path="/home-management"
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <HomeManagement />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
           }
         />
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
            path="/organization-structure" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <OrganizationStructure />
                </Layout>
             ) : (
               <Navigate to="/login" replace />
          )
        } 
        />

          <Route 
            path="/staffmanagement" 
            element={
              isAuthenticated ? (
                <Layout onLogout={handleLogout} userData={userData}>
                  <StaffManagement />
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