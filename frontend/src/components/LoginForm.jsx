import React, { useEffect, useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import '../assets/Forms.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // State for error messages
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('resetToken');

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setShowResetModal(true);
      setError('');
      setInfo('Reset link detected. Set your new password.');
    }
  }, []);

  const openForgotPasswordModal = () => {
    setError('');
    setInfo('');
    setForgotEmail(email);
    setShowForgotModal(true);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotModal(false);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');

    const url = new URL(window.location.href);
    url.searchParams.delete('resetToken');
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!forgotEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email: forgotEmail,
      });

      setInfo(response.data?.msg || 'If that email exists, a password reset link has been sent.');
      setShowForgotModal(false);
    } catch (err) {
      const apiMessage = err.response?.data?.msg;
      if (apiMessage) {
        setError(apiMessage);
      } else {
        setInfo(`Password reset link request received for: ${forgotEmail}`);
        setShowForgotModal(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
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

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!resetToken.trim()) {
      setError('Reset token is missing. Please use the reset link from email.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        token: resetToken,
        new_password: newPassword,
      });

      setInfo(response.data?.msg || 'Password updated successfully. Please log in.');
      closeResetModal();
    } catch (err) {
      const apiMessage = err.response?.data?.msg;
      setError(apiMessage || 'Unable to reset password. Please try again.');
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
          {info && <p className="success-message">ℹ️ {info}</p>}

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
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="button"
              className="forgot-password-link"
              onClick={openForgotPasswordModal}
              disabled={isLoading}
            >
              Forgot password?
            </button>
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

      {showForgotModal && (
        <div className="forgot-modal-backdrop" onClick={closeForgotPasswordModal}>
          <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Forgot Password</h3>
            <p>Enter your email to get a password reset link.</p>
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="forgot-modal-actions">
                <button
                  type="button"
                  className="secondary-link-btn"
                  onClick={closeForgotPasswordModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="forgot-modal-backdrop" onClick={closeResetModal}>
          <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Set New Password</h3>
            <p>Enter your new password and confirm it to complete reset.</p>
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-new-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="forgot-modal-actions">
                <button
                  type="button"
                  className="secondary-link-btn"
                  onClick={closeResetModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;