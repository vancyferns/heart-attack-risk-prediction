import React, { useState } from 'react';
import '../assets/Navigation.css';

const Navigation = ({ currentView, onNavigate, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <>
      <nav className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">👁️</div>
            {isOpen && <h2 className="logo-text">Heart Lens</h2>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className="user-profile">
          <button
            className="user-avatar"
            onClick={() => setShowProfile(true)}
            title="View profile"
            aria-label={`View profile for ${user.name}`}
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
          {isOpen && (
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role">Ophthalmologist</p>
            </div>
          )}
        </div>

        <nav className="nav-menu">
          <div className="nav-section">
            {isOpen && <p className="section-title">Main</p>}
            <NavItem
              icon="🏠"
              label="Dashboard"
              view="dashboard"
              currentView={currentView}
              onNavigate={onNavigate}
              isOpen={isOpen}
            />
            <NavItem
              icon="👤"
              label="Patient Details"
              view="patient-details"
              currentView={currentView}
              onNavigate={onNavigate}
              isOpen={isOpen}
            />
          </div>

          <div className="nav-section">
            {isOpen && <p className="section-title">Operations</p>}
            <NavItem
              icon="📸"
              label="Eye Scan"
              view="eye-scan"
              currentView={currentView}
              onNavigate={onNavigate}
              isOpen={isOpen}
            />
            <NavItem
              icon="📊"
              label="Results"
              view="results"
              currentView={currentView}
              onNavigate={onNavigate}
              isOpen={isOpen}
            />
          </div>

          <div className="nav-section">
            {isOpen && <p className="section-title">Management</p>}
            <NavItem
              icon="📋"
              label="History"
              view="history"
              currentView={currentView}
              onNavigate={onNavigate}
              isOpen={isOpen}
            />
            <NavItem
              icon="⚙️"
              label="Settings"
              view="settings"
              currentView={currentView}
              onNavigate={onNavigate}
              isOpen={isOpen}
            />
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            {isOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </nav>

      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      {showProfile && (
        <div className="profile-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="profile-center">
              <div className="profile-avatar-large">{user.name.charAt(0).toUpperCase()}</div>

              <div className="profile-field-inline">
                <span className="profile-label-inline">Name :</span>
                <span className="profile-value-inline">{user.name}</span>
              </div>

              <div className="profile-field-inline">
                <span className="profile-label-inline">Email :</span>
                <span className="profile-value-inline">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavItem = ({ icon, label, view, currentView, onNavigate, isOpen }) => {
  const isActive = currentView === view;

  return (
    <button
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={() => onNavigate(view)}
      title={label}
    >
      <span className="nav-icon">{icon}</span>
      {isOpen && <span className="nav-label">{label}</span>}
    </button>
  );
};

export default Navigation;
