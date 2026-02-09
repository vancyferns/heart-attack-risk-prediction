import React, { useState } from 'react';
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
  <div className="home-view">
    <div className="home-header">
      <h1>Welcome, {user.name}!</h1>
      <p className="subtitle">Ophthalmology Eye Scan & Heart Attack Risk Prediction System</p>
    </div>

    <div className="quick-actions">
      <div className="action-card">
        <div className="action-icon">👤</div>
        <h3>New Patient Scan</h3>
        <p>Register patient details and perform an eye scan for heart attack risk assessment</p>
        <button 
          className="action-btn btn-primary" 
          onClick={() => onNavigate('patient-details')}
        >
          Start Scan →
        </button>
      </div>

      <div className="action-card">
        <div className="action-icon">📊</div>
        <h3>View History</h3>
        <p>Review past scans and risk assessments</p>
        <button className="action-btn btn-secondary" onClick={() => onNavigate('history')}>
          View History →
        </button>
      </div>

      <div className="action-card">
        <div className="action-icon">📈</div>
        <h3>Analytics</h3>
        <p>View comprehensive statistics and trends</p>
        <button className="action-btn btn-secondary">
          View Analytics →
        </button>
      </div>
    </div>

    <div className="info-section">
      <h2>How it Works</h2>
      <div className="steps">
        <div className="step">
          <span className="step-number">1</span>
          <h4>Patient Registration</h4>
          <p>Enter patient details including name, age, and contact information</p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <h4>Eye Scan</h4>
          <p>Upload eye scan image for analysis using AI algorithms</p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <h4>Analysis</h4>
          <p>System analyzes the scan and predicts heart attack risk level</p>
        </div>
        <div className="step">
          <span className="step-number">4</span>
          <h4>Download Report</h4>
          <p>Generate and download comprehensive medical report</p>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;

const HistoryView = ({ onBack }) => {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://127.0.0.1:5000/api/records', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        setError('Failed to load history');
        console.error(err);
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
