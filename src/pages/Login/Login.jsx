import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import zafiriLogo from "../../assets/zafiri.png";
import zafiriBackground from "../../assets/zafiribackground.jpg";
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setLoginError('');
      
      try {
        // Make API call to Django backend
        const response = await fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Login successful
          console.log('Login successful:', data);
          
          // Store the authentication token
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userData', JSON.stringify({
            userId: data.user_id,
            username: data.username,
            email: data.email
          }));
          
          // Update authentication state
          onLogin(data);
          
          // Navigate to dashboard
          navigate('/dashboard');
        } else {
          // Login failed
          setLoginError(data.error || 'Invalid username or password');
          console.error('Login failed:', data);
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('Network error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${zafiriBackground})` }}>
      <div className="login-card">
        <div className="login-header">
          <img src={zafiriLogo} alt="Zafiri Logo" className="logo" />
          <h1>CMS-SYSTEM</h1>
          <p>Admin Portal Login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}
          
          <button 
            type="submit" 
            className={`login-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Enter your admin credentials to login</p>
        </div>
      </div>
    </div>
  );
};

export default Login;