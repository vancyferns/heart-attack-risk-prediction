import React, { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import '../assets/Forms.css';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <>
      <AnimatedBackground />
      <div className="form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
          </div>
          
          <button type="submit" className="submit-btn">Login</button>
          
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