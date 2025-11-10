import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';

function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSwitch = (view) => {
    setIsLoginView(view === 'login');
  };

  const handleLoginSuccess = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoginView(true);
  };

  if (isAuthenticated && user) {
    return (
      <div className="App">
        <div className="dashboard">
          <h1>Welcome, {user.name}!</h1>
          <button onClick={handleLogout}>Logout</button>
          {/* Add your dashboard content here */}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isLoginView ? (
        <LoginForm 
          onSwitchToRegister={() => handleSwitch('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterForm 
          onSwitchToLogin={() => handleSwitch('login')}
        />
      )}
    </div>
  );
}

export default App;