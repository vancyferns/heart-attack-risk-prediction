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

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const pdfContent = generatePDFContent();
      const fileName = `Heart_Attack_Risk_Report_${new Date().toISOString().split('T')[0]}.txt`;
      
      // Try to use File System Access API for "Save As" dialog
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'Text Files',
              accept: { 'text/plain': ['.txt'] },
            }, {
              description: 'PDF Files',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          });
          
          const writable = await handle.createWritable();
          await writable.write(pdfContent);
          await writable.close();
          alert('Report saved successfully!');
        } catch (err) {
          // User cancelled the dialog
          if (err.name !== 'AbortError') {
            console.error('Error saving file:', err);
            throw err;
          }
        }
      } else {
        // Fallback for browsers without File System Access API
        // Create a blob and trigger download
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Report downloaded successfully!');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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

      {/* Analysis Message, Recommendations and Risk Indicators removed per request */}

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
