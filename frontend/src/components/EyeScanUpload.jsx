import React, { useState } from 'react';
import axios from 'axios';
import '../assets/EyeScanUpload.css';

// Vite exposes env vars via `import.meta.env`. Use `VITE_` prefix for custom vars.
const API_BASE = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname.includes('devtunnels.ms')
    ? 'https://cw0xw4lf-5000.inc1.devtunnels.ms/api'
    : 'http://127.0.0.1:5000/api'
);

const EyeScanUpload = ({ onSubmit, patientData, onBack }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const allowedFormats = ['image/jpeg', 'image/png'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    const lowerName = file.name?.toLowerCase() || '';
    const hasValidExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!allowedFormats.includes(file.type) || !hasValidExtension) {
      setError('Invalid file format. Please upload retinal images in JPG or PNG format only.');
      return false;
    }
    if (file.size > maxFileSize) {
      setError('File size exceeds 10MB. Please choose a smaller file.');
      return false;
    }
    return true;
  };

  const validateRetinalImage = (selectedFile) => {
    return new Promise((resolve) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(selectedFile);

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 180;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(image, 0, 0, sampleSize, sampleSize);

        const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
        let borderPixelCount = 0;
        let darkBorderPixelCount = 0;
        let centerPixelCount = 0;
        let centerLuminanceTotal = 0;
        let centerRedDominanceTotal = 0;

        const centerX = sampleSize / 2;
        const centerY = sampleSize / 2;
        const radius = sampleSize * 0.34;

        for (let y = 0; y < sampleSize; y += 1) {
          for (let x = 0; x < sampleSize; x += 1) {
            const index = (y * sampleSize + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

            const isBorder = x < 16 || y < 16 || x > sampleSize - 16 || y > sampleSize - 16;
            if (isBorder) {
              borderPixelCount += 1;
              if (luminance < 70) darkBorderPixelCount += 1;
            }

            const dx = x - centerX;
            const dy = y - centerY;
            const inCenterCircle = dx * dx + dy * dy <= radius * radius;
            if (inCenterCircle) {
              centerPixelCount += 1;
              centerLuminanceTotal += luminance;
              centerRedDominanceTotal += (r - (g + b) / 2);
            }
          }
        }

        const darkBorderRatio = borderPixelCount > 0 ? darkBorderPixelCount / borderPixelCount : 0;
        const avgCenterLuminance = centerPixelCount > 0 ? centerLuminanceTotal / centerPixelCount : 0;
        const avgRedDominance = centerPixelCount > 0 ? centerRedDominanceTotal / centerPixelCount : 0;

        URL.revokeObjectURL(objectUrl);

        const looksRetinal = darkBorderRatio > 0.35 && avgCenterLuminance > 35 && avgCenterLuminance < 210 && avgRedDominance > 5;

        if (!looksRetinal) {
          resolve({
            isValid: false,
            message: 'Please upload a clear retinal eye scan image only. Other image types are not accepted.'
          });
          return;
        }

        resolve({ isValid: true });
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          isValid: false,
          message: 'Unable to read this image. Please upload a valid retinal JPG or PNG image.'
        });
      };

      image.src = objectUrl;
    });
  };

  const processSelectedFile = async (selectedFile) => {
    if (!selectedFile || !validateFile(selectedFile)) return;

    const retinalValidation = await validateRetinalImage(selectedFile);
    if (!retinalValidation.isValid) {
      setFile(null);
      setPreview(null);
      setError(retinalValidation.message);
      return;
    }

    setFile(selectedFile);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    await processSelectedFile(selectedFile);
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

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    await processSelectedFile(droppedFile);
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
    formData.append('patient_name', patientData?.name || '');

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
              accept="image/jpeg,image/png"
              disabled={isAnalyzing}
              style={{ display: 'none' }}
            />
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          <div className="upload-info">
            <h4>Image Requirements:</h4>
            <ul>
              <li>Format: JPG, PNG</li>
              <li>Image type: Retinal eye scan only</li>
              <li>Maximum file size: 10MB</li>
              
  
            </ul>
          </div>
        </div>

        <div className="scan-actions">
          <button
            type="button"
            className="btn btn-secondary back-btn"
            onClick={() => (onBack ? onBack() : window.history.back())}
            disabled={isAnalyzing}
          >
            ← Back
          </button>

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
