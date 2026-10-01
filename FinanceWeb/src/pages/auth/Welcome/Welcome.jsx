import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logoImg from '../../../assets/logo-tight.png';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
} from 'lucide-react';
import './Welcome.css';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Mouse coordinate state for 3D isometric parallax
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xOffset = (clientX / innerWidth - 0.5) * 8; // Subtle professional tilt
    const yOffset = (clientY / innerHeight - 0.5) * 8;
    setTilt({ x: xOffset, y: yOffset });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="qonto-welcome-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* --------------------------------------------------------------------
          1. TOP NAVBAR (Minimalist Qonto Style)
          -------------------------------------------------------------------- */}
      <header className="qonto-navbar">
        <div className="qonto-navbar-inner">
          <Link to="/" className="qonto-brand">
            <img src={logoImg} alt="Finance Portal" className="qonto-brand-logo" />
            <span className="qonto-brand-title">Finance</span>
          </Link>

          <nav>
            <ul className="qonto-nav-menu">
              <li className="qonto-nav-item"><a href="#products">Solutions</a></li>
              <li className="qonto-nav-item"><a href="#cards">Products</a></li>
              <li className="qonto-nav-item"><a href="#resources">Resources</a></li>
              <li className="qonto-nav-item"><a href="#metrics">Pricing</a></li>
            </ul>
          </nav>

          <div className="qonto-nav-actions">
            {isAuthenticated ? (
              <button
                type="button"
                className="qonto-btn-cta"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="qonto-btn-signin"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className="qonto-btn-cta"
                  onClick={() => navigate('/login')}
                >
                  Open an account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          2. HERO SECTION (Mirroring Reference Layout)
          -------------------------------------------------------------------- */}
      <section className="qonto-hero-section">
        {/* Left Column: Clear Bold Typography */}
        <div className="qonto-hero-left">
          <h1 className="qonto-hero-heading">
            All your business finances. In one app.
          </h1>

          <p className="qonto-hero-desc">
            Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
          </p>

          <button
            type="button"
            className="qonto-btn-hero"
            onClick={() => navigate('/login')}
          >
            <span>Discover our offers</span>
          </button>

          <span className="qonto-hero-subnote">
            From ₹0/month. Enterprise multi-tenant engine. Access with zero obligations.
          </span>
        </div>

        {/* Right Column: Isometric 3D Layered Hardware & Dashboard Showcase */}
        <div className="qonto-hero-right">
          <div
            className="qonto-isometric-stage"
            style={{
              transform: `rotateX(${50 + tilt.y}deg) rotateZ(${-35 + tilt.x}deg)`,
            }}
          >
            {/* Tilted Desktop/Tablet Dashboard Screen */}
            <div className="qonto-mockup-tablet">
              <div className="tablet-header-bar">
                <span className="tablet-title">Dashboard</span>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Active Portfolio</span>
              </div>

              <div className="tablet-metric-row">
                <div>
                  <span className="tablet-balance-lbl">Available balance</span>
                  <div className="tablet-balance-val">₹46,130.99</div>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                    +18.4% month-over-month
                  </span>
                </div>

                {/* Segmented Pastel Donut Chart */}
                <div className="tablet-donut-chart">
                  <div className="tablet-donut-inner" />
                </div>
              </div>

              {/* Minimal SVG Wave Graph */}
              <svg className="tablet-wave-graph" viewBox="0 0 380 45" fill="none">
                <path
                  d="M0 35 C 60 40, 100 15, 160 25 C 220 35, 270 5, 330 18 C 360 24, 375 10, 380 8"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 35 C 60 40, 100 15, 160 25 C 220 35, 270 5, 330 18 C 360 24, 375 10, 380 8 L 380 45 L 0 45 Z"
                  fill="rgba(99, 102, 241, 0.08)"
                />
              </svg>

              {/* Recent Transactions List */}
              <div className="tablet-transactions-list">
                <div className="tablet-tx-item">
                  <span>Merchant Daily Recovery</span>
                  <span className="tx-amount-green">+ ₹1,250.00</span>
                </div>
                <div className="tablet-tx-item">
                  <span>Weekly Chit Installment</span>
                  <span className="tx-amount-green">+ ₹2,500.00</span>
                </div>
              </div>
            </div>

            {/* Floating Tilted Smartphone Screen */}
            <div className="qonto-mockup-phone">
              <div className="phone-speaker-notch" />
              <div className="phone-balance-box">
                <span className="phone-balance-lbl">Total Recovery</span>
                <div className="phone-balance-num">₹46,130.99</div>
              </div>

              <div className="phone-mini-txs">
                <div className="phone-mini-row">
                  <span style={{ color: '#4B5563' }}>Saidapet Store</span>
                  <span style={{ color: '#059669' }}>+₹125</span>
                </div>
                <div className="phone-mini-row">
                  <span style={{ color: '#4B5563' }}>Mylapore Chit</span>
                  <span style={{ color: '#059669' }}>+₹625</span>
                </div>
                <div className="phone-mini-row">
                  <span style={{ color: '#4B5563' }}>Central Vault</span>
                  <span style={{ color: '#2563EB' }}>Sync</span>
                </div>
              </div>

              <div className="phone-bottom-nav">
                <span>Loans</span>
                <span style={{ color: '#111827', fontWeight: 800 }}>Vault</span>
                <span>Audit</span>
              </div>
            </div>

            {/* Floating Brushed Silver Card Behind */}
            <div className="qonto-floating-card-silver" />

            {/* Floating Matte Black Titanium Chip Card in Front */}
            <div className="qonto-floating-card-black">
              <div className="chip-gold" />
              <div className="card-num-preview">•••• 9767</div>
              <div className="card-brand-logo-text">Finance</div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3. THE 4 SIGNATURE QONTO PASTEL FEATURE CARDS
          -------------------------------------------------------------------- */}
      <section className="qonto-features-strip-section" id="products">
        <div className="qonto-cards-grid">
          {/* Card 1: Mint Pastel */}
          <div className="qonto-feature-card">
            <div className="qonto-card-banner banner-mint">
              <h3 className="qonto-card-title">Business Account & Cards</h3>
            </div>
            <div className="qonto-card-body">
              <p className="qonto-card-desc">
                From local IBANs to transfers, direct debits and cards: all you need to pay and get paid.
              </p>
              <div className="qonto-card-illustration">
                {/* Minimalist Isometric Card Reader SVG */}
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  {/* Card Terminal */}
                  <polygon points="15,40 50,22 85,40 50,58" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="15,40 50,58 50,68 15,50" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="50,58 85,40 85,50 50,68" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Card Inserting */}
                  <polygon points="35,15 70,-2 85,25 50,42" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="42" y1="20" x2="68" y2="7" stroke="#10B981" strokeWidth="3" />
                  <circle cx="65" cy="28" r="3" fill="#EF4444" />
                  <circle cx="72" cy="24" r="3" fill="#F59E0B" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Lemon Yellow Pastel */}
          <div className="qonto-feature-card">
            <div className="qonto-card-banner banner-lemon">
              <h3 className="qonto-card-title">Invoice Management</h3>
            </div>
            <div className="qonto-card-body">
              <p className="qonto-card-desc">
                Centralize invoices, payable & receivable. Enjoy fluid supplier and client payments.
              </p>
              <div className="qonto-card-illustration">
                {/* Minimalist Isometric Invoice Document SVG */}
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  {/* Folded Sheet Behind */}
                  <polygon points="25,25 60,10 80,45 45,60" fill="#F1F5F9" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Front Sheet */}
                  <polygon points="35,35 70,20 90,55 55,70" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Lines */}
                  <line x1="45" y1="36" x2="75" y2="23" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="48" y1="44" x2="72" y2="34" stroke="#CBD5E1" strokeWidth="2" />
                  {/* Checkmark Badge */}
                  <circle cx="35" cy="50" r="10" fill="#FEF08A" stroke="#0F172A" strokeWidth="1.5" />
                  <path d="M31 50 L34 53 L39 47" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Lavender Purple Pastel */}
          <div className="qonto-feature-card">
            <div className="qonto-card-banner banner-lavender">
              <h3 className="qonto-card-title">Expense & Spend Management</h3>
            </div>
            <div className="qonto-card-body">
              <p className="qonto-card-desc">
                Set customizable limits to make delegating team spending fast, safe and accountable.
              </p>
              <div className="qonto-card-illustration">
                {/* Minimalist Isometric Smartphone & Receipt SVG */}
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  {/* Base Receipt */}
                  <polygon points="30,45 65,30 85,60 50,75" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="42" y1="48" x2="70" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
                  {/* Floating Phone Screen */}
                  <polygon points="20,28 55,13 75,48 40,63" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Spend Limit Badge */}
                  <polygon points="45,8 70,-3 82,18 57,29" fill="#C084FC" stroke="#0F172A" strokeWidth="1.2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: Peach Orange Pastel */}
          <div className="qonto-feature-card">
            <div className="qonto-card-banner banner-peach">
              <h3 className="qonto-card-title">Bookkeeping & Reporting</h3>
            </div>
            <div className="qonto-card-body">
              <p className="qonto-card-desc">
                Automate receipt collection, auto-label transactions. Sync with your accounting tools.
              </p>
              <div className="qonto-card-illustration">
                {/* Minimalist Isometric 3-Drawer Cabinet SVG */}
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  {/* Top Roof */}
                  <polygon points="35,22 65,10 85,22 55,34" fill="#FED7AA" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Left Face */}
                  <polygon points="35,22 55,34 55,72 35,60" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Right Face (Drawers) */}
                  <polygon points="55,34 85,22 85,60 55,72" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Drawer Dividers */}
                  <line x1="55" y1="46" x2="85" y2="34" stroke="#0F172A" strokeWidth="1.2" />
                  <line x1="55" y1="58" x2="85" y2="46" stroke="#0F172A" strokeWidth="1.2" />
                  {/* Handles */}
                  <circle cx="70" cy="28" r="1.5" fill="#0F172A" />
                  <circle cx="70" cy="40" r="1.5" fill="#0F172A" />
                  <circle cx="70" cy="52" r="1.5" fill="#0F172A" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. INSTITUTIONAL METRICS SECTION
          -------------------------------------------------------------------- */}
      <section className="qonto-metrics-section" id="metrics">
        <div className="qonto-metrics-inner">
          <div className="qonto-metric-col">
            <div className="qonto-metric-number">₹2.4 Cr+</div>
            <div className="qonto-metric-label">Circulating capital actively deployed across borrowers</div>
          </div>

          <div className="qonto-metric-col">
            <div className="qonto-metric-number">99.4%</div>
            <div className="qonto-metric-label">On-time collection recovery across daily & weekly cycles</div>
          </div>

          <div className="qonto-metric-col">
            <div className="qonto-metric-number">12,800+</div>
            <div className="qonto-metric-label">Registered retail shopkeepers and verified chit borrowers</div>
          </div>

          <div className="qonto-metric-col">
            <div className="qonto-metric-number">0-Lag</div>
            <div className="qonto-metric-label">Real-time cryptographic double-entry ledger verification</div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. BOTTOM CONVERSION ACTION
          -------------------------------------------------------------------- */}
      <section className="qonto-bottom-cta">
        <h2 className="qonto-cta-heading">
          All your business finances in one place.
        </h2>
        <p className="qonto-cta-sub">
          Join modern institutions and microfinance organizations operating on the Finance Portal.
        </p>
        <button
          type="button"
          className="qonto-btn-hero"
          onClick={() => navigate('/login')}
        >
          <span>Open an account</span>
          <ArrowRight size={18} />
        </button>
      </section>

      {/* --------------------------------------------------------------------
          6. MINIMALIST FOOTER
          -------------------------------------------------------------------- */}
      <footer className="qonto-footer" id="resources">
        <div className="qonto-footer-inner">
          <div className="qonto-footer-left">
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF' }}>Finance</span>
            <span className="qonto-footer-copy">
              © {new Date().getFullYear()} Finance Portal. All rights reserved.
            </span>
          </div>

          <ul className="qonto-footer-links">
            <li><a href="#products">Solutions</a></li>
            <li><a href="#cards">Product</a></li>
            <li><a href="#resources">Resources</a></li>
            <li><a href="#metrics">Pricing</a></li>
            <li><Link to="/login">Sign in</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
