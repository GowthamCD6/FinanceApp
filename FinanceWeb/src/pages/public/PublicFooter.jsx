import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo-tight.png';
import singleBottomHeroImg from '../../assets/singleBottomhero.png';
import './PublicLayout.css';

export const PublicFooter = () => {
  return (
    <footer className="landing-footer public-page-footer" id="footer">
      {/* Ambient Cloud Wave Graphic Layer in the Background */}
      <div className="footer-cloud-bg" aria-hidden="true">
        <img src={singleBottomHeroImg} alt="" className="footer-cloud-img" />
        <div className="footer-cloud-overlay" />
      </div>

      <div className="standard-container footer-content-container">
        <div className="footer-top-grid">
          <div className="footer-brand-column">
            <div className="footer-brand-title">
              <img src={logoImg} alt="Finance Portal" className="footer-logo-img" />
              <span>Finance Portal SaaS</span>
            </div>
            <p className="footer-brand-desc">
              Enterprise multi-tenant cloud infrastructure for daily merchant advances, weekly chit funds, and centralized branch vault management.
            </p>
          </div>

          <div className="footer-nav-column">
            <h6>Multi-Tenant Platform</h6>
            <ul>
              <li><Link to="/#multi-tenancy">SuperAdmin Global Hub</Link></li>
              <li><Link to="/#multi-tenancy">Tenant Org Portal</Link></li>
              <li><Link to="/#multi-tenancy">Branch Cashier Safes</Link></li>
              <li><Link to="/#multi-tenancy">Field Mobile Fleet</Link></li>
            </ul>
          </div>

          <div className="footer-nav-column">
            <h6>Company & Legal</h6>
            <ul>
              <li><Link to="/about">About Us & Vision</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/security">Security & Encryption</Link></li>
            </ul>
          </div>

          <div className="footer-nav-column">
            <h6>Access & Help</h6>
            <ul>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/login">SuperAdmin Central Hub</Link></li>
              <li><Link to="/login">Tenant Admin Workspace</Link></li>
              <li><Link to="/login">Branch Manager Terminal</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} Finance Portal SaaS Inc. All tenant records are cryptographically isolated.</span>
          <div className="footer-legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/security">Tenant Data Encryption Standard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
