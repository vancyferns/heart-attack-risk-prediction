import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, login, register, dashboard
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLoginSuccess = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('landing');
  };

  // Dashboard view when authenticated
  if (isAuthenticated && user && currentView === 'dashboard') {
    return (
      <Dashboard 
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Landing page view
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onSignIn={() => setCurrentView('login')}
        onSignUp={() => setCurrentView('register')}
      />
    );
  }

  // Authentication views
  return (
    <div className="App">
      {currentView === 'login' ? (
        <LoginForm 
          onSwitchToRegister={() => setCurrentView('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentView === 'register' ? (
        <RegisterForm 
          onSwitchToLogin={() => setCurrentView('login')}
        />
      ) : null}
    </div>
  );
}

export default App;
