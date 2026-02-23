import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import '../assets/Forms.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // State for error messages
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store both token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Pass both token and user to the success handler
      onLoginSuccess(token, user);
      
    } catch (err) {
      // Handles 400/401 responses from the backend (e.g., 'Invalid Credentials')
      const errorMessage = err.response?.data?.msg || 'Login failed. Check your network.';
      
      // Specifically target "user doesn't exist" (which comes as 'Invalid Credentials' from the backend)
      if (errorMessage.includes('Invalid Credentials')) {
        setError('Login failed. The email or password may be incorrect.');
      } else {
        setError(errorMessage);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          
          {/* Display Error Message */}
          {error && <p className="error-message">⚠️ {error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field-wrapper">
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
                disabled={isLoading}
              />
              <span className="visibility-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
            </div>
          </div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <p className="switch-auth">
            Don't have an account? 
            <span onClick={onSwitchToRegister}>Register here.</span>
          </p>
        </form>
      </div>
    </>
  );
};

export default LoginForm;