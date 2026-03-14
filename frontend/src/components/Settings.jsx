import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../assets/Settings.css';

const Settings = ({ user, onUserUpdate, onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    specialization: user?.specialization || '',
    phone: user?.phone || '',
    department: user?.department || '',
    yearsOfExperience: user?.yearsOfExperience || '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
  });

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to body when theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState('email');
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value;

    setProfileData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email is required';
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(profileData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    return errors;
  };

  const handleSaveProfile = () => {
    const errors = validateProfile();
    if (Object.keys(errors).length === 0) {
      const updatedUser = {
        ...user,
        ...profileData,
      };

      // Save to localStorage (in production, would call API)
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUserUpdate?.(updatedUser);
      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setProfileErrors(errors);
    }
  };

  const handleTwoFactorToggle = (isEnabled) => {
    if (isEnabled) {
      // Always show verification modal when turning on 2FA
      setVerificationSuccess(false);
      setVerificationCode('');
      setVerificationError('');
      setShowTwoFactorModal(true);
    } else {
      handlePrivacyChange('dataSharing', isEnabled);
    }
  };

  const handleSendVerificationCode = () => {
    // Simulate sending verification code
    setVerificationError('');
    setVerificationSuccess(true);
    // In production, this would call an API to send the code
    alert(`Verification code sent to ${twoFactorMethod === 'email' ? profileData.email : profileData.phone}`);
  };

  const handleVerifyCode = () => {
    // Simulate code verification (accept any 6-digit code)
    if (verificationCode.length === 6) {
      setTwoFactorVerified(true);
      setVerificationSuccess(false);
      setShowTwoFactorModal(false);
      handlePrivacyChange('dataSharing', true);
      setVerificationCode('');
      alert('Two-Factor Authentication enabled successfully!');
    } else {
      setVerificationError('Please enter a valid 6-digit verification code');
    }
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword.trim()) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword.trim()) errors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSavePassword = () => {
    const errors = validatePassword();
    if (Object.keys(errors).length === 0) {
      // Save to localStorage (in production, would call API)
      localStorage.setItem('userPassword', JSON.stringify({ newPassword: passwordData.newPassword }));
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
      }, 2000);
    } else {
      setPasswordErrors(errors);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <button className="btn btn-back" onClick={() => (onBack ? onBack() : window.history.back())}>
          ← Back
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="icon">👤</span>
              <span>Edit Profile</span>
            </button>
<button
              className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <span className="icon">🔒</span>
              <span>Privacy & Security</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="icon">🎨</span>
              <span>Theme</span>
            </button>
           
          </nav>
        </div>

        <div className="settings-panel">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-header">
                <h2>Edit Profile</h2>
                {!editMode && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="success-message">
                  ✓ Profile updated successfully!
                </div>
              )}

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={profileErrors.name ? 'error' : ''}
                    />
                    {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={profileErrors.email ? 'error' : ''}
                    />
                    {profileErrors.email && <span className="error-text">{profileErrors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      placeholder="Enter 10-digit phone number"
                      className={profileErrors.phone ? 'error' : ''}
                    />
                    {profileErrors.phone && <span className="error-text">{profileErrors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="specialization">Specialization</label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={profileData.specialization}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      placeholder="e.g., Ophthalmology, Cardiology"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="yearsOfExperience">Years of Experience</label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={profileData.yearsOfExperience}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      min="0"
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditMode(false);
                        setProfileErrors({});
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

{/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Security</h2>
              <p className="section-description">Manage your account security and authentication</p>

              <div className="security-list">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Change Password</h4>
                    <p>Update your account password regularly for better security</p>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security to your account</p>
                    {twoFactorVerified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={privacy.dataSharing}
                      onChange={(e) => handleTwoFactorToggle(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2>Appearance</h2>
              <p className="section-description">Customize the look and feel of the application</p>

              <div className="appearance-options">
                <div className="appearance-item">
                  <div className="appearance-info">
                    <h4>Dark Mode</h4>
                    <p>Switch between light and dark theme</p>
                    <span className={`theme-badge ${theme}`}>
                      {theme === 'dark' ? ' Dark Mode' : ' Light Mode'}
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={theme === 'dark'}
                      onChange={(e) => handleThemeChange(e.target.checked ? 'dark' : 'light')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          
        </div>
      </div>

      {/* Two-Factor Authentication Modal */}
      {showTwoFactorModal && (
        <div className="modal-overlay" onClick={() => setShowTwoFactorModal(false)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header">
              <h2>Enable Two-Factor Authentication</h2>
              <button 
                className="modal-close"
                onClick={() => setShowTwoFactorModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                To enable Two-Factor Authentication, please verify your identity by selecting a method and entering the verification code.
              </p>

              <div className="verification-methods">
                <label className="method-option">
                  <input
                    type="radio"
                    name="method"
                    value="email"
                    checked={twoFactorMethod === 'email'}
                    onChange={() => setTwoFactorMethod('email')}
                  />
                  <span className="method-label">
                    <span className="method-icon"></span>
                    <span>Email ({profileData.email})</span>
                  </span>
                </label>
                <label className="method-option">
                  <input
                    type="radio"
                    name="method"
                    value="phone"
                    checked={twoFactorMethod === 'phone'}
                    onChange={() => setTwoFactorMethod('phone')}
                  />
                  <span className="method-label">
                    <span className="method-icon"></span>
                    <span>Phone ({profileData.phone})</span>
                  </span>
                </label>
              </div>

              {!verificationSuccess ? (
                <button 
                  className="btn btn-primary full-width"
                  onClick={handleSendVerificationCode}
                >
                  Send Verification Code
                </button>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="verificationCode">Enter Verification Code</label>
                    <input
                      type="text"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className={verificationError ? 'error' : ''}
                      maxLength={6}
                    />
                    {verificationError && <span className="error-text">{verificationError}</span>}
                  </div>

                  <button 
                    className="btn btn-primary full-width"
                    onClick={handleVerifyCode}
                    disabled={verificationCode.length !== 6}
                  >
                    Verify & Enable 2FA
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="modal-header">
              <h2>Change Password</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ✕
              </button>
            </div>

            {passwordSuccess && (
              <div className="success-message">
                ✓ Password changed successfully!
              </div>
            )}

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.currentPassword ? 'error' : ''}
                />
                {passwordErrors.currentPassword && (
                  <span className="error-text">{passwordErrors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.newPassword ? 'error' : ''}
                />
                {passwordErrors.newPassword && (
                  <span className="error-text">{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={passwordErrors.confirmPassword ? 'error' : ''}
                />
                {passwordErrors.confirmPassword && (
                  <span className="error-text">{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSavePassword}
              >
                Update Password
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
