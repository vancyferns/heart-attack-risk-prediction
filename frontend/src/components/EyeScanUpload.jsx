import React, { useState } from 'react';
import axios from 'axios';
import '../assets/EyeScanUpload.css';

// Vite exposes env vars via `import.meta.env`. Use `VITE_` prefix for custom vars.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const EyeScanUpload = ({ onSubmit, patientData }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!allowedFormats.includes(file.type)) {
      setError('Invalid file format. Please upload JPG, PNG, or GIF.');
      return false;
    }
    if (file.size > maxFileSize) {
      setError('File size exceeds 10MB. Please choose a smaller file.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    // Create FormData to send image to backend
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');

    // Call the real ML prediction endpoint
    axios.post(`${API_BASE}/predict/image`, formData, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      const prediction = res.data.prediction;
      
      // Generate recommendations based on risk level
      let recommendations = [];
      if (prediction.risk_level === 'High') {
        recommendations = [
          'Immediate consultation with cardiologist recommended',
          'Schedule comprehensive cardiac assessment',
          'Monitor blood pressure regularly',
          'Consider stress test and ECG'
        ];
      } else if (prediction.risk_level === 'Medium') {
        recommendations = [
          'Schedule routine cardiac check-up',
          'Maintain healthy lifestyle habits',
          'Monitor cholesterol levels',
          'Regular exercise recommended'
        ];
      } else {
        recommendations = [
          'Continue maintaining healthy lifestyle',
          'Annual health check-up recommended',
          'Keep monitoring vital signs',
          'Stay physically active'
        ];
      }

      // Map backend prediction to the Results component shape
      const results = {
        riskLevel: prediction.risk_level,
        riskScore: prediction.risk_score,
        confidence: prediction.confidence,
        message: `Eye scan analysis indicates ${prediction.risk_level.toLowerCase()} risk for heart disease`,
        recommendations: recommendations,
        _recordId: res.data.record_id
      };

      onSubmit(results);
    })
    .catch(err => {
      console.error('Prediction failed:', err?.response?.data || err.message);
      setError(err?.response?.data?.msg || 'Analysis failed. Please try again or check if models are loaded.');
    })
    .finally(() => {
      setIsAnalyzing(false);
    });
  };

  return (
    <div className="eye-scan-container">
      <div className="scan-header">
        <h1>Eye Scan Upload</h1>
        <p>Upload eye scan image for heart attack risk analysis</p>
      </div>

      <div className="scan-info">
        <div className="patient-card">
          <h3>Patient Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name:</span>
              <span className="value">{patientData?.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Age:</span>
              <span className="value">{patientData?.age}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{patientData?.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Contact:</span>
              <span className="value">{patientData?.contactNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <form className="scan-form" onSubmit={handleSubmit}>
        <div className="upload-section">
          <div 
            className={`upload-area ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Eye scan preview" className="preview-image" />
                <div className="preview-actions">
                  <label htmlFor="file-input" className="change-btn">
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">📸</div>
                <h3>Upload Eye Scan Image</h3>
                <p>Drag and drop your eye scan image here</p>
                <p className="or-text">or</p>
                <label htmlFor="file-input" className="browse-btn">
                  Browse Files
                </label>
              </div>
            )}
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif"
              disabled={isAnalyzing}
              style={{ display: 'none' }}
            />
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <div className="upload-info">
            <h4>Image Requirements:</h4>
            <ul>
              <li>Format: JPG, PNG, or GIF</li>
              <li>Maximum file size: 10MB</li>
              <li>Clear, well-lit eye scan image recommended</li>
              <li>Minimum resolution: 512x512 pixels</li>
            </ul>
          </div>
        </div>

        <div className="scan-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!file || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                Analyzing... This may take a moment
              </>
            ) : (
              'Analyze Eye Scan →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EyeScanUpload;
