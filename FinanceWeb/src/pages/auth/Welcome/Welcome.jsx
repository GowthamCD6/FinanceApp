import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logoImg from '../../../assets/logo-tight.png';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Lock,
  ChevronDown,
  Server,
  Key,
  Shield,
  Smartphone,
  Radio,
  RotateCcw,
  Sparkles,
  TrendingUp,
  CreditCard,
  Zap,
} from 'lucide-react';
import './Welcome.css';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // --------------------------------------------------------------------------
  // SCROLL-AWARE DYNAMIC HEADER STATE
  // --------------------------------------------------------------------------
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollY / docHeight) * 100)));
      }

      const sections = ['hero', 'card-studio', 'route-telemetry', 'vault-chamber', 'calculator', 'security', 'faq'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll helper for top navigation
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --------------------------------------------------------------------------
  // 1. HERO 3D ISOMETRIC PARALLAX TILT
  // --------------------------------------------------------------------------
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xOffset = (clientX / innerWidth - 0.5) * 8;
    const yOffset = (clientY / innerHeight - 0.5) * 8;
    setHeroTilt({ x: xOffset, y: yOffset });
  };

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0 });
  };

  // --------------------------------------------------------------------------
  // 2. 3D CARD STUDIO: BESPOKE HARDWARE CARDS
  // --------------------------------------------------------------------------
  const [activeCardTier, setActiveCardTier] = useState('obsidian'); // obsidian | emerald | gold | cobalt
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardShine, setCardShine] = useState({ x: 50, y: 50, opacity: 0 });
  const [nfcBeaming, setNfcBeaming] = useState(false);

  const cardTiers = {
    obsidian: {
      name: 'Matte Obsidian Titanium',
      badge: 'ENTERPRISE SOVEREIGN',
      tagline: 'Heavy aerospace titanium with cold-engraved cryptographic tenant keys',
      accentColor: '#10B981',
      gradient: 'linear-gradient(135deg, #242731 0%, #16181F 50%, #0D0F14 100%)',
      border: 'rgba(255, 255, 255, 0.18)',
      cardNum: '•••• 9842',
      holder: 'KUMAR FINANCIALS',
      limit: '₹50,00,000 / day',
    },
    emerald: {
      name: 'Emerald Bazaar Merchant',
      badge: 'RETAIL ROUTE TERMINAL',
      tagline: 'High-resilience polycarbonate for daily market collectors',
      accentColor: '#34D399',
      gradient: 'linear-gradient(135deg, #064E3B 0%, #032E24 60%, #021D17 100%)',
      border: 'rgba(52, 211, 153, 0.45)',
      cardNum: '•••• 5120',
      holder: 'BAZAAR AGENT #08',
      limit: '₹5,00,000 / day',
    },
    gold: {
      name: 'Rose Gold Sovereign Vault',
      badge: 'TREASURY & GOVERNANCE',
      tagline: 'Electrum alloy with dual-custody cryptographic approval',
      accentColor: '#F59E0B',
      gradient: 'linear-gradient(135deg, #572A0D 0%, #38154D 60%, #1E1226 100%)',
      border: 'rgba(245, 158, 11, 0.45)',
      cardNum: '•••• 8801',
      holder: 'CENTRAL TREASURY',
      limit: '₹1,50,00,000 / day',
    },
    cobalt: {
      name: 'Royal Cobalt Fleet',
      badge: 'MULTI-BRANCH DISBURSAL',
      tagline: 'Luminescent core with instant field-freeze protocol',
      accentColor: '#60A5FA',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0F2042 60%, #040E24 100%)',
      border: 'rgba(96, 165, 250, 0.45)',
      cardNum: '•••• 3390',
      holder: 'BRANCH SOUTH #03',
      limit: '₹25,00,000 / day',
    },
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    const rotX = -((y / rect.height - 0.5) * 20);
    const rotY = (x / rect.width - 0.5) * 20;

    setCardRotation({ x: rotX, y: rotY });
    setCardShine({ x: xPercent, y: yPercent, opacity: 0.75 });
  };

  const handleCardMouseLeave = () => {
    setCardRotation({ x: 0, y: 0 });
    setCardShine({ x: 50, y: 50, opacity: 0 });
  };

  const triggerNfcBeam = () => {
    setNfcBeaming(true);
    setTimeout(() => setNfcBeaming(false), 1400);
  };

  // --------------------------------------------------------------------------
  // 3. 3D ISOMETRIC ROUTE & BAZAAR TELEMETRY STATION
  // --------------------------------------------------------------------------
  const [routeSpeed, setRouteSpeed] = useState('STANDARD'); // 'STANDARD' | 'ACCELERATED'
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(2);
  const [lastPaymentToast, setLastPaymentToast] = useState('Selvi Groceries · Installment +₹125.00 matched');

  const waypoints = [
    { id: 1, name: 'Saidapet Bazaar #01', type: 'Vegetable Mandi', amount: '₹125', status: 'CLEARED', x: 18, y: 28 },
    { id: 2, name: 'Mylapore Tank #04', type: 'Provision Store', amount: '₹250', status: 'CLEARED', x: 42, y: 22 },
    { id: 3, name: 'T. Nagar Hub #07', type: 'Textile Mart', amount: '₹500', status: 'IN_TRANSIT', x: 68, y: 35 },
    { id: 4, name: 'Purasawalkam #09', type: 'Stationery Works', amount: '₹125', status: 'PENDING', x: 82, y: 62 },
    { id: 5, name: 'George Town #12', type: 'Wholesale Dryfruits', amount: '₹375', status: 'PENDING', x: 55, y: 78 },
    { id: 6, name: 'Triplicane High #15', type: 'Tea Stall', amount: '₹125', status: 'PENDING', x: 26, y: 68 },
  ];

  useEffect(() => {
    const intervalTime = routeSpeed === 'ACCELERATED' ? 2200 : 4200;
    const timer = setInterval(() => {
      setCurrentWaypointIdx((prev) => {
        const next = (prev + 1) % waypoints.length;
        const wp = waypoints[next];
        setLastPaymentToast(`${wp.name} · ${wp.type} (+${wp.amount}) Verified`);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [routeSpeed]);

  // --------------------------------------------------------------------------
  // 4. 3D SOVEREIGN VAULT GYRO-GIMBAL STATE
  // --------------------------------------------------------------------------
  const [vaultPulseMode, setVaultPulseMode] = useState('NORMAL'); // 'COLLECT' | 'DISBURSE' | 'NORMAL'
  const [vaultStats, setVaultStats] = useState({
    activeBalance: '₹48,20,500.00',
    dayInflow: '+ ₹3,84,250',
    dayOutflow: '- ₹2,15,000',
    reconciledRate: '100.0%',
    blockHash: '0x8f2d...91c4',
  });

  const triggerCollectionSimulation = () => {
    setVaultPulseMode('COLLECT');
    setVaultStats((prev) => ({
      ...prev,
      activeBalance: '₹48,21,750.00',
      dayInflow: '+ ₹3,85,500',
      blockHash: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
    }));
    setTimeout(() => setVaultPulseMode('NORMAL'), 2500);
  };

  const triggerDisbursalSimulation = () => {
    setVaultPulseMode('DISBURSE');
    setVaultStats((prev) => ({
      ...prev,
      activeBalance: '₹48,06,750.00',
      dayOutflow: '- ₹2,30,000',
      blockHash: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
    }));
    setTimeout(() => setVaultPulseMode('NORMAL'), 2500);
  };

  // --------------------------------------------------------------------------
  // 5. LOAN SIMULATOR CALCULATIONS
  // --------------------------------------------------------------------------
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcFrequency, setCalcFrequency] = useState('WEEKLY');
  const [calcTenure, setCalcTenure] = useState(10);

  const interestRate = calcFrequency === 'DAILY' ? 25 : calcFrequency === 'WEEKLY' ? 25 : 20;
  const totalInterest = Math.round(calcAmount * (interestRate / 100));
  const totalRepayable = calcAmount + totalInterest;
  const emiAmount = Math.round(totalRepayable / calcTenure);

  // --------------------------------------------------------------------------
  // 6. FAQ ACCORDION
  // --------------------------------------------------------------------------
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How does daily merchant collection calculate interest and tenure?',
      a: 'The daily merchant module is calibrated for typical 100-day bazaar cycles (e.g. ₹10,000 principal disbursed yields ₹12,500 total repayment at ₹125/day). Both the tenure and interest rate are fully configurable by branch admins.',
    },
    {
      q: 'Can field agents collect payments on mobile devices offline without cellular signal?',
      a: 'Yes. Our companion mobile app stores encrypted SQLite records locally. Field agents can collect cash, print 58mm thermal receipts via Bluetooth, and auto-sync records to the central cloud once connectivity is restored.',
    },
    {
      q: 'How does multi-tenant branch separation work?',
      a: 'Every organization is isolated with strict cryptographic tenant boundaries. Branch managers only access borrowers, collectors, and cash vaults assigned to their specific physical branch, while SuperAdmins retain 360-degree governance.',
    },
    {
      q: 'What hardware biometric security is supported?',
      a: 'The system natively interfaces with Android BiometricPrompt and iOS LocalAuthentication for fingerprint and FaceID sensor unlock, automatically locking when backgrounded to prevent unauthorized field access.',
    },
    {
      q: 'How does the "Settlement at Last Date" feature operate?',
      a: 'On maturity or during early closure, our engine automatically computes the remaining balance minus any waived interest for early settlement, instantly generating a zero-dues certificate.',
    },
    {
      q: 'Is there direct WhatsApp messaging integration?',
      a: 'Yes. Automated WhatsApp messages dispatch verified payment receipts, balance alerts, and zero-dues clearance certificates directly to the borrower upon each transaction.',
    },
  ];

  return (
    <div className="qonto-welcome-container">
      {/* --------------------------------------------------------------------
          1. TOP NAVBAR: EXECUTIVE FINTECH NAVIGATION
          -------------------------------------------------------------------- */}
      <header className={`qonto-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="navbar-scroll-progress" style={{ width: `${scrollProgress}%` }} />
        <div className="qonto-navbar-inner">
          <Link to="/" className="qonto-brand">
            <div className="brand-logo-glow-wrapper">
              <img src={logoImg} alt="Finance Portal" className="qonto-brand-logo" />
            </div>
            <div className="brand-title-wrap">
              <span className="qonto-brand-name">Finance</span>
              <span className="brand-badge-pill">ENTERPRISE</span>
            </div>
          </Link>

          <nav className="qonto-nav-links">
            {[
              { id: 'hero', label: 'Features' },
              { id: 'card-studio', label: 'Smart Cards' },
              { id: 'route-telemetry', label: 'Route Telemetry' },
              { id: 'vault-chamber', label: 'Sovereign Vault' },
              { id: 'calculator', label: 'Loan Simulator' },
              { id: 'security', label: 'Security' },
              { id: 'faq', label: 'FAQ' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link-item ${activeSection === item.id ? 'is-active' : ''}`}
                onClick={(e) => scrollToSection(e, item.id)}
              >
                <span>{item.label}</span>
                {activeSection === item.id && <span className="nav-active-pip" />}
              </a>
            ))}
          </nav>

          <div className="qonto-nav-actions">
            <Link to="/login" className="qonto-btn-text">
              Sign in
            </Link>
            <button
              type="button"
              className="qonto-btn-nav-primary"
              onClick={() => navigate('/login')}
            >
              <span>Open an account</span>
              <ArrowRight size={14} className="nav-btn-arrow" />
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          2. HERO SECTION & 3D ISOMETRIC FLAGSHIP SHOWCASE
          -------------------------------------------------------------------- */}
      <section
        className="qonto-hero-section"
        id="hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <div className="qonto-hero-grid">
          {/* Left Text & CTA */}
          <div className="qonto-hero-left">
            <div className="qonto-hero-badge">
              <span className="badge-dot-live" />
              <span>ENTERPRISE LENDING & RECOVERY ENGINE</span>
            </div>

            <h1 className="qonto-hero-title">
              All your business finances.{' '}
              <span className="qonto-title-gradient">In one app.</span>
            </h1>

            <p className="qonto-hero-sub">
              Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
            </p>

            <div className="qonto-hero-cta-group">
              <button
                type="button"
                className="qonto-btn-hero"
                onClick={() => navigate('/login')}
              >
                <span>Discover our offers</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="qonto-btn-hero-ghost"
                onClick={(e) => scrollToSection(e, 'card-studio')}
              >
                <CreditCard size={18} color="#10B981" />
                <span>Smart Card Studio</span>
              </button>
            </div>

            <div className="qonto-hero-microcopy">
              From ₹0/month. Enterprise multi-tenant engine. Access with zero obligations.
            </div>
          </div>

          {/* Right 3D Lottie-Style Visual Stage */}
          <div className="qonto-hero-right-stage">
            <div
              className="hero-lottie-stage"
              style={{
                transform: `rotateX(${10 - heroTilt.y}deg) rotateY(${-14 + heroTilt.x}deg) rotateZ(1deg)`,
              }}
            >
              {/* Radial Lighting Aura behind 3D models */}
              <div className="hero-stage-ambient-glow" />

              {/* Central Active Banking Tablet (White Ceramic Chassis with Live Functional UI) */}
              <div className="lottie-tablet-chassis">
                <div className="tablet-screen-header">
                  <div className="screen-header-left">
                    <span className="header-status-indicator" />
                    <span className="header-title-text">Executive Dashboard</span>
                  </div>
                  <div className="screen-header-right">
                    <span className="status-pill-green">Live Active Portfolio</span>
                    <div className="circular-progress-badge">
                      <span>99.4%</span>
                    </div>
                  </div>
                </div>

                <div className="tablet-screen-body">
                  <div className="screen-metric-row">
                    <div className="metric-label-small">Available Treasury Balance</div>
                    <div className="metric-amount-primary">₹48,20,500.00</div>
                    <div className="metric-trend-tag">
                      <TrendingUp size={14} />
                      <span>+18.4% this month</span>
                    </div>
                  </div>

                  {/* Animated Lottie-Style SVG Chart Wave */}
                  <div className="screen-chart-box">
                    <svg viewBox="0 0 420 110" className="hero-chart-svg">
                      <defs>
                        <linearGradient id="emeraldLottieGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,85 Q 70,30 140,55 T 280,25 T 420,40 L 420,110 L 0,110 Z"
                        fill="url(#emeraldLottieGrad)"
                      />
                      <path
                        d="M 0,85 Q 70,30 140,55 T 280,25 T 420,40"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.5"
                        className="chart-animated-path"
                      />
                      <circle cx="280" cy="25" r="5" fill="#10B981" />
                      <circle cx="280" cy="25" r="9" fill="none" stroke="#34D399" strokeWidth="2" opacity="0.6">
                        <animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  </div>

                  <div className="screen-cards-strip">
                    <div className="screen-mini-stat">
                      <span className="mini-stat-label">Daily Route</span>
                      <span className="mini-stat-val">₹1,85,250</span>
                    </div>
                    <div className="screen-mini-stat">
                      <span className="mini-stat-label">Active Loans</span>
                      <span className="mini-stat-val">1,248</span>
                    </div>
                    <div className="screen-mini-stat">
                      <span className="mini-stat-label">Disbursal Lag</span>
                      <span className="mini-stat-val">0ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dangling Card 1: Matte Obsidian Titanium Card */}
              <div className="lottie-card-dangle-anchor lottie-card-obsidian">
                <div className="card-light-sheen" />
                <div className="hero-card-top-row">
                  <div className="hero-card-chip" />
                  <Radio size={18} color="rgba(255, 255, 255, 0.75)" />
                </div>
                <div className="hero-card-number">••••  9842</div>
                <div className="hero-card-footer">
                  <span>ENTERPRISE SOVEREIGN</span>
                  <span className="hero-card-brand">Finance</span>
                </div>
              </div>

              {/* Dangling Card 2: Emerald Sovereign Smart Card */}
              <div className="lottie-card-dangle-anchor lottie-card-emerald">
                <div className="card-light-sheen" />
                <div className="hero-card-top-row">
                  <div className="hero-card-chip emerald-chip" />
                  <Radio size={18} color="rgba(255, 255, 255, 0.85)" />
                </div>
                <div className="hero-card-number">••••  5120</div>
                <div className="hero-card-footer">
                  <span>DAILY ROUTE TERMINAL</span>
                  <span className="hero-card-brand">Finance</span>
                </div>
              </div>

              {/* Floating Lottie Telemetry Badges */}
              <div className="lottie-telemetry-badge badge-top-left">
                <div className="badge-glow-dot" />
                <div className="badge-content">
                  <span className="badge-micro-title">DAILY ROUTE DISBURSAL</span>
                  <span className="badge-main-val">+₹1,85,250 Cleared (0ms Lag)</span>
                </div>
              </div>

              <div className="lottie-telemetry-badge badge-bottom-right">
                <ShieldCheck size={20} color="#10B981" />
                <div className="badge-content">
                  <span className="badge-micro-title">DOUBLE-ENTRY LEDGER</span>
                  <span className="badge-main-val">100.0% Reconciled Zero-Leakage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3. 3D SMART CARD STUDIO: BESPOKE HARDWARE CARDS
          -------------------------------------------------------------------- */}
      <section className="card-studio-section" id="card-studio">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">INTERACTIVE HARDWARE SUITE</div>
          <h2 className="qonto-section-intro-title">Institutional titanium & merchant smart cards</h2>
          <p className="qonto-section-intro-desc">
            Equip collection agents and branch treasuries with cryptographic hardware cards linked directly to branch cash limits.
          </p>
        </div>

        <div className="card-studio-container">
          {/* Left Controls & Specifications */}
          <div className="card-studio-left">
            <div className="tier-pills-row">
              {Object.keys(cardTiers).map((tierKey) => (
                <button
                  key={tierKey}
                  type="button"
                  className={`tier-pill-btn ${activeCardTier === tierKey ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCardTier(tierKey);
                    setCardFlipped(false);
                  }}
                >
                  {cardTiers[tierKey].badge}
                </button>
              ))}
            </div>

            <h3 className="tier-name-heading">
              {cardTiers[activeCardTier].name}
            </h3>
            <p className="tier-tagline">
              {cardTiers[activeCardTier].tagline}
            </p>

            <div className="tier-specs-grid">
              <div className="tier-spec-card">
                <span className="spec-label">CARD LIMIT</span>
                <span className="spec-val" style={{ color: cardTiers[activeCardTier].accentColor }}>
                  {cardTiers[activeCardTier].limit}
                </span>
              </div>
              <div className="tier-spec-card">
                <span className="spec-label">CHIP TECHNOLOGY</span>
                <span className="spec-val">EMV Dual Interface + Contactless NFC</span>
              </div>
              <div className="tier-spec-card">
                <span className="spec-label">HARDWARE BIOMETRICS</span>
                <span className="spec-val">Sensors paired to collector device</span>
              </div>
              <div className="tier-spec-card">
                <span className="spec-label">SECURITY ACTION</span>
                <span className="spec-val" style={{ color: '#10B981' }}>Instant 0-Lag Remote Freeze</span>
              </div>
            </div>

            <div className="card-actions-row">
              <button
                type="button"
                className="btn-flip-card"
                onClick={() => setCardFlipped(!cardFlipped)}
              >
                <RotateCcw size={16} />
                <span>{cardFlipped ? 'View Front Face' : 'Flip to Back (CVV)'}</span>
              </button>

              <button
                type="button"
                className="btn-beam-nfc"
                onClick={triggerNfcBeam}
              >
                <Radio size={16} />
                <span>Simulate Contactless Beam</span>
              </button>

              <button
                type="button"
                className="qonto-btn-hero"
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
                onClick={() => navigate('/login')}
              >
                <span>Request Card</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right 3D Realistic Card Stage */}
          <div className="card-studio-right-stage">
            <div className="card-stand-pedestal">
              <div
                className={`realistic-3d-card-rig ${cardFlipped ? 'is-flipped' : ''}`}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={{
                  transform: cardFlipped
                    ? `rotateY(180deg) rotateX(${cardRotation.x}deg)`
                    : `rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                }}
              >
                {/* NFC Beaming Wave effect */}
                {nfcBeaming && <div className="card-nfc-beaming-waves" />}

                {/* Card Front Face */}
                <div
                  className="card-face card-front"
                  style={{
                    background: cardTiers[activeCardTier].gradient,
                    borderColor: cardTiers[activeCardTier].border,
                  }}
                >
                  <div
                    className="card-dynamic-shine"
                    style={{
                      background: `radial-gradient(circle at ${cardShine.x}% ${cardShine.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 65%)`,
                      opacity: cardShine.opacity,
                    }}
                  />

                  <div className="card-front-top">
                    {/* Realistic Gold EMV Chip */}
                    <div className="card-emv-gold-chip">
                      <div className="chip-line horizontal" />
                      <div className="chip-line vertical" />
                      <div className="chip-center-pin" />
                    </div>

                    <div className="card-contactless-icon">
                      <Radio size={22} color="rgba(255, 255, 255, 0.8)" />
                    </div>
                  </div>

                  <div className="card-front-number">
                    {cardTiers[activeCardTier].cardNum}
                  </div>

                  <div className="card-front-bottom">
                    <div className="card-holder-info">
                      <span className="holder-label">CARDHOLDER</span>
                      <span className="holder-name">{cardTiers[activeCardTier].holder}</span>
                    </div>

                    <div className="card-expiry-info">
                      <span className="expiry-label">EXPIRES</span>
                      <span className="expiry-val">10/29</span>
                    </div>

                    <div className="card-brand-logo">
                      Finance
                    </div>
                  </div>
                </div>

                {/* Card Back Face */}
                <div
                  className="card-face card-back"
                  style={{
                    background: cardTiers[activeCardTier].gradient,
                    borderColor: cardTiers[activeCardTier].border,
                  }}
                >
                  <div className="card-magnetic-stripe" />
                  <div className="card-signature-box">
                    <div className="signature-pattern">Authorized Cryptographic Signature</div>
                    <div className="cvv-box">CVV: 482</div>
                  </div>
                  <div className="card-back-disclaimer">
                    Issued under Multi-Tenant Enterprise Banking Agreement. Valid for authorized route collectors and branch treasury disbars only. Loss of card must be reported via Portal 0-Lag freeze.
                  </div>
                  <div className="card-back-chip-stub">
                    <ShieldCheck size={18} color="#10B981" />
                    <span>EMV HARDWARE CIPHER SECURED</span>
                  </div>
                </div>
              </div>

              <div className="card-pedestal-label">
                Move cursor to tilt in 3D perspective · Click Flip to inspect CVV
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. 3D ISOMETRIC ROUTE & BAZAAR TELEMETRY STATION
          -------------------------------------------------------------------- */}
      <section className="route-telemetry-section" id="route-telemetry">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">REAL-TIME FIELD TELEMETRY</div>
          <h2 className="qonto-section-intro-title">Live 3D route pathfinding & collection telemetry</h2>
          <p className="qonto-section-intro-desc">
            Monitor bazaar route collectors in real-time with offline SQLite caching, instant receipt confirmation, and zero cash discrepancy.
          </p>
        </div>

        <div className="route-telemetry-box">
          {/* Left Isometric 3D Board */}
          <div className="route-map-viewport">
            <div className="route-map-hud-top">
              <span className="hud-badge-live">● ISOMETRIC FIELD STATION #08</span>
              <span className="hud-toast-text">{lastPaymentToast}</span>
            </div>

            <div className="route-map-board">
              <div className="district-zone zone-saidapet">SAIDAPET</div>
              <div className="district-zone zone-mylapore">MYLAPORE</div>
              <div className="district-zone zone-tnagar">T. NAGAR</div>

              {/* Waypoint Monoliths */}
              {waypoints.map((wp, idx) => (
                <div
                  key={wp.id}
                  className={`waypoint-monolith ${idx === currentWaypointIdx ? 'is-active-target' : ''}`}
                  style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                >
                  <div className="waypoint-pin-cap">
                    <span className="wp-amount">{wp.amount}</span>
                  </div>
                  <div className="waypoint-pillar-stem" />
                  <div className="waypoint-label-card">
                    <span className="wp-name">{wp.name}</span>
                  </div>
                </div>
              ))}

              {/* Active Collector GPS Ping Beacon */}
              <div
                className="collector-gps-beacon"
                style={{
                  left: `${waypoints[currentWaypointIdx].x}%`,
                  top: `${waypoints[currentWaypointIdx].y}%`,
                }}
              >
                <div className="beacon-core-dot" />
                <div className="beacon-radar-pulse" />
                <div className="beacon-agent-tag">Agent V. Ram (Live)</div>
              </div>
            </div>
          </div>

          {/* Right Telemetry Details */}
          <div className="route-telemetry-details">
            <div className="telemetry-agent-badge">
              <span>COLLECTOR ROUTE #08 (SAIDAPET & MYLAPORE)</span>
            </div>

            <h3 className="telemetry-heading">Automated Route Pathfinding</h3>
            <p className="telemetry-desc">
              Track field agent routes, instant offline cash match pings, and bazaar merchant installments mapped continuously in 3D perspective.
            </p>

            <div className="telemetry-metrics-grid">
              <div className="telemetry-metric-card">
                <span className="m-label">MERCHANTS CLEARED</span>
                <span className="m-val">6 / 6</span>
              </div>
              <div className="telemetry-metric-card">
                <span className="m-label">COLLECTED TODAY</span>
                <span className="m-val" style={{ color: '#10B981' }}>₹18,750.00</span>
              </div>
              <div className="telemetry-metric-card">
                <span className="m-label">ACTIVE FIELD AGENT</span>
                <span className="m-val">Agent V. Ram</span>
              </div>
              <div className="telemetry-metric-card">
                <span className="m-label">ROUTE DISCREPANCY</span>
                <span className="m-val" style={{ color: '#0284C7' }}>0.00 (Zero Leakage)</span>
              </div>
            </div>

            <div className="telemetry-controls-row">
              <button
                type="button"
                className={`telemetry-mode-btn ${routeSpeed === 'STANDARD' ? 'active' : ''}`}
                onClick={() => setRouteSpeed('STANDARD')}
              >
                Standard Sweep
              </button>
              <button
                type="button"
                className={`telemetry-mode-btn ${routeSpeed === 'ACCELERATED' ? 'active' : ''}`}
                onClick={() => setRouteSpeed('ACCELERATED')}
              >
                <Zap size={14} />
                <span>Accelerate Route (2x)</span>
              </button>
            </div>

            <button
              type="button"
              className="qonto-btn-hero"
              style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
              onClick={() => navigate('/login')}
            >
              <span>Open Collector Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. 3D SOVEREIGN VAULT GYRO-GIMBAL CHAMBER
          -------------------------------------------------------------------- */}
      <section className="vault-3d-section" id="vault-chamber">
        <div className="vault-chamber-card">
          {/* Left: 3D Gyroscope Gimbal Core */}
          <div className="vault-gyro-stage">
            <div className="vault-hud-status">
              <span>((●)) 3D CRYPTOGRAPHIC GIMBAL CORE</span>
            </div>

            <div className={`gyro-gimbal-rig ${vaultPulseMode.toLowerCase()}`}>
              {/* Outer Ring: Titanium Yaw */}
              <div className="gimbal-ring ring-outer-yaw">
                <div className="orbital-node node-1" />
                <div className="orbital-node node-2" />
              </div>

              {/* Middle Ring: Sapphire Pitch */}
              <div className="gimbal-ring ring-middle-pitch">
                <div className="orbital-node node-3" />
                <div className="orbital-node node-4" />
              </div>

              {/* Inner Ring: Emerald Roll */}
              <div className="gimbal-ring ring-inner-roll">
                <div className="orbital-node node-5" />
              </div>

              {/* Central Floating Rupee Core */}
              <div className="vault-center-core">
                <div className="core-cube">
                  <div className="cube-face front">₹</div>
                  <div className="cube-face back">₹</div>
                  <div className="cube-face right">₹</div>
                  <div className="cube-face left">₹</div>
                  <div className="cube-face top" />
                  <div className="cube-face bottom" />
                </div>
                <div className="core-glow-aura" />
              </div>
            </div>

            <div className="vault-hud-bottom">
              <span>Integrity: <strong style={{ color: '#10B981' }}>100.0%</strong></span>
              <span>Block: <code>{vaultStats.blockHash}</code></span>
            </div>
          </div>

          {/* Right: Treasury Controls & Balancing */}
          <div className="vault-chamber-info">
            <div className="vault-badge-tag">
              <Zap size={14} color="#F59E0B" />
              <span>CRYPTOGRAPHIC TREASURY VAULT</span>
            </div>

            <h3 className="vault-title">The Sovereign Central Vault Core</h3>
            <p className="vault-desc">
              Witness real-time double-entry balancing. Field collections, capital injections, and loan disbursements are mirrored with microsecond telemetry across all physical branches.
            </p>

            <div className="vault-stats-row">
              <div className="vault-stat-box">
                <span className="v-lbl">ACTIVE VAULT BALANCE</span>
                <span className="v-amt">{vaultStats.activeBalance}</span>
              </div>
              <div className="vault-stat-box">
                <span className="v-lbl">TODAY'S TOTAL INFLOW</span>
                <span className="v-amt highlight-green">{vaultStats.dayInflow}</span>
              </div>
            </div>

            <div className="vault-interactive-triggers">
              <button
                type="button"
                className="btn-trigger-action collect"
                onClick={triggerCollectionSimulation}
              >
                <TrendingUp size={16} />
                <span>Simulate Collection (+₹1,250)</span>
              </button>

              <button
                type="button"
                className="btn-trigger-action disburse"
                onClick={triggerDisbursalSimulation}
              >
                <CreditCard size={16} />
                <span>Simulate Disbursal (-₹15,000)</span>
              </button>
            </div>

            <button
              type="button"
              className="qonto-btn-hero"
              style={{ marginTop: '1.75rem', alignSelf: 'flex-start' }}
              onClick={() => navigate('/login')}
            >
              <span>Access Treasury</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. INTERACTIVE LOAN CALCULATOR & AMORTIZATION
          -------------------------------------------------------------------- */}
      <section className="qonto-calc-section" id="calculator">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">LENDING ENGINE & AMORTIZATION</div>
          <h2 className="qonto-section-intro-title">Interactive loan simulator for every financial scheme</h2>
          <p className="qonto-section-intro-desc">
            Instantly simulate principal disbursals, fixed interest yields, and installment repayment schedules across Daily, Weekly, and Monthly cycles.
          </p>
        </div>

        <div className="qonto-calc-box">
          <div className="calc-controls-col">
            <div className="calc-heading-box">
              <h3>Configure Lending Parameters</h3>
              <p>Adjust principal, select collection frequency, and define tenure duration.</p>
            </div>

            {/* Amount Slider */}
            <div className="calc-input-group">
              <div className="calc-label-row">
                <span>Principal Disbursal Amount</span>
                <span className="calc-display-val">₹{calcAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="qonto-range-slider"
              />
            </div>

            {/* Frequency Selector */}
            <div className="calc-input-group">
              <div className="calc-label-row">
                <span>Repayment Cycle Scheme</span>
              </div>
              <div className="calc-pills-row">
                <button
                  type="button"
                  className={`calc-pill-btn ${calcFrequency === 'DAILY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('DAILY'); setCalcTenure(100); }}
                >
                  Daily (Merchant 100-Day)
                </button>
                <button
                  type="button"
                  className={`calc-pill-btn ${calcFrequency === 'WEEKLY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('WEEKLY'); setCalcTenure(10); }}
                >
                  Weekly (Chit 10-Week)
                </button>
                <button
                  type="button"
                  className={`calc-pill-btn ${calcFrequency === 'MONTHLY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('MONTHLY'); setCalcTenure(12); }}
                >
                  Monthly (Business 12-Month)
                </button>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="calc-input-group">
              <div className="calc-label-row">
                <span>Tenure Duration</span>
                <span className="calc-display-val">
                  {calcTenure} {calcFrequency === 'DAILY' ? 'Days' : calcFrequency === 'WEEKLY' ? 'Weeks' : 'Months'}
                </span>
              </div>
              <input
                type="range"
                min={calcFrequency === 'DAILY' ? 30 : calcFrequency === 'WEEKLY' ? 5 : 3}
                max={calcFrequency === 'DAILY' ? 120 : calcFrequency === 'WEEKLY' ? 25 : 36}
                step="1"
                value={calcTenure}
                onChange={(e) => setCalcTenure(Number(e.target.value))}
                className="qonto-range-slider"
              />
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="calc-breakdown-card">
            <div className="breakdown-badge">SIMULATED SCHEDULE</div>

            <div className="breakdown-row">
              <span className="breakdown-lbl">Base Principal</span>
              <span className="breakdown-val">₹{calcAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="breakdown-row">
              <span className="breakdown-lbl">Lending Fee / Rate</span>
              <span className="breakdown-val" style={{ color: '#10B981' }}>{interestRate}% Fixed</span>
            </div>

            <div className="breakdown-row">
              <span className="breakdown-lbl">Total Repayable</span>
              <span className="breakdown-val">₹{totalRepayable.toLocaleString('en-IN')}</span>
            </div>

            <div className="breakdown-row total-row">
              <span className="breakdown-lbl">Cycle Installment ({calcFrequency.toLowerCase()})</span>
              <span className="breakdown-val highlight">₹{emiAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Visual Amortization Bar */}
            <div className="amortization-progress-track">
              <div className="amortization-fill" style={{ width: '75%' }} />
            </div>
            <div className="amortization-label-row">
              <span>Principal: ₹{calcAmount.toLocaleString('en-IN')}</span>
              <span>Yield: ₹{totalInterest.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              className="btn-calc-submit"
              onClick={() => navigate('/login')}
            >
              <span>Disburse in Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. ENTERPRISE SECURITY & COMPLIANCE BENTO GRID
          -------------------------------------------------------------------- */}
      <section className="security-bento-section" id="security">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">SECURITY & RELIABILITY</div>
          <h2 className="qonto-section-intro-title">Institutional governance baked into every layer</h2>
          <p className="qonto-section-intro-desc">
            Engineered with bank-grade tenant partitioning, biometric enforcement, and zero data leakage.
          </p>
        </div>

        <div className="bento-grid">
          <div className="bento-card col-span-2">
            <div className="bento-icon-box">
              <ShieldCheck size={24} color="#10B981" />
            </div>
            <h3 className="bento-title">Hardware Biometric Authentication</h3>
            <p className="bento-desc">
              Biometric sensors protect mobile collection terminals with instant FaceID and fingerprint validation. Automated background timers lock the application immediately upon task switching.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <Building2 size={24} color="#38BDF8" />
            </div>
            <h3 className="bento-title">Multi-Tenant Isolation</h3>
            <p className="bento-desc">
              Strict compartmentalization guarantees that physical branches operate independently with zero cross-tenant ledger exposure.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <Key size={24} color="#F59E0B" />
            </div>
            <h3 className="bento-title">Role-Based Access (RBAC)</h3>
            <p className="bento-desc">
              SuperAdmins, Branch Managers, Cashiers, and Field Collectors operate with tightly defined permissions and session token invalidation.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <Server size={24} color="#A78BFA" />
            </div>
            <h3 className="bento-title">Double-Entry Cryptographic Ledger</h3>
            <p className="bento-desc">
              Every loan repayment, capital injection, and write-off is verified with double-entry balancing to prevent discrepancies.
            </p>
          </div>

          <div className="bento-card col-span-2">
            <div className="bento-icon-box">
              <Lock size={24} color="#34D399" />
            </div>
            <h3 className="bento-title">Automated Cloud Backups & 99.99% SLA</h3>
            <p className="bento-desc">
              Continuous geo-distributed database snapshots ensure zero data loss during power outages or connectivity drops on field routes.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          8. INSTITUTIONAL METRICS SECTION
          -------------------------------------------------------------------- */}
      <section className="qonto-metrics-section">
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
          9. FAQ ACCORDION
          -------------------------------------------------------------------- */}
      <section className="faq-section" id="faq">
        <div className="qonto-section-intro" style={{ textAlign: 'center' }}>
          <div className="qonto-section-intro-tag">FREQUENTLY ASKED QUESTIONS</div>
          <h2 className="qonto-section-intro-title">Everything you need to know</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaq === idx ? 'active' : ''}`}
            >
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
                  }}
                />
              </button>

              {openFaq === idx && (
                <div className="faq-answer-content">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          10. BOTTOM CONVERSION ACTION
          -------------------------------------------------------------------- */}
      <section className="qonto-bottom-cta">
        <div className="cta-ambient-glow" />
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
          11. COMPREHENSIVE FOOTER
          -------------------------------------------------------------------- */}
      <footer className="qonto-footer">
        <div className="qonto-footer-grid">
          <div className="footer-col-brand">
            <div className="footer-brand-header">
              <img src={logoImg} alt="Finance Portal" className="footer-logo-img" />
              <h4>Finance Portal</h4>
            </div>
            <p>
              Enterprise cloud infrastructure for daily retail merchant advances, structured weekly chits, and central vault double-entry treasury management.
            </p>
          </div>

          <div className="footer-col-links">
            <h5>Navigation</h5>
            <ul>
              <li><a href="#hero" onClick={(e) => scrollToSection(e, 'hero')}>Features</a></li>
              <li><a href="#card-studio" onClick={(e) => scrollToSection(e, 'card-studio')}>Smart Card Studio</a></li>
              <li><a href="#route-telemetry" onClick={(e) => scrollToSection(e, 'route-telemetry')}>Route Telemetry</a></li>
              <li><a href="#vault-chamber" onClick={(e) => scrollToSection(e, 'vault-chamber')}>Sovereign Vault</a></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h5>Platform</h5>
            <ul>
              <li><a href="#calculator" onClick={(e) => scrollToSection(e, 'calculator')}>Loan Simulator</a></li>
              <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')}>Security Architecture</a></li>
              <li><a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h5>Access</h5>
            <ul>
              <li><Link to="/login">Sign In to Account</Link></li>
              <li><Link to="/login">Open an Account</Link></li>
              <li><Link to="/login">Staff Terminal</Link></li>
              <li><Link to="/login">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="qonto-footer-bottom">
          <span className="qonto-footer-copy">
            © {new Date().getFullYear()} Finance Portal Engine. All rights reserved.
          </span>
          <ul className="qonto-footer-legal-links">
            <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')}>Privacy Policy</a></li>
            <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')}>Terms of Service</a></li>
            <li><a href="#security" onClick={(e) => scrollToSection(e, 'security')}>Regulatory Compliance</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
