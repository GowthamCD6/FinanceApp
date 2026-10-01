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
  ChevronDown,
  Layers,
  Zap,
  Users,
  Server,
  Activity,
  FileText,
  Clock,
  Key,
  Shield,
  Star,
  Check,
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

  // 1. Interactive Product Showcase Tab State
  const [activeProductTab, setActiveProductTab] = useState(0);

  const productTabs = [
    {
      title: 'Daily Merchant Cycles',
      badge: 'RETAIL STORE ADVANCE',
      badgeBg: '#C8F5E9',
      heading: '100-Day Bazaar Inventory Financing',
      desc: 'Designed for daily vegetable vendors, provision stores, and retail bazaar merchants. Field collectors collect fixed micro-installments with automated daily cash matching.',
      metrics: {
        principal: '₹10,000',
        total: '₹12,500',
        cycle: '₹125 / day',
        tenure: '100 Days',
        rate: '25% Flat',
        recovery: '99.4%',
      },
      highlights: [
        'Automated 100-day installment amortization',
        'Daily field collector mobile app sync',
        'Direct WhatsApp automated receipt dispatch',
        'Settlement at last date calculation logic',
      ],
    },
    {
      title: 'Weekly Chit Cycles',
      badge: 'CHIT & GROUP LENDING',
      badgeBg: '#FBF6B6',
      heading: '10-Week Structured Community Cycles',
      desc: 'Structured for weekly market traders and group community borrowers. Every cycle is mapped with flexible grace windows and instant default warning telemetry.',
      metrics: {
        principal: '₹50,000',
        total: '₹62,500',
        cycle: '₹6,250 / week',
        tenure: '10 Weeks',
        rate: '25% Flat',
        recovery: '98.8%',
      },
      highlights: [
        '10-week cycle tracker with overdue alerts',
        'Dual collector verification on cash handoff',
        'Comprehensive borrower log & ledger history',
        'Early settlement and pre-closure rebates',
      ],
    },
    {
      title: 'Monthly Business EMIs',
      badge: 'SME WORKING CAPITAL',
      badgeBg: '#DED4FC',
      heading: '12-Month Enterprise Credit Portfolios',
      desc: 'Higher-ticket business expansion credit for established merchants with automated monthly interest amortization, collateral recording, and credit scoring.',
      metrics: {
        principal: '₹2,50,000',
        total: '₹3,00,000',
        cycle: '₹25,000 / mo',
        tenure: '12 Months',
        rate: '20% Diminishing',
        recovery: '99.7%',
      },
      highlights: [
        'Automated EMI banking debits & UPI reconciliation',
        'Collateral documents & shop image archiving',
        'Customer credit rating based on past closed loans',
        'Organization branch-level portfolio risk radar',
      ],
    },
    {
      title: 'Central Cash Vault',
      badge: 'TREASURY & GOVERNANCE',
      badgeBg: '#FCE0D2',
      heading: 'Real-Time Double-Entry Circulation Vault',
      desc: 'Complete organizational treasury governance. Track capital injections, field staff collections, vault cash balances, and operational disbursements with 0ms lag.',
      metrics: {
        principal: '₹42,85,600',
        total: 'Vault Active',
        cycle: 'Live Reconciled',
        tenure: 'Continuous',
        rate: 'Zero Leakage',
        recovery: '100% Audited',
      },
      highlights: [
        'Double-entry mathematical balance verification',
        'Granular branch-level vault replenishment',
        'Daily end-of-day supervisor cash sign-off',
        'Audit log broadcast stream via WebSockets',
      ],
    },
  ];

  // 2. Interactive Loan Simulator State
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcFrequency, setCalcFrequency] = useState('WEEKLY'); // 'DAILY' | 'WEEKLY' | 'MONTHLY'
  const [calcTenure, setCalcTenure] = useState(10);

  const interestRate = calcFrequency === 'DAILY' ? 25 : calcFrequency === 'WEEKLY' ? 25 : 20;
  const totalInterest = Math.round(calcAmount * (interestRate / 100));
  const totalRepayable = calcAmount + totalInterest;
  const emiAmount = Math.round(totalRepayable / calcTenure);

  // 3. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How does daily merchant collection calculate interest and tenure?',
      a: 'The daily merchant module is calibrated for typical 100-day bazaar cycles (e.g. ₹10,000 principal disbursed yields ₹12,500 total repayment at ₹125/day). Both the tenure and interest rate are fully configurable by branch admins.',
    },
    {
      q: 'Can field agents collect payments on mobile devices?',
      a: 'Yes. Our companion mobile app provides field agents with their daily assigned routes, phone call shortcuts, WhatsApp digital receipts, and real-time payment recording with offline-ready queuing.',
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
  ];

  return (
    <div
      className="qonto-welcome-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* --------------------------------------------------------------------
          1. TOP NAVBAR
          -------------------------------------------------------------------- */}
      <header className="qonto-navbar">
        <div className="qonto-navbar-inner">
          <Link to="/" className="qonto-brand">
            <img src={logoImg} alt="Finance Portal" className="qonto-brand-logo" />
            <span className="qonto-brand-title">Finance</span>
          </Link>

          <nav>
            <ul className="qonto-nav-menu">
              <li className="qonto-nav-item"><a href="#solutions">Solutions</a></li>
              <li className="qonto-nav-item"><a href="#how-it-works">How It Works</a></li>
              <li className="qonto-nav-item"><a href="#calculator">Loan Calculator</a></li>
              <li className="qonto-nav-item"><a href="#security">Security</a></li>
              <li className="qonto-nav-item"><a href="#faq">FAQ</a></li>
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
          <div className="qonto-hero-badge">
            <span className="badge-dot-live" />
            <span>ENTERPRISE LENDING & RECOVERY ENGINE</span>
          </div>

          <h1 className="qonto-hero-heading">
            All your business finances. In one app.
          </h1>

          <p className="qonto-hero-desc">
            Keep your business account and all your finance needs safely organized under one roof. Manage money quickly, easily & efficiently. Whether you're alone or leading a team.
          </p>

          <div className="hero-actions-row">
            <button
              type="button"
              className="qonto-btn-hero"
              onClick={() => navigate('/login')}
            >
              <span>Discover our offers</span>
              <ArrowRight size={18} />
            </button>

            <a href="#calculator" className="qonto-btn-hero-secondary">
              <span>Simulate Loan</span>
            </a>
          </div>

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
      <section className="qonto-features-strip-section" id="solutions">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">UNIFIED PRODUCT SUITE</div>
          <h2 className="qonto-section-intro-title">Engineered for retail lending, chits & merchant recovery</h2>
        </div>

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
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  <polygon points="15,40 50,22 85,40 50,58" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="15,40 50,58 50,68 15,50" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="50,58 85,40 85,50 50,68" fill="#94A3B8" stroke="#0F172A" strokeWidth="1.5" />
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
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  <polygon points="25,25 60,10 80,45 45,60" fill="#F1F5F9" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="35,35 70,20 90,55 55,70" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="45" y1="36" x2="75" y2="23" stroke="#CBD5E1" strokeWidth="2" />
                  <line x1="48" y1="44" x2="72" y2="34" stroke="#CBD5E1" strokeWidth="2" />
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
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  <polygon points="30,45 65,30 85,60 50,75" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="42" y1="48" x2="70" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
                  <polygon points="20,28 55,13 75,48 40,63" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
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
                <svg className="illustration-svg" viewBox="0 0 100 80" fill="none">
                  <polygon points="35,22 65,10 85,22 55,34" fill="#FED7AA" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="35,22 55,34 55,72 35,60" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="55,34 85,22 85,60 55,72" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="55" y1="46" x2="85" y2="34" stroke="#0F172A" strokeWidth="1.2" />
                  <line x1="55" y1="58" x2="85" y2="46" stroke="#0F172A" strokeWidth="1.2" />
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
          4. INTERACTIVE PRODUCT EXPERIENCE (Tab Switcher)
          -------------------------------------------------------------------- */}
      <section className="product-showcase-section">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">LENDING WORKFLOWS</div>
          <h2 className="qonto-section-intro-title">Built for every financial scheme & cycle</h2>
        </div>

        {/* Tab Buttons */}
        <div className="showcase-tab-bar">
          {productTabs.map((tab, idx) => (
            <button
              key={idx}
              type="button"
              className={`showcase-tab-btn ${activeProductTab === idx ? 'active' : ''}`}
              onClick={() => setActiveProductTab(idx)}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="showcase-content-box">
          <div className="showcase-left-info">
            <div
              className="showcase-badge"
              style={{ backgroundColor: productTabs[activeProductTab].badgeBg }}
            >
              {productTabs[activeProductTab].badge}
            </div>

            <h3 className="showcase-title">
              {productTabs[activeProductTab].heading}
            </h3>

            <p className="showcase-desc">
              {productTabs[activeProductTab].desc}
            </p>

            <div className="showcase-checklist">
              {productTabs[activeProductTab].highlights.map((h, i) => (
                <div key={i} className="checklist-item">
                  <CheckCircle2 size={18} color="#10B981" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="qonto-btn-hero"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => navigate('/login')}
            >
              <span>Explore this scheme</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Mockup Display */}
          <div className="showcase-right-visual">
            <div className="visual-metric-header">
              <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Active Portfolio Simulation</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 4 }}>
                {productTabs[activeProductTab].metrics.recovery} Recovery
              </span>
            </div>

            <div className="visual-metric-amount">
              {productTabs[activeProductTab].metrics.principal}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              Total Repayable: <strong style={{ color: '#111827' }}>{productTabs[activeProductTab].metrics.total}</strong>
            </span>

            {/* Visual Progress Bar */}
            <div className="visual-progress-track">
              <div
                className="visual-progress-fill"
                style={{
                  width: '74%',
                  backgroundColor: productTabs[activeProductTab].badgeBg === '#C8F5E9' ? '#059669' : '#6366F1',
                }}
              />
            </div>

            <div className="visual-details-table">
              <div className="visual-detail-row">
                <span>Cycle EMI</span>
                <span>{productTabs[activeProductTab].metrics.cycle}</span>
              </div>
              <div className="visual-detail-row">
                <span>Tenure Duration</span>
                <span>{productTabs[activeProductTab].metrics.tenure}</span>
              </div>
              <div className="visual-detail-row">
                <span>Interest Pricing</span>
                <span>{productTabs[activeProductTab].metrics.rate}</span>
              </div>
              <div className="visual-detail-row">
                <span>Audit Status</span>
                <span style={{ color: '#059669' }}>Double-Entry Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. OPERATIONAL LIFECYCLE ("How It Works")
          -------------------------------------------------------------------- */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">SEAMLESS ONBOARDING</div>
          <h2 className="qonto-section-intro-title">How the lending engine operates in 3 steps</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num-badge">1</div>
            <h3 className="step-title">Originate & Allot</h3>
            <p className="step-desc">
              Register borrowers, record shop GPS coordinates, set credit limits, and assign repayment terms (Daily, Weekly, or Monthly) with automated cycle amortization.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">2</div>
            <h3 className="step-title">Field Collect & Biometrics</h3>
            <p className="step-desc">
              Field agents use the mobile app with biometric lock to collect payments along scheduled market routes, automatically generating instant digital WhatsApp receipts.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">3</div>
            <h3 className="step-title">Vault Reconcile & Audit</h3>
            <p className="step-desc">
              Branch supervisors verify daily collection handoffs against the central vault ledger. Every transaction is immutably recorded with real-time portfolio telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. INTERACTIVE LOAN CALCULATOR (Fintech Simulator)
          -------------------------------------------------------------------- */}
      <section className="qonto-calc-section" id="calculator">
        <div className="qonto-calc-box">
          <div className="calc-controls-col">
            <div className="calc-heading-box">
              <h3>Live Interactive Loan Simulator</h3>
              <p>Simulate principal disbursal, interest yield, and cycle installment schedules instantly.</p>
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
                <span>Repayment Cycle</span>
              </div>
              <div className="calc-pills-row">
                <button
                  type="button"
                  className={`calc-pill-btn ${calcFrequency === 'DAILY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('DAILY'); setCalcTenure(100); }}
                >
                  Daily (Merchant)
                </button>
                <button
                  type="button"
                  className={`calc-pill-btn ${calcFrequency === 'WEEKLY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('WEEKLY'); setCalcTenure(10); }}
                >
                  Weekly (Chit)
                </button>
                <button
                  type="button"
                  className={`calc-pill-btn ${calcFrequency === 'MONTHLY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('MONTHLY'); setCalcTenure(12); }}
                >
                  Monthly (Business)
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
            <div className="breakdown-row">
              <span className="breakdown-lbl">Base Principal</span>
              <span className="breakdown-val">₹{calcAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="breakdown-row">
              <span className="breakdown-lbl">Lending Fee / Rate</span>
              <span className="breakdown-val" style={{ color: '#059669' }}>{interestRate}% Fixed</span>
            </div>

            <div className="breakdown-row">
              <span className="breakdown-lbl">Total Repayable</span>
              <span className="breakdown-val">₹{totalRepayable.toLocaleString('en-IN')}</span>
            </div>

            <div className="breakdown-row total-row">
              <span className="breakdown-lbl">Cycle EMI ({calcFrequency.toLowerCase()})</span>
              <span className="breakdown-val highlight">₹{emiAmount.toLocaleString('en-IN')}</span>
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
        </div>

        <div className="bento-grid">
          <div className="bento-card col-span-2">
            <div className="bento-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3 className="bento-title">Hardware Biometric Authentication</h3>
            <p className="bento-desc">
              Biometric sensors protect mobile collection terminals with instant FaceID and fingerprint validation. Automated background timers lock the application immediately upon task switching.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <Building2 size={24} />
            </div>
            <h3 className="bento-title">Multi-Tenant Isolation</h3>
            <p className="bento-desc">
              Strict compartmentalization guarantees that physical branches operate independently with zero cross-tenant ledger exposure.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <Key size={24} />
            </div>
            <h3 className="bento-title">Role-Based Access (RBAC)</h3>
            <p className="bento-desc">
              SuperAdmins, Branch Managers, Cashiers, and Field Collectors operate with tightly defined permissions and session token invalidation.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <Server size={24} />
            </div>
            <h3 className="bento-title">Double-Entry Cryptographic Ledger</h3>
            <p className="bento-desc">
              Every loan repayment, capital injection, and write-off is verified with double-entry balancing to prevent discrepancies.
            </p>
          </div>

          <div className="bento-card col-span-2">
            <div className="bento-icon-box">
              <Lock size={24} />
            </div>
            <h3 className="bento-title">Automated Cloud Backups & 99.99% SLA</h3>
            <p className="bento-desc">
              Continuous geo-distributed database snapshots ensure zero data loss during power outages or connectivity drops on field routes.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          8. CLIENT TESTIMONIALS & TRUST PROOF
          -------------------------------------------------------------------- */}
      <section className="testimonials-section">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">VERIFIED BY OPERATORS</div>
          <h2 className="qonto-section-intro-title">Trusted by leading chit funds and micro-lenders</h2>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="testimonial-quote">
              "Managing 100-day bazaar collections used to be a notebook nightmare. With Finance Portal, our 14 route agents collect on time with zero cash leakage."
            </p>
            <div className="testimonial-author-box">
              <div className="author-avatar-initials">VK</div>
              <div>
                <div className="author-name">Vasanth Kumar</div>
                <div className="author-role">Managing Director, Apex Chit Funds</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">
              "The automatic WhatsApp receipt dispatch and settlement calculation saves our accounting staff 3 hours every single evening."
            </p>
            <div className="testimonial-author-box">
              <div className="author-avatar-initials">MR</div>
              <div>
                <div className="author-name">Meenakshi Raman</div>
                <div className="author-role">Operations Head, Sri GDK Finance</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <p className="testimonial-quote">
              "Biometric security on field phones gives our supervisors complete peace of mind when agents handle high-volume bazaar collections."
            </p>
            <div className="testimonial-author-box">
              <div className="author-avatar-initials">SS</div>
              <div>
                <div className="author-name">Saravanan S.</div>
                <div className="author-role">Branch Officer, Metro Credit Union</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          9. INTERACTIVE FAQ ACCORDION
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
                    transition: 'transform 0.2s ease',
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
          10. INSTITUTIONAL METRICS SECTION
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
          11. BOTTOM CONVERSION ACTION
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
          12. COMPREHENSIVE FOOTER
          -------------------------------------------------------------------- */}
      <footer className="qonto-footer">
        <div className="qonto-footer-grid">
          <div className="footer-col-brand">
            <h4>Finance Portal</h4>
            <p>
              Enterprise cloud infrastructure for daily retail merchant advances, structured weekly chits, and central vault double-entry treasury management.
            </p>
          </div>

          <div className="footer-col-links">
            <h5>Solutions</h5>
            <ul>
              <li><a href="#solutions">Daily Bazaar Loans</a></li>
              <li><a href="#solutions">Weekly Chit Cycles</a></li>
              <li><a href="#solutions">Monthly Business EMIs</a></li>
              <li><a href="#solutions">Central Vault</a></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h5>Platform</h5>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#calculator">Loan Simulator</a></li>
              <li><a href="#security">Security Specs</a></li>
              <li><a href="#faq">FAQ</a></li>
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
            <li><a href="#security">Privacy Policy</a></li>
            <li><a href="#security">Terms of Service</a></li>
            <li><a href="#security">Regulatory Compliance</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
