import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../assets/LandingPage.css";

const LandingPage = ({ onSignIn, onSignUp }) => {

  // Start animation library
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Scroll function for buttons/links
  const scrollToSection = (className) => {
    const section = document.querySelector(className);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">

      {/* NAVBAR */}
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


      {/* HERO SECTION */}
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

            <button
              className="btn btn-hero btn-secondary"
              onClick={() => scrollToSection(".flow-section")}
            >
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


      {/* HOW IT WORKS */}
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


      {/* CTA SECTION */}
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


      {/* FOOTER */}
      <footer className="landing-footer">

        <div className="footer-content">

          <div className="footer-section">
            <h4>Heart Lens</h4>
            <p>Advanced heart disease prediction through eye scan analysis</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a onClick={() => scrollToSection(".flow-section")}>
                  How It Works
                </a>
              </li>
              <li>
                <a onClick={() => scrollToSection(".benefits-section")}>
                  Benefits
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © 2026 Heart Lens. All rights reserved. Medical technology for better health outcomes.
          </p>
        </div>

      </footer>

    </div>
  );
};

export default LandingPage;