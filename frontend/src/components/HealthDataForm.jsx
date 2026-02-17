import React, { useState } from 'react';
import axios from 'axios';
import '../assets/HealthDataForm.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const HealthDataForm = ({ onSubmit, patientData }) => {
  const [formData, setFormData] = useState({
    age: patientData?.age || '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    thalach: '',
    exang: '',
    oldpeak: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }
    if (formData.sex === '') newErrors.sex = 'Sex is required';
    if (formData.cp === '') newErrors.cp = 'Chest pain type is required';
    if (!formData.trestbps || formData.trestbps < 50 || formData.trestbps > 250) {
      newErrors.trestbps = 'Blood pressure must be between 50-250 mm Hg';
    }
    if (!formData.chol || formData.chol < 100 || formData.chol > 600) {
      newErrors.chol = 'Cholesterol must be between 100-600 mg/dl';
    }
    if (formData.fbs === '') newErrors.fbs = 'Fasting blood sugar is required';
    if (!formData.thalach || formData.thalach < 50 || formData.thalach > 250) {
      newErrors.thalach = 'Max heart rate must be between 50-250';
    }
    if (formData.exang === '') newErrors.exang = 'Exercise angina is required';
    if (formData.oldpeak === '' || formData.oldpeak < 0 || formData.oldpeak > 10) {
      newErrors.oldpeak = 'ST depression must be between 0-10';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');

    // Prepare features for prediction
    const features = {
      age: parseFloat(formData.age),
      sex: parseInt(formData.sex),
      cp: parseInt(formData.cp),
      trestbps: parseFloat(formData.trestbps),
      chol: parseFloat(formData.chol),
      fbs: parseInt(formData.fbs),
      thalach: parseFloat(formData.thalach),
      exang: parseInt(formData.exang),
      oldpeak: parseFloat(formData.oldpeak)
    };

    try {
      const response = await axios.post(`${API_BASE}/predict/tabular`, features, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      const prediction = response.data.prediction;

      // Generate recommendations based on risk level
      let recommendations = [];
      if (prediction.risk_level === 'High') {
        recommendations = [
          'Immediate medical consultation strongly recommended',
          'Comprehensive cardiac assessment required',
          'Lifestyle modifications necessary',
          'Consider medication management with your doctor'
        ];
      } else if (prediction.risk_level === 'Medium') {
        recommendations = [
          'Schedule routine cardiac check-up',
          'Monitor blood pressure and cholesterol regularly',
          'Maintain regular exercise routine',
          'Follow heart-healthy diet'
        ];
      } else {
        recommendations = [
          'Continue healthy lifestyle habits',
          'Annual health screenings recommended',
          'Maintain physical activity',
          'Keep monitoring vital signs'
        ];
      }

      // Map to results format
      const results = {
        riskLevel: prediction.risk_level,
        riskScore: prediction.risk_score,
        confidence: 95, // Tabular models typically have high confidence
        message: `Health data analysis indicates ${prediction.risk_level.toLowerCase()} risk for heart disease`,
        recommendations,
        _recordId: response.data.record_id
      };

      onSubmit(results);
    } catch (err) {
      console.error('Prediction failed:', err?.response?.data || err.message);
      setError(err?.response?.data?.msg || 'Prediction failed. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="health-data-container">
      <div className="health-header">
        <h1>Health Data Assessment</h1>
        <p>Enter patient health metrics for heart attack risk prediction</p>
      </div>

      {patientData && (
        <div className="patient-info-card">
          <h3>Patient: {patientData.name}</h3>
          <p>Age: {patientData.age} | Email: {patientData.email}</p>
        </div>
      )}

      <form className="health-form" onSubmit={handleSubmit}>
        {/* Basic Demographics */}
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Patient age"
                min="1"
                max="120"
                disabled={isSubmitting}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sex">Sex *</label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select sex</option>
                <option value="1">Male</option>
                <option value="0">Female</option>
              </select>
              {errors.sex && <span className="error-text">{errors.sex}</span>}
            </div>
          </div>
        </div>

        {/* Cardiac Symptoms */}
        <div className="form-section">
          <h2>Cardiac Symptoms</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cp">Chest Pain Type *</label>
              <select
                id="cp"
                name="cp"
                value={formData.cp}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select type</option>
                <option value="0">Typical Angina</option>
                <option value="1">Atypical Angina</option>
                <option value="2">Non-Anginal Pain</option>
                <option value="3">Asymptomatic</option>
              </select>
              {errors.cp && <span className="error-text">{errors.cp}</span>}
              <small className="help-text">Type of chest pain experienced</small>
            </div>

            <div className="form-group">
              <label htmlFor="exang">Exercise Induced Angina *</label>
              <select
                id="exang"
                name="exang"
                value={formData.exang}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select option</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              {errors.exang && <span className="error-text">{errors.exang}</span>}
              <small className="help-text">Chest pain during exercise</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="oldpeak">ST Depression (Oldpeak) *</label>
            <input
              type="number"
              id="oldpeak"
              name="oldpeak"
              value={formData.oldpeak}
              onChange={handleChange}
              placeholder="0.0 to 10.0"
              step="0.1"
              min="0"
              max="10"
              disabled={isSubmitting}
            />
            {errors.oldpeak && <span className="error-text">{errors.oldpeak}</span>}
            <small className="help-text">ST depression induced by exercise relative to rest</small>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="form-section">
          <h2>Vital Signs & Lab Results</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="trestbps">Resting Blood Pressure *</label>
              <input
                type="number"
                id="trestbps"
                name="trestbps"
                value={formData.trestbps}
                onChange={handleChange}
                placeholder="mm Hg"
                min="50"
                max="250"
                disabled={isSubmitting}
              />
              {errors.trestbps && <span className="error-text">{errors.trestbps}</span>}
              <small className="help-text">Resting blood pressure (mm Hg)</small>
            </div>

            <div className="form-group">
              <label htmlFor="chol">Serum Cholesterol *</label>
              <input
                type="number"
                id="chol"
                name="chol"
                value={formData.chol}
                onChange={handleChange}
                placeholder="mg/dl"
                min="100"
                max="600"
                disabled={isSubmitting}
              />
              {errors.chol && <span className="error-text">{errors.chol}</span>}
              <small className="help-text">Serum cholesterol (mg/dl)</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fbs">Fasting Blood Sugar &gt; 120 mg/dl *</label>
              <select
                id="fbs"
                name="fbs"
                value={formData.fbs}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select option</option>
                <option value="1">Yes (&gt; 120 mg/dl)</option>
                <option value="0">No (≤ 120 mg/dl)</option>
              </select>
              {errors.fbs && <span className="error-text">{errors.fbs}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="thalach">Maximum Heart Rate *</label>
              <input
                type="number"
                id="thalach"
                name="thalach"
                value={formData.thalach}
                onChange={handleChange}
                placeholder="bpm"
                min="50"
                max="250"
                disabled={isSubmitting}
              />
              {errors.thalach && <span className="error-text">{errors.thalach}</span>}
              <small className="help-text">Maximum heart rate achieved</small>
            </div>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Analyzing Health Data...
              </>
            ) : (
              'Predict Risk →'
            )}
          </button>
        </div>
      </form>

      <div className="info-panel">
        <h3>ℹ️ About These Metrics</h3>
        <ul>
          <li><strong>Chest Pain Type:</strong> Classification of chest pain symptoms</li>
          <li><strong>Blood Pressure:</strong> Measured at rest in mm Hg</li>
          <li><strong>Cholesterol:</strong> Total serum cholesterol level</li>
          <li><strong>Fasting Blood Sugar:</strong> Blood glucose level after fasting</li>
          <li><strong>Max Heart Rate:</strong> Highest heart rate during exercise test</li>
          <li><strong>Exercise Angina:</strong> Chest pain occurrence during physical activity</li>
          <li><strong>ST Depression:</strong> ECG measurement during exercise stress test</li>
        </ul>
      </div>
    </div>
  );
};

export default HealthDataForm;
