import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../assets/LandingPage.css';

const LandingPage = ({ onSignIn, onSignUp }) => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleLearnMore = () => {
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFooterLink = (linkType) => {
    const scrollTargets = {
      features: '.features-section',
      flow: '.flow-section',
      benefits: '.benefits-section'
    };

    if (scrollTargets[linkType]) {
      const element = document.querySelector(scrollTargets[linkType]);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      alert(`${linkType.charAt(0).toUpperCase() + linkType.slice(1)} page would open here.`);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-icon">👁️</span>
          <span className="brand-name">Heart Lens</span>
        </div>
        <div className="nav-buttons">
          <button className="nav-btn signin-btn" onClick={onSignIn}>
            Sign In
          </button>
          <button className="nav-btn signup-btn" onClick={onSignUp}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Transforming Heart Care Through Eye Analysis
          </h1>
          <p className="hero-subtitle">
            Detect heart attack risks through innovative ophthalmology analysis and AI-powered predictions
          </p>
          <div className="hero-buttons">
            <button className="btn btn-hero btn-primary" onClick={onSignUp}>
              Get Started Now
            </button>
            <button className="btn btn-hero btn-secondary" onClick={handleLearnMore}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-graphic">
            <div className="graphic-element element-1">👁️</div>
            <div className="graphic-element element-2">❤️</div>
            <div className="graphic-element element-3">📊</div>
          </div>
        </div>
      </section>

      

      {/* How It Works Section */}
      <section className="flow-section">
        <h2>How It Works</h2>
        <div className="flow-diagram">
          <div className="flow-step">
            <div className="flow-icon">🔐</div>
            <h4>Authentication</h4>
            <p>Secure login/registration</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-icon">📋</div>
            <h4>Dashboard</h4>
            <p>View & manage patients</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-icon">👤</div>
            <h4>Patient Details</h4>
            <p>Register new patient</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-icon">📸</div>
            <h4>Eye Scan</h4>
            <p>Upload & process image</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-icon">📊</div>
            <h4>Results</h4>
            <p>View risk assessment</p>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <div className="flow-icon">📥</div>
            <h4>Download</h4>
            <p>Export report</p>
          </div>
        </div>
      </section>

      

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Why Choose Heart Lens?</h2>
        <div className="benefits-container">
          <div className="benefit-item">
            <div className="benefit-icon">✓</div>
            <h4>Early Detection</h4>
            <p>Detect heart disease indicators before symptoms appear through advanced eye scan analysis</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">✓</div>
            <h4>Non-Invasive</h4>
            <p>Simple eye scan procedure requires no blood tests or invasive procedures</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">✓</div>
            <h4>Cost Effective</h4>
            <p>Reduce healthcare costs with preventive screening and early intervention</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">✓</div>
            <h4>Patient Focused</h4>
            <p>Comprehensive reports empower patients to take preventive health measures</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of healthcare professionals using Heart Lens</p>
        <div className="cta-buttons">
          <button className="btn btn-cta btn-primary" onClick={onSignUp}>
            Create Account
          </button>
          <button className="btn btn-cta btn-secondary" onClick={onSignIn}>
            Already have an account? Sign In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Heart Lens</h4>
            <p>Advanced heart disease prediction through eye scan analysis</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a onClick={() => handleFooterLink('features')}>Features</a></li>
              <li><a onClick={() => handleFooterLink('flow')}>How It Works</a></li>
              <li><a onClick={() => handleFooterLink('benefits')}>Benefits</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a onClick={() => handleFooterLink('contact')}>Contact Us</a></li>
              <li><a onClick={() => handleFooterLink('help')}>Help Center</a></li>
              <li><a onClick={() => handleFooterLink('privacy')}>Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a onClick={() => handleFooterLink('terms')}>Terms of Service</a></li>
              <li><a onClick={() => handleFooterLink('privacy')}>Privacy Policy</a></li>
              <li><a onClick={() => handleFooterLink('disclaimer')}>Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Heart Lens. All rights reserved. Medical technology for better health outcomes.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
