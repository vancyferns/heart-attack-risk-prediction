import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import PatientDetails from './PatientDetails';
import EyeScanUpload from './EyeScanUpload';
import Results from './Results';
import '../assets/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [patientData, setPatientData] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handlePatientDataSubmit = (data) => {
    setPatientData(data);
    setCurrentView('eye-scan');
  };

  const handleScanUpload = (scanData) => {
    setScanResults(scanData);
    setCurrentView('results');
  };

  const handleReset = () => {
    setCurrentView('dashboard');
    setPatientData(null);
    setScanResults(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'patient-details':
        return <PatientDetails onSubmit={handlePatientDataSubmit} />;
      case 'eye-scan':
        return <EyeScanUpload onSubmit={handleScanUpload} patientData={patientData} />;
      case 'results':
        return (
          <Results 
            results={scanResults} 
            patientData={patientData}
            onReset={handleReset}
          />
        );
      case 'history':
        return <HistoryView onBack={() => setCurrentView('dashboard')} />;
      case 'analytics':
        return <AnalyticsView onBack={() => setCurrentView('dashboard')} />;
      default:
        return <HomeView onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <div className="dashboard-container">
      <Navigation 
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={onLogout}
      />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

const HomeView = ({ onNavigate, user }) => (
  <motion.div
    className="home-view"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <motion.div
      className="home-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h1>Welcome, {user.name}!</h1>
      <p className="subtitle">Ophthalmology Eye Scan & Heart Attack Risk Prediction System</p>
    </motion.div>

    <motion.div
      className="quick-actions"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <motion.div
        className="action-card"
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="action-icon">👤</div>
        <span className="icon-label">New Patient</span>
        <h3>New Patient Scan</h3>
        <p>Register patient details and perform an eye scan for heart attack risk assessment</p>
        <button
          className="action-btn btn-primary"
          onClick={() => onNavigate('patient-details')}
        >
          Start Scan →
        </button>
      </motion.div>

      <motion.div
        className="action-card"
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="action-icon">📊</div>
        <span className="icon-label">History</span>
        <h3>View History</h3>
        <p>Review past scans and risk assessments</p>
        <button className="action-btn btn-secondary" onClick={() => onNavigate('history')}>
          View History →
        </button>
      </motion.div>

      <motion.div
        className="action-card"
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="action-icon">📈</div>
        <span className="icon-label">Analytics</span>
        <h3>Analytics</h3>
        <p>View comprehensive statistics and trends</p>
        <button className="action-btn btn-secondary" onClick={() => onNavigate('analytics')}>
          View Analytics →
        </button>
      </motion.div>
    </motion.div>

    <motion.div
      className="info-section"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <h2>How it Works</h2>
      <motion.div
        className="steps"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.div
          className="step"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-number">1</span>
          <h4>Patient Registration</h4>
          <p>Enter patient details including name, age, and contact information</p>
        </motion.div>
        <motion.div
          className="step"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-number">2</span>
          <h4>Eye Scan</h4>
          <p>Upload eye scan image for analysis using AI algorithms</p>
        </motion.div>
        <motion.div
          className="step"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-number">3</span>
          <h4>Analysis</h4>
          <p>System analyzes the scan and predicts heart attack risk level</p>
        </motion.div>
        <motion.div
          className="step"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="step-number">4</span>
          <h4>Download Report</h4>
          <p>Generate and download comprehensive medical report</p>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export default Dashboard;

const AnalyticsView = ({ onBack }) => {
  const [stats, setStats] = React.useState({
    totalScans: 0,
    averageRiskScore: 0,
    highRiskCount: 0,
    lowRiskCount: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://127.0.0.1:5000/api/records', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const records = await res.json();
        
        const totalScans = records.length;
        const avgRisk = totalScans > 0 
          ? Math.round(records.reduce((sum, r) => sum + r.risk_score, 0) / totalScans)
          : 0;
        const highRisk = records.filter(r => r.risk_score >= 70).length;
        const lowRisk = records.filter(r => r.risk_score < 40).length;
        
        setStats({
          totalScans,
          averageRiskScore: avgRisk,
          highRiskCount: highRisk,
          lowRiskCount: lowRisk
        });
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <button className="btn" onClick={onBack}>← Back</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="analytics-grid">
          <div className="stat-card">
            <h3>Total Scans</h3>
            <p className="stat-value">{stats.totalScans}</p>
          </div>
          <div className="stat-card">
            <h3>Average Risk Score</h3>
            <p className="stat-value">{stats.averageRiskScore}%</p>
          </div>
          <div className="stat-card">
            <h3>High Risk Cases</h3>
            <p className="stat-value" style={{ color: '#dc3545' }}>{stats.highRiskCount}</p>
          </div>
          <div className="stat-card">
            <h3>Low Risk Cases</h3>
            <p className="stat-value" style={{ color: '#28a745' }}>{stats.lowRiskCount}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryView = ({ onBack }) => {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching records with token:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch('http://127.0.0.1:5000/api/records', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          console.error('❌ Fetch error:', res.status, errorData);
          throw new Error(`Status ${res.status}: ${errorData}`);
        }
        
        const data = await res.json();
        console.log('✅ Records fetched:', data.length);
        setRecords(data);
      } catch (err) {
        console.error('❌ Error fetching records:', err);
        if (err.message.includes('401')) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load history');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>Scan History</h2>
        <button className="btn" onClick={onBack}>← Back</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="history-list">
          {records.length === 0 ? (
            <p>No records found.</p>
          ) : (
            records.map(r => (
              <div key={r.id} className="history-item">
                <div className="history-meta">
                  <strong>{r.prediction_result}</strong>
                  <span>{new Date(r.date_submitted).toLocaleString()}</span>
                </div>
                <div className="history-body">
                  <span>Risk Score: {r.risk_score}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
