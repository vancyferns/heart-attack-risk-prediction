import React, { useState } from 'react';
import '../assets/PatientDetails.css';

const PatientDetails = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    contactNumber: '',
    address: '',
    medicalHistory: '',
    medications: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let normalizedValue = value;

    if (name === 'email') {
      normalizedValue = value.toLowerCase().replace(/\s+/g, '');
    }

    if (name === 'contactNumber') {
      normalizedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameValue = formData.name.trim();
    const ageValue = Number(formData.age);
    const emailValue = formData.email.trim();
    const phoneValue = formData.contactNumber.trim();
    const addressValue = formData.address.trim();

    const namePattern = /^[A-Za-z ]{2,}$/;
    const lowerCaseEmailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!nameValue) {
      newErrors.name = 'Name is required';
    } else if (!namePattern.test(nameValue)) {
      newErrors.name = 'Name should contain only letters and spaces';
    }

    if (!formData.age || Number.isNaN(ageValue)) {
      newErrors.age = 'Age is required';
    } else if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 120) {
      newErrors.age = 'Enter a valid age between 1 and 120';
    }

    if (!emailValue) {
      newErrors.email = 'Email is required';
    } else if (!lowerCaseEmailPattern.test(emailValue)) {
      newErrors.email = 'Enter a valid lowercase email (example: name@gmail.com)';
    }

    if (!phoneValue) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(phoneValue)) {
      newErrors.contactNumber = 'Contact number must be exactly 10 digits';
    }

    if (!addressValue) {
      newErrors.address = 'Address is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      // Simulate API call delay
      setTimeout(() => {
        onSubmit(formData);
        setIsSubmitting(false);
      }, 500);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="patient-details-container">
      <div className="details-header">
        <h1>Patient Registration</h1>
        <p>Enter patient information for the eye scan assessment</p>
      </div>

      <form className="patient-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient's full name"
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                min="1"
                max="120"
                disabled={isSubmitting}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number *</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                pattern="\d{10}"
                maxLength="10"
                disabled={isSubmitting}
              />
              {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter patient's address"
              rows="3"
              disabled={isSubmitting}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Medical Information</h2>

          <div className="form-group full-width">
            <label htmlFor="medicalHistory">Medical History</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter any relevant medical history (optional)"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="medications">Current Medications</label>
            <textarea
              id="medications"
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              placeholder="List any current medications (optional)"
              rows="3"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary back-btn"
            onClick={() => (onBack ? onBack() : window.history.back())}
            disabled={isSubmitting}
          >
            ← Back
          </button>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Proceed to Eye Scan →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientDetails;


