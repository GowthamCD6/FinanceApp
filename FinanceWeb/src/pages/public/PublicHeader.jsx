import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Menu, X, Lock } from 'lucide-react';
import logoImg from '../../assets/logo-tight.png';
import './PublicLayout.css';

export const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Security & Encryption', path: '/security' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`public-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="public-header-container">
        {/* Brand Logo */}
        <Link to="/" className="public-header-brand">
          <img src={logoImg} alt="Finance Portal" className="public-logo-img" />
          <div className="public-brand-text">
            <span className="brand-title">Finance Portal</span>
            <span className="brand-badge">SaaS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="public-nav-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`public-nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header CTA Actions */}
        <div className="public-header-actions">
          <Link to="/login" className="btn-public-login">
            <Lock size={15} />
            <span>Sign In</span>
          </Link>
          <button
            type="button"
            className="btn-public-launch"
            onClick={() => navigate('/login')}
          >
            <span>Deploy Portal</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="btn-public-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="public-mobile-drawer">
          <div className="public-mobile-nav-list">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`public-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="public-mobile-actions">
              <Link
                to="/login"
                className="btn-public-mobile-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In to Tenant Portal
              </Link>
              <button
                type="button"
                className="btn-public-mobile-launch"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Deploy Organization Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
