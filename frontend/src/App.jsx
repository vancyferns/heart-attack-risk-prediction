import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';

function App() {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSwitch = (view) => {
    setIsLoginView(view === 'login');
  };

  return (
    <div className="App">
      {isLoginView ? (
        <LoginForm onSwitchToRegister={() => handleSwitch('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => handleSwitch('login')} />
      )}
    </div>
  );
}

export default App;