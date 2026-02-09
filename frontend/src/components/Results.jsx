import React, { useState } from 'react';
import '../assets/Results.css';

const Results = ({ results, patientData, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#007bff';
    }
  };

  const getRiskLevelBg = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#ffe5e5';
      case 'medium':
        return '#fff3cd';
      case 'low':
        return '#e8f5e9';
      default:
        return '#e3f2fd';
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate PDF generation and download
    setTimeout(() => {
      const pdfContent = generatePDFContent();
      console.log('Downloading report:', pdfContent);
      setIsDownloading(false);
      // In a real app, you would trigger actual PDF download here
      alert('Report downloaded successfully!');
    }, 1500);
  };

  const generatePDFContent = () => {
    return `
      HEART ATTACK RISK PREDICTION REPORT
      Generated: ${new Date().toLocaleDateString()}
      
      PATIENT INFORMATION
      Name: ${patientData?.name}
      Age: ${patientData?.age}
      Email: ${patientData?.email}
      Contact: ${patientData?.contactNumber}
      
      ANALYSIS RESULTS
      Risk Level: ${results?.riskLevel}
      Risk Score: ${results?.riskScore}%
      Confidence: ${results?.confidence}%
      
      RECOMMENDATIONS
      ${results?.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
    `;
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Analysis Results</h1>
        <p>Heart Attack Risk Prediction Report</p>
      </div>

      <div className="results-grid">
        {/* Risk Level Card */}
        <div 
          className="result-card risk-card"
          style={{ backgroundColor: getRiskLevelBg(results?.riskLevel) }}
        >
          <div className="card-icon">⚠️</div>
          <h3>Risk Level</h3>
          <p 
            className="risk-level"
            style={{ color: getRiskLevelColor(results?.riskLevel) }}
          >
            {results?.riskLevel}
          </p>
        </div>

        {/* Risk Score Card */}
        <div className="result-card score-card">
          <div className="card-icon">📊</div>
          <h3>Risk Score</h3>
          <div className="score-circle">
            <svg viewBox="0 0 100 100" className="score-svg">
              <circle cx="50" cy="50" r="45" className="score-bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="score-progress"
                style={{
                  strokeDasharray: `${(results?.riskScore / 100) * 282.7} 282.7`
                }}
              />
            </svg>
            <p className="score-text">{results?.riskScore}%</p>
          </div>
        </div>

        {/* Confidence Card */}
        <div className="result-card confidence-card">
          <div className="card-icon">✓</div>
          <h3>Confidence Level</h3>
          <p className="confidence-value">{results?.confidence}%</p>
          <p className="confidence-label">AI Model Confidence</p>
        </div>
      </div>

      {/* Patient Information */}
      <div className="patient-summary">
        <h2>Patient Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Patient Name</span>
            <span className="summary-value">{patientData?.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Age</span>
            <span className="summary-value">{patientData?.age} years</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Email</span>
            <span className="summary-value">{patientData?.email}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Contact</span>
            <span className="summary-value">{patientData?.contactNumber}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Address</span>
            <span className="summary-value">{patientData?.address}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Analysis Date</span>
            <span className="summary-value">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Analysis Message */}
      <div className="analysis-message">
        <h2>Analysis Overview</h2>
        <p className="message-text">{results?.message}</p>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>Recommendations</h2>
        <div className="recommendations-list">
          {results?.recommendations?.map((rec, index) => (
            <div key={index} className="recommendation-item">
              <div className="rec-icon">→</div>
              <p>{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="risk-indicators">
        <h2>Risk Indicators</h2>
        <div className="indicators-grid">
          <div className="indicator">
            <span className="indicator-label">Eye Fundus Changes</span>
            <div className="indicator-bar">
              <div className="indicator-fill" style={{ width: '75%' }}></div>
            </div>
            <span className="indicator-value">75% Risk</span>
          </div>
          <div className="indicator">
            <span className="indicator-label">Vessel Abnormalities</span>
            <div className="indicator-bar">
              <div className="indicator-fill" style={{ width: '62%' }}></div>
            </div>
            <span className="indicator-value">62% Risk</span>
          </div>
          <div className="indicator">
            <span className="indicator-label">Microaneurysms</span>
            <div className="indicator-bar">
              <div className="indicator-fill" style={{ width: '45%' }}></div>
            </div>
            <span className="indicator-value">45% Risk</span>
          </div>
          <div className="indicator">
            <span className="indicator-label">Retinal Changes</span>
            <div className="indicator-bar">
              <div className="indicator-fill" style={{ width: '58%' }}></div>
            </div>
            <span className="indicator-value">58% Risk</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button 
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <span className="spinner"></span>
              Generating Report...
            </>
          ) : (
            '📥 Download Report'
          )}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onReset}
        >
          🔄 Start New Scan
        </button>
      </div>
    </div>
  );
};

export default Results;
