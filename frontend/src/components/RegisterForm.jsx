import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import '../assets/Forms.css';
import axios from 'axios';

const API_BASE_URL = 'https://super-acorn-r4w75j6xp67435v9p-5000.app.github.dev/api/auth';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // State for success message
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
      });

      // Assuming success returns a token
      localStorage.setItem('token', response.data.token);

      setMessage("✅ Registration successful! Please log in.");
      
      // Auto-switch to login after successful registration
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);


    } catch (err) {
      const errorMessage = err.response?.data?.msg;
      
      if (errorMessage === 'User already exists') {
        setError("User already exists. Please login or use a different email.");
      } else {
        setError(errorMessage || 'Registration failed. Check your data.');
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
          <h2>Create Account</h2>
          
          {/* Display Error/Success Messages */}
          {error && <p className="error-message">⚠️ {error}</p>}
          {message && <p className="success-message">{message}</p>}
          
          {/* ... (Form groups for Name, Email, Password, Confirm Password remain the same, 
              add disabled={isLoading} to inputs) ... */}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name"
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email-reg" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password-reg" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password"
              required 
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm your password"
              required 
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          
          <p className="switch-auth">
            Already have an account? 
            <span onClick={onSwitchToLogin}>Login here.</span>
          </p>
        </form>
      </div>
    </>
  );
};

export default RegisterForm;