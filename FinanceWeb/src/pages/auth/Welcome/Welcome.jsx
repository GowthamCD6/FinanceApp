import React, { useState, useEffect } from 'react';
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
  Smartphone,
  Eye,
  RefreshCw,
  Sliders,
  DollarSign,
  Radio,
  FileSpreadsheet,
  Laptop,
  Printer,
  QrCode,
  Wifi,
  MapPin,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Award,
  Compass,
} from 'lucide-react';
import './Welcome.css';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Smooth scroll helper for professional top navigation
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
    const xOffset = (clientX / innerWidth - 0.5) * 10;
    const yOffset = (clientY / innerHeight - 0.5) * 10;
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
      gradient: 'linear-gradient(135deg, #1C1C1E 0%, #121212 50%, #0A0A0A 100%)',
      border: 'rgba(255, 255, 255, 0.16)',
      cardNum: '•••• 9842',
      holder: 'KUMAR FINANCIALS',
      limit: '₹50,00,000 / day',
    },
    emerald: {
      name: 'Emerald Bazaar Merchant',
      badge: 'RETAIL ROUTE TERMINAL',
      tagline: 'High-resilience polycarbonate for daily market collectors',
      accentColor: '#34D399',
      gradient: 'linear-gradient(135deg, #064E3B 0%, #022C22 60%, #011B14 100%)',
      border: 'rgba(52, 211, 153, 0.35)',
      cardNum: '•••• 5120',
      holder: 'BAZAAR AGENT #08',
      limit: '₹5,00,000 / day',
    },
    gold: {
      name: 'Rose Gold Sovereign Vault',
      badge: 'TREASURY & GOVERNANCE',
      tagline: 'Electrum alloy with dual-custody cryptographic approval',
      accentColor: '#F59E0B',
      gradient: 'linear-gradient(135deg, #451A03 0%, #2E1065 60%, #1C1917 100%)',
      border: 'rgba(245, 158, 11, 0.4)',
      cardNum: '•••• 8801',
      holder: 'CENTRAL TREASURY',
      limit: '₹1,50,00,000 / day',
    },
    cobalt: {
      name: 'Royal Cobalt Fleet',
      badge: 'MULTI-BRANCH DISBURSAL',
      tagline: 'Luminescent core with instant field-freeze protocol',
      accentColor: '#60A5FA',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 60%, #020617 100%)',
      border: 'rgba(96, 165, 250, 0.4)',
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
    const rotX = -((y / rect.height - 0.5) * 22);
    const rotY = (x / rect.width - 0.5) * 22;

    setCardRotation({ x: rotX, y: rotY });
    setCardShine({ x: xPercent, y: yPercent, opacity: 0.65 });
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
  // 5. 3D ISOMETRIC LIQUIDITY & TREASURY RADAR
  // --------------------------------------------------------------------------
  const [liquidityTimeframe, setLiquidityTimeframe] = useState('daily');
  const [activeHoverBar, setActiveHoverBar] = useState(null);

  const liquidityData = {
    daily: [
      { label: 'Mon', height: 68, amount: '₹1.85L', volume: '142 Cycles', trend: '+14%' },
      { label: 'Tue', height: 82, amount: '₹2.10L', volume: '168 Cycles', trend: '+18%' },
      { label: 'Wed', height: 75, amount: '₹1.95L', volume: '155 Cycles', trend: '+11%' },
      { label: 'Thu', height: 94, amount: '₹2.60L', volume: '204 Cycles', trend: '+24%' },
      { label: 'Fri', height: 115, amount: '₹3.20L', volume: '256 Cycles', trend: '+31%' },
      { label: 'Sat', height: 125, amount: '₹3.50L', volume: '280 Cycles', trend: '+35%', featured: true },
      { label: 'Sun', height: 55, amount: '₹1.40L', volume: '98 Cycles', trend: '+8%' },
    ],
    weekly: [
      { label: 'Wk 1', height: 78, amount: '₹14.2L', volume: '1,120 Cycles', trend: '+15%' },
      { label: 'Wk 2', height: 96, amount: '₹17.8L', volume: '1,410 Cycles', trend: '+22%' },
      { label: 'Wk 3', height: 118, amount: '₹21.4L', volume: '1,720 Cycles', trend: '+29%' },
      { label: 'Wk 4', height: 135, amount: '₹25.1L', volume: '2,040 Cycles', trend: '+34%', featured: true },
    ],
    monthly: [
      { label: 'Q1', height: 85, amount: '₹58.4L', volume: '4,650 Cycles', trend: '+18%' },
      { label: 'Q2', height: 108, amount: '₹76.2L', volume: '6,100 Cycles', trend: '+26%' },
      { label: 'Q3', height: 128, amount: '₹94.5L', volume: '7,550 Cycles', trend: '+32%' },
      { label: 'Q4', height: 145, amount: '₹1.15Cr', volume: '9,200 Cycles', trend: '+39%', featured: true },
    ],
  };

  // --------------------------------------------------------------------------
  // 6. REAL-TIME CRYPTOGRAPHIC AUDIT STREAM
  // --------------------------------------------------------------------------
  const [auditStreamPaused, setAuditStreamPaused] = useState(false);
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'tx-901',
      branch: 'Branch #01 (Central)',
      type: 'DAILY_RECOVERY',
      desc: 'Collector #04 recorded installment from Selvi Groceries',
      amount: '+ ₹125.00',
      hash: '0x7b2f...892e',
      time: 'Just now',
      status: 'VERIFIED',
    },
    {
      id: 'tx-902',
      branch: 'Branch #03 (South)',
      type: 'DISBURSAL',
      desc: 'Disbursed 100-Day advance to Murugan Provision Store',
      amount: '- ₹15,000.00',
      hash: '0x3c9a...114f',
      time: '18s ago',
      status: 'VERIFIED',
    },
    {
      id: 'tx-903',
      branch: 'Central Treasury',
      type: 'VAULT_BALANCING',
      desc: 'Double-entry cash handoff signed by Supervisor V. S.',
      amount: 'Reconciled',
      hash: '0x991e...f67a',
      time: '42s ago',
      status: '0-LEAKAGE',
    },
    {
      id: 'tx-904',
      branch: 'Branch #02 (East)',
      type: 'SETTLEMENT',
      desc: 'Early closure certificate generated for Borrower #304',
      amount: 'Settled ₹8,400',
      hash: '0x55aa...201c',
      time: '1m ago',
      status: 'VERIFIED',
    },
  ]);

  useEffect(() => {
    if (auditStreamPaused) return;

    const interval = setInterval(() => {
      const mockPool = [
        {
          branch: 'Branch #01 (Central)',
          type: 'DAILY_RECOVERY',
          desc: 'Collector #02 logged route cash from Raja Flower Mart',
          amount: '+ ₹250.00',
          status: 'VERIFIED',
        },
        {
          branch: 'Branch #04 (North)',
          type: 'CHIT_INSTALLMENT',
          desc: '10-Week chit collection logged for Cycle #12-C',
          amount: '+ ₹6,250.00',
          status: 'VERIFIED',
        },
        {
          branch: 'Central Vault',
          type: 'VAULT_INJECTION',
          desc: 'Owner capital reserve allocated to South Branch',
          amount: '+ ₹2,00,000.00',
          status: '0-LEAKAGE',
        },
        {
          branch: 'Branch #02 (East)',
          type: 'DISBURSAL',
          desc: 'Emergency 15-day bridge credit activated',
          amount: '- ₹10,000.00',
          status: 'VERIFIED',
        },
      ];

      const item = mockPool[Math.floor(Math.random() * mockPool.length)];
      const newEntry = {
        id: 'tx-' + Math.floor(Math.random() * 9000 + 1000),
        ...item,
        hash: '0x' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6),
        time: 'Just now',
      };

      setAuditLogs((prev) => [newEntry, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [auditStreamPaused]);

  // --------------------------------------------------------------------------
  // 7. PLATFORM COMPARISON TAB (MOBILE VS WEB)
  // --------------------------------------------------------------------------
  const [platformTab, setPlatformTab] = useState('mobile');

  // --------------------------------------------------------------------------
  // 8. BORROWER LIFECYCLE ROADMAP
  // --------------------------------------------------------------------------
  const [activeLifecycleStage, setActiveLifecycleStage] = useState(0);

  const lifecycleStages = [
    {
      num: '01',
      title: 'Digital KYC & Geotagging',
      subtitle: 'Field Onboarding with Zero Paperwork',
      desc: 'Field agents record Aadhaar/PAN, photograph the merchant shopfront, and lock GPS coordinates for verified bazaar route mapping.',
      badge: 'VERIFIED ONBOARDING',
      metrics: '3 Mins Average Onboarding',
    },
    {
      num: '02',
      title: 'Algorithmic Credit Grading',
      subtitle: 'Tenure & Repayment Amortization',
      desc: 'Custom repayment calculation logic computes exact daily or weekly installments (e.g. ₹10,000 principal at ₹125/day for 100 days).',
      badge: 'RISK AUTOMATION',
      metrics: '99.4% Projected Recovery',
    },
    {
      num: '03',
      title: 'Instant Disbursal Execution',
      subtitle: 'Vault Cash or Direct UPI Push',
      desc: 'Disburse via double-entry authorized branch vault cash or instant bank rails with automated cryptographic debit confirmation.',
      badge: '0ms DISBURSAL LAG',
      metrics: 'Immediate Field Allocation',
    },
    {
      num: '04',
      title: 'Mobile Route Cash Collection',
      subtitle: 'Biometric Authenticated Handoff',
      desc: 'Collectors log cash payments with fingerprint/FaceID sensor verification, offline SQLite fallback, and 1-tap customer phone dialing.',
      badge: 'HARDWARE BIOMETRICS',
      metrics: 'Zero Offline Data Loss',
    },
    {
      num: '05',
      title: 'Automated WhatsApp Receipts',
      subtitle: 'Borrower Proof & Balance Transparency',
      desc: 'Every recorded collection sends an immediate WhatsApp digital receipt with remaining balance and days left in the cycle.',
      badge: 'INSTANT TRANSPARENCY',
      metrics: '100% Borrower Delivery',
    },
    {
      num: '06',
      title: 'Last-Date Settlement & Rebate',
      subtitle: 'Automated Pre-Closure Calculation',
      desc: 'Our engine computes remaining balance, waives early interest rebates automatically, and boosts borrower credit ceiling for the next cycle.',
      badge: 'SETTLEMENT ENGINE',
      metrics: 'Instant Zero-Dues Certificate',
    },
  ];

  // --------------------------------------------------------------------------
  // 9. PRODUCT SHOWCASE TABS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 10. INTERACTIVE ROI & TIME-SAVINGS CALCULATOR
  // --------------------------------------------------------------------------
  const [numAgents, setNumAgents] = useState(8);
  const [numBorrowers, setNumBorrowers] = useState(1200);

  const hoursSavedPerMonth = Math.round(numAgents * 14.5 + (numBorrowers / 100) * 4);
  const speedMultiplier = (2.5 + numAgents * 0.1).toFixed(1);
  const estimatedCostSaving = (numAgents * 4500 + numBorrowers * 12).toLocaleString('en-IN');

  // --------------------------------------------------------------------------
  // 11. LOAN SIMULATOR CALCULATIONS
  // --------------------------------------------------------------------------
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcFrequency, setCalcFrequency] = useState('WEEKLY');
  const [calcTenure, setCalcTenure] = useState(10);

  const interestRate = calcFrequency === 'DAILY' ? 25 : calcFrequency === 'WEEKLY' ? 25 : 20;
  const totalInterest = Math.round(calcAmount * (interestRate / 100));
  const totalRepayable = calcAmount + totalInterest;
  const emiAmount = Math.round(totalRepayable / calcTenure);

  // --------------------------------------------------------------------------
  // 12. FAQ ACCORDION
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
      <header className="qonto-navbar">
        <div className="qonto-navbar-inner">
          <Link to="/" className="qonto-brand">
            <img src={logoImg} alt="Finance Portal" className="qonto-brand-logo" />
            <span className="qonto-brand-title">Finance</span>
          </Link>

          <nav>
            <ul className="qonto-nav-menu">
              <li className="qonto-nav-item">
                <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')}>
                  Products & Schemes
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#card-studio" onClick={(e) => scrollToSection(e, 'card-studio')}>
                  Smart Cards
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#route-telemetry" onClick={(e) => scrollToSection(e, 'route-telemetry')}>
                  Route Operations
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#vault-chamber" onClick={(e) => scrollToSection(e, 'vault-chamber')}>
                  Central Treasury
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#liquidity-radar" onClick={(e) => scrollToSection(e, 'liquidity-radar')}>
                  Cash Flow
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#lifecycle" onClick={(e) => scrollToSection(e, 'lifecycle')}>
                  Borrower Journey
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#audit-feed" onClick={(e) => scrollToSection(e, 'audit-feed')}>
                  Security & Ledger
                </a>
              </li>
              <li className="qonto-nav-item">
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>
                  FAQ
                </a>
              </li>
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
          2. HERO SECTION & 3D ISOMETRIC FLAGSHIP SHOWCASE
          -------------------------------------------------------------------- */}
      <section
        className="qonto-hero-section"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Left Column: Bold Typography & Actions */}
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

            <a
              href="#card-studio"
              className="qonto-btn-hero-secondary"
              onClick={(e) => scrollToSection(e, 'card-studio')}
            >
              <CreditCard size={16} color="#C084FC" />
              <span>Smart Card Studio</span>
            </a>
          </div>

          <span className="qonto-hero-subnote">
            From ₹0/month. Enterprise multi-tenant engine. Access with zero obligations.
          </span>
        </div>

        {/* Right Column: High-Precision 3D Isometric Flagship Devices */}
        <div className="qonto-hero-right">
          <div
            className="qonto-isometric-stage"
            style={{
              transform: `rotateX(${50 + heroTilt.y}deg) rotateZ(${-35 + heroTilt.x}deg)`,
            }}
          >
            {/* 3D Floating Physical Bullion Coin */}
            <div className="hero-3d-coin-token">
              <div className="coin-face-front">
                <span className="coin-symbol">₹</span>
              </div>
              <div className="coin-edge-grooves" />
            </div>

            {/* 3D Floating Sapphire Titanium Shield */}
            <div className="hero-3d-shield-token">
              <ShieldCheck size={28} color="#60A5FA" />
              <div className="shield-glare-line" />
            </div>

            {/* Tilted High-Precision iPad Dashboard Screen */}
            <div className="qonto-mockup-tablet">
              <div className="tablet-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="tablet-cam-dot" />
                  <span className="tablet-title">Executive Dashboard</span>
                </div>
                <span className="tablet-status-tag">Live Active Portfolio</span>
              </div>

              <div className="tablet-metric-row">
                <div>
                  <span className="tablet-balance-lbl">Available Treasury Balance</span>
                  <div className="tablet-balance-val">₹48,20,500.00</div>
                  <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>
                    +18.4% month-over-month · Double-Entry Audited
                  </span>
                </div>

                <div className="tablet-donut-chart">
                  <div className="tablet-donut-inner">
                    <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>99.4%</span>
                  </div>
                </div>
              </div>

              {/* Glowing SVG Wave Graph */}
              <svg className="tablet-wave-graph" viewBox="0 0 380 48" fill="none">
                <defs>
                  <linearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 38 C 60 42, 95 18, 160 26 C 220 34, 270 6, 330 18 C 360 24, 375 10, 380 8"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 38 C 60 42, 95 18, 160 26 C 220 34, 270 6, 330 18 C 360 24, 375 10, 380 8 L 380 48 L 0 48 Z"
                  fill="url(#waveGlow)"
                />
              </svg>

              <div className="tablet-transactions-list">
                <div className="tablet-tx-item">
                  <span>Daily Merchant Route Handoff</span>
                  <span className="tx-amount-green">+ ₹1,250.00</span>
                </div>
                <div className="tablet-tx-item">
                  <span>Weekly Chit Installment (Mylapore)</span>
                  <span className="tx-amount-green">+ ₹6,250.00</span>
                </div>
              </div>
            </div>

            {/* Floating Tilted Smartphone Screen */}
            <div className="qonto-mockup-phone">
              <div className="phone-speaker-notch" />
              <div className="phone-balance-box">
                <span className="phone-balance-lbl">Collector Mobile Terminal</span>
                <div className="phone-balance-num">₹18,750.00</div>
                <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 700 }}>14 / 16 Shops Cleared</span>
              </div>

              <div className="phone-mini-txs">
                <div className="phone-mini-row">
                  <span>Saidapet Bazaar</span>
                  <span style={{ color: '#10B981' }}>+₹125.00</span>
                </div>
                <div className="phone-mini-row">
                  <span>Mylapore Tank</span>
                  <span style={{ color: '#10B981' }}>+₹250.00</span>
                </div>
                <div className="phone-mini-row">
                  <span>Central Vault</span>
                  <span style={{ color: '#60A5FA' }}>Auto-Synced</span>
                </div>
              </div>

              <div className="phone-bottom-nav">
                <span>Routes</span>
                <span style={{ color: '#111827', fontWeight: 800 }}>Collect</span>
                <span>Ledger</span>
              </div>
            </div>

            {/* Brushed Silver Card In Depth Layer */}
            <div className="qonto-floating-card-silver" />

            {/* Matte Titanium Chip Card in Front */}
            <div className="qonto-floating-card-black">
              <div className="chip-gold-emv-mini" />
              <div className="card-num-preview">•••• 9842</div>
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
            <div className="card-specular-shine" />
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
            <div className="card-specular-shine" />
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
            <div className="card-specular-shine" />
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
            <div className="card-specular-shine" />
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
          4. 3D HOLOGRAPHIC CARD SHOWROOM
          -------------------------------------------------------------------- */}
      <section className="card-studio-section" id="card-studio">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">INTERACTIVE HARDWARE SUITE</div>
          <h2 className="qonto-section-intro-title">Institutional titanium & merchant smart cards</h2>
        </div>

        <div className="card-studio-container">
          {/* Left Controls & Specifications */}
          <div className="card-studio-specs">
            <div className="tier-pills-row">
              {Object.keys(cardTiers).map((tierKey) => (
                <button
                  key={tierKey}
                  type="button"
                  className={`tier-pill-btn ${activeCardTier === tierKey ? 'active' : ''}`}
                  onClick={() => setActiveCardTier(tierKey)}
                >
                  {cardTiers[tierKey].badge}
                </button>
              ))}
            </div>

            <h3 className="card-tier-title">{cardTiers[activeCardTier].name}</h3>
            <p className="card-tier-desc">{cardTiers[activeCardTier].tagline}</p>

            <div className="card-specs-matrix">
              <div className="spec-item">
                <span className="spec-lbl">Card Limit</span>
                <span className="spec-val" style={{ color: cardTiers[activeCardTier].accentColor }}>
                  {cardTiers[activeCardTier].limit}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-lbl">Chip Technology</span>
                <span className="spec-val">EMV Dual Interface + Contactless NFC</span>
              </div>
              <div className="spec-item">
                <span className="spec-lbl">Hardware Biometrics</span>
                <span className="spec-val">Sensors paired to collector device</span>
              </div>
              <div className="spec-item">
                <span className="spec-lbl">Security Action</span>
                <span className="spec-val" style={{ color: '#10B981' }}>Instant 0-Lag Remote Freeze</span>
              </div>
            </div>

            <div className="card-actions-interactive-row">
              <button
                type="button"
                className="btn-card-action"
                onClick={() => setCardFlipped(!cardFlipped)}
              >
                <RotateCcw size={16} />
                <span>{cardFlipped ? 'View Front Side' : 'Flip to Back (CVV)'}</span>
              </button>

              <button
                type="button"
                className={`btn-card-action ${nfcBeaming ? 'active' : ''}`}
                onClick={triggerNfcBeam}
              >
                <Wifi size={16} />
                <span>Simulate Contactless Beam</span>
              </button>

              <button
                type="button"
                className="qonto-btn-hero"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
                onClick={() => navigate('/login')}
              >
                <span>Request Card</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right 3D Rotatable Stage with Illuminated Acrylic Pedestal */}
          <div
            className="card-studio-3d-stage"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            {nfcBeaming && <div className="nfc-pulse-ring" />}

            <div
              className={`holographic-3d-card ${cardFlipped ? 'is-flipped' : ''}`}
              style={{
                transform: `perspective(1400px) rotateX(${cardRotation.x}deg) rotateY(${
                  cardRotation.y + (cardFlipped ? 180 : 0)
                }deg)`,
                background: cardTiers[activeCardTier].gradient,
                border: `1.5px solid ${cardTiers[activeCardTier].border}`,
              }}
            >
              {/* Dynamic Specular Light Glare */}
              <div
                className="card-surface-specular"
                style={{
                  background: `radial-gradient(circle at ${cardShine.x}% ${cardShine.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`,
                  opacity: cardShine.opacity,
                }}
              />

              {/* CARD FRONT */}
              <div className="card-face card-front">
                <div className="card-front-top">
                  <div className="chip-gold-emv" />
                  <div className="nfc-contactless-icon">
                    <Wifi size={20} color="rgba(255,255,255,0.7)" />
                  </div>
                </div>

                <div className="card-front-middle">
                  <span className="card-number-embossed">{cardTiers[activeCardTier].cardNum}</span>
                </div>

                <div className="card-front-bottom">
                  <div>
                    <span className="card-lbl-mini">CARDHOLDER</span>
                    <span className="card-val-name">{cardTiers[activeCardTier].holder}</span>
                  </div>
                  <div>
                    <span className="card-lbl-mini">EXPIRES</span>
                    <span className="card-val-date">10/29</span>
                  </div>
                  <div className="card-brand-seal">Finance</div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="card-face card-back">
                <div className="card-magstripe" />
                <div className="card-signature-box">
                  <div className="signature-lines">AUTHORIZED SIGNATURE</div>
                  <div className="cvv-badge">CVV 894</div>
                </div>
                <div className="card-back-disclaimer">
                  This card is property of Finance Sovereign Treasury. Authorized for approved branch disbursement & route cash matching.
                </div>
              </div>
            </div>

            {/* Glowing Floor Pedestal Reflection */}
            <div
              className="card-stand-pedestal"
              style={{
                boxShadow: `0 15px 35px ${cardTiers[activeCardTier].accentColor}33`,
              }}
            />

            <div className="card-hint-text">
              Move cursor to tilt in 3D perspective · Click Flip to inspect CVV
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. 3D ISOMETRIC ROUTE & BAZAAR TELEMETRY STATION
          -------------------------------------------------------------------- */}
      <section className="route-telemetry-section" id="route-telemetry">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">REAL-TIME FIELD TELEMETRY</div>
          <h2 className="qonto-section-intro-title">Live 3D route pathfinding & collection telemetry</h2>
        </div>

        <div className="route-telemetry-box">
          {/* Left: 3D Isometric Route Radar Stage */}
          <div className="route-isometric-stage">
            <div className="telemetry-badge-overlay">
              <span className="badge-dot-live" />
              <span>ISOMETRIC FIELD STATION #08</span>
            </div>

            {/* Live Collection Toast Banner */}
            <div className="route-live-toast">
              <CheckCircle2 size={15} color="#10B981" />
              <span>{lastPaymentToast}</span>
            </div>

            {/* 3D Isometric Map Board */}
            <div className="route-map-board">
              <div className="grid-isometric-mesh" />

              {/* District Blocks */}
              <div className="map-district district-saidapet">Saidapet</div>
              <div className="map-district district-mylapore">Mylapore</div>
              <div className="map-district district-tnagar">T. Nagar</div>

              {/* Waypoints */}
              {waypoints.map((wp, idx) => (
                <div
                  key={wp.id}
                  className={`waypoint-node ${currentWaypointIdx === idx ? 'is-active' : ''} ${
                    idx < currentWaypointIdx ? 'is-cleared' : ''
                  }`}
                  style={{ top: `${wp.y}%`, left: `${wp.x}%` }}
                >
                  <div className="waypoint-pillar" />
                  <div className="waypoint-pin">
                    <span className="pin-tag">{wp.amount}</span>
                  </div>
                  <span className="waypoint-label">{wp.name}</span>
                </div>
              ))}

              {/* Moving Field Collector Beacon */}
              <div
                className="collector-gps-beacon"
                style={{
                  top: `${waypoints[currentWaypointIdx].y}%`,
                  left: `${waypoints[currentWaypointIdx].x}%`,
                }}
              >
                <div className="beacon-radar-pulse" />
                <div className="beacon-core">
                  <Compass size={12} color="#FFFFFF" />
                </div>
                <div className="beacon-tooltip">Agent V. Ram (Live)</div>
              </div>
            </div>
          </div>

          {/* Right: Operational Telemetry Metrics */}
          <div className="route-telemetry-sidebar">
            <div className="qonto-hero-badge" style={{ marginBottom: '1.25rem' }}>
              <MapPin size={14} color="#10B981" />
              <span>COLLECTOR ROUTE #08 (SAIDAPET & MYLAPORE)</span>
            </div>

            <h3>Automated Route Pathfinding</h3>
            <p>
              Track field agent routes, instant offline cash match pings, and bazaar merchant installments mapped continuously in 3D perspective.
            </p>

            <div className="telemetry-metrics-grid">
              <div className="telemetry-stat">
                <span className="stat-label">Merchants Cleared</span>
                <span className="stat-value">{currentWaypointIdx + 1} / {waypoints.length}</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Collected Today</span>
                <span className="stat-value" style={{ color: '#10B981' }}>₹18,750.00</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Active Field Agent</span>
                <span className="stat-value">Agent V. Ram</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Route Discrepancy</span>
                <span className="stat-value" style={{ color: '#60A5FA' }}>0.00 (Zero Leakage)</span>
              </div>
            </div>

            <div className="telemetry-actions-row">
              <button
                type="button"
                className={`btn-telemetry-action ${routeSpeed === 'STANDARD' ? 'active' : ''}`}
                onClick={() => setRouteSpeed('STANDARD')}
              >
                <span>Standard Sweep</span>
              </button>

              <button
                type="button"
                className={`btn-telemetry-action ${routeSpeed === 'ACCELERATED' ? 'active' : ''}`}
                onClick={() => setRouteSpeed('ACCELERATED')}
              >
                <Zap size={14} />
                <span>Accelerate Route (2x)</span>
              </button>

              <button
                type="button"
                className="qonto-btn-hero"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
                onClick={() => navigate('/login')}
              >
                <span>Open Collector Portal</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. 3D SOVEREIGN VAULT GYRO-GIMBAL CHAMBER
          -------------------------------------------------------------------- */}
      <section className="vault-3d-section" id="vault-chamber">
        <div className="vault-chamber-card">
          {/* Left: Real Multi-Axis 3D Gyroscope Gimbal Core */}
          <div className="vault-gyro-stage">
            <div className="vault-badge-overlay">
              <Radio size={12} color="#10B981" />
              <span>3D CRYPTOGRAPHIC GIMBAL CORE</span>
            </div>

            <div className={`gyro-gimbal-system mode-${vaultPulseMode.toLowerCase()}`}>
              {/* Ring 1: Outer Titanium Yaw Gimbal */}
              <div className="gimbal-ring ring-outer">
                <div className="ring-circuit-node node-1" />
                <div className="ring-circuit-node node-2" />
              </div>

              {/* Ring 2: Intermediate Sapphire Pitch Gimbal */}
              <div className="gimbal-ring ring-middle">
                <div className="ring-circuit-node node-3" />
                <div className="ring-circuit-node node-4" />
              </div>

              {/* Ring 3: Inner Emerald Flux Gimbal */}
              <div className="gimbal-ring ring-inner">
                <div className="ring-circuit-node node-5" />
              </div>

              {/* Central Floating 3D Sovereign Holographic Prism */}
              <div className="vault-sovereign-core">
                <div className="core-crystal-prism">
                  <span className="core-currency-seal">₹</span>
                </div>
                <div className="core-ambient-aura" />
              </div>
            </div>

            <div className="vault-stage-status">
              <span>Integrity: <strong style={{ color: '#10B981' }}>{vaultStats.reconciledRate}</strong></span>
              <span>Block: <code>{vaultStats.blockHash}</code></span>
            </div>
          </div>

          {/* Right: Treasury Operations & Simulation Controls */}
          <div className="vault-chamber-info">
            <div className="qonto-hero-badge" style={{ marginBottom: '1.25rem' }}>
              <Zap size={14} color="#C084FC" />
              <span>CRYPTOGRAPHIC TREASURY VAULT</span>
            </div>
            <h3>The Sovereign Central Vault Core</h3>
            <p>
              Witness real-time double-entry balancing. Field collections, capital injections, and loan disbursements are mirrored with microsecond telemetry across all physical branches.
            </p>

            <div className="vault-stats-display-grid">
              <div className="v-stat-card">
                <span className="v-stat-lbl">Active Vault Balance</span>
                <span className="v-stat-num">{vaultStats.activeBalance}</span>
              </div>
              <div className="v-stat-card">
                <span className="v-stat-lbl">Today's Total Inflow</span>
                <span className="v-stat-num" style={{ color: '#10B981' }}>{vaultStats.dayInflow}</span>
              </div>
            </div>

            <div className="vault-interactive-controls">
              <button
                type="button"
                className={`vault-btn-action ${vaultPulseMode === 'COLLECT' ? 'active' : ''}`}
                onClick={triggerCollectionSimulation}
              >
                <TrendingUp size={16} />
                <span>Simulate Collection (+₹1,250)</span>
              </button>

              <button
                type="button"
                className={`vault-btn-action ${vaultPulseMode === 'DISBURSE' ? 'active' : ''}`}
                onClick={triggerDisbursalSimulation}
              >
                <CreditCard size={16} />
                <span>Simulate Disbursal (-₹15,000)</span>
              </button>

              <button
                type="button"
                className="qonto-btn-hero"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.9rem' }}
                onClick={() => navigate('/login')}
              >
                <span>Access Treasury</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. 3D ISOMETRIC LIQUIDITY & TREASURY BAR RADAR
          -------------------------------------------------------------------- */}
      <section className="liquidity-3d-section" id="liquidity-radar">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">LIQUIDITY & TREASURY RADAR</div>
          <h2 className="qonto-section-intro-title">Isometric 3D circulating capital & cash flow</h2>
        </div>

        <div className="liquidity-card-box">
          <div className="liquidity-header-row">
            <div>
              <h3 className="liquidity-title">Circulating Capital Flow</h3>
              <p className="liquidity-sub">Real-time daily collection volume vs deployed credit capital</p>
            </div>

            <div className="liquidity-time-toggles">
              <button
                type="button"
                className={`time-toggle-btn ${liquidityTimeframe === 'daily' ? 'active' : ''}`}
                onClick={() => setLiquidityTimeframe('daily')}
              >
                Daily Micro-Cycles
              </button>
              <button
                type="button"
                className={`time-toggle-btn ${liquidityTimeframe === 'weekly' ? 'active' : ''}`}
                onClick={() => setLiquidityTimeframe('weekly')}
              >
                Weekly Chit Pools
              </button>
              <button
                type="button"
                className={`time-toggle-btn ${liquidityTimeframe === 'monthly' ? 'active' : ''}`}
                onClick={() => setLiquidityTimeframe('monthly')}
              >
                Monthly SME Facilities
              </button>
            </div>
          </div>

          {/* 3D Sculpted Isometric Columns Stage */}
          <div className="liquidity-columns-stage">
            <div className="columns-floor-grid" />

            <div className="columns-row-container">
              {liquidityData[liquidityTimeframe].map((item, idx) => (
                <div
                  key={idx}
                  className={`isometric-column-wrapper ${item.featured ? 'is-featured' : ''}`}
                  onMouseEnter={() => setActiveHoverBar(item)}
                  onMouseLeave={() => setActiveHoverBar(null)}
                >
                  {/* Tooltip on hover */}
                  {activeHoverBar?.label === item.label && (
                    <div className="column-floating-tooltip">
                      <div className="tooltip-amount">{item.amount}</div>
                      <div className="tooltip-sub">{item.volume} · {item.trend}</div>
                    </div>
                  )}

                  {/* 3D Pillar Geometry */}
                  <div
                    className="pillar-3d-body"
                    style={{ height: `${item.height * 1.5}px` }}
                  >
                    <div className="pillar-face pillar-front" />
                    <div className="pillar-face pillar-side" />
                    <div className="pillar-face pillar-top">
                      <span className="pillar-top-num">{item.amount}</span>
                    </div>
                  </div>

                  <span className="pillar-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="liquidity-footer-metrics">
            <div className="footer-metric-pill">
              <span className="dot-green" />
              <span>Today's Total Inflow: <strong>₹3,50,000</strong></span>
            </div>
            <div className="footer-metric-pill">
              <span className="dot-blue" />
              <span>Active Deployed Capital: <strong>₹48,20,500</strong></span>
            </div>
            <div className="footer-metric-pill">
              <span className="dot-purple" />
              <span>Double-Entry Reconciled: <strong>100.0%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          8. 3D ISOMETRIC WORKFLOW PIPELINE
          -------------------------------------------------------------------- */}
      <section className="pipeline-section" id="pipeline">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">END-TO-END PIPELINE</div>
          <h2 className="qonto-section-intro-title">From market bazaar to central double-entry cloud</h2>
        </div>

        <div className="pipeline-grid">
          <div className="pipeline-card">
            <div className="pipeline-icon-cube">
              <Building2 size={24} />
            </div>
            <div className="pipeline-step-badge">STEP 01</div>
            <h3 className="pipeline-title">Bazaar Merchant</h3>
            <p className="pipeline-desc">
              100-day or 10-week cycle allotment registered with borrower shop photo, identity verification, and geo-coordinates.
            </p>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-icon-cube">
              <Smartphone size={24} />
            </div>
            <div className="pipeline-step-badge">STEP 02</div>
            <h3 className="pipeline-title">Collector Mobile Terminal</h3>
            <p className="pipeline-desc">
              Field agents log route collections with hardware biometric unlock, offline SQLite sync, and one-tap customer calls.
            </p>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-icon-cube">
              <Zap size={24} />
            </div>
            <div className="pipeline-step-badge">STEP 03</div>
            <h3 className="pipeline-title">Instant Digital Receipt</h3>
            <p className="pipeline-desc">
              Automated WhatsApp delivery sends verified payment receipts and remaining balance alerts directly to the borrower.
            </p>
          </div>

          <div className="pipeline-card">
            <div className="pipeline-icon-cube">
              <Server size={24} />
            </div>
            <div className="pipeline-step-badge">STEP 04</div>
            <h3 className="pipeline-title">Central Vault Ledger</h3>
            <p className="pipeline-desc">
              Supervisors verify daily cash handoffs against immutable cryptographic audit logs with zero mathematical leakage.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          9. MOBILE APP VS WEB HQ PLATFORM COMPARISON
          -------------------------------------------------------------------- */}
      <section className="platform-comparison-section" id="platform">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">SPECIALIZED INTERFACES</div>
          <h2 className="qonto-section-intro-title">Purpose-built for field collectors and treasury admins</h2>
        </div>

        <div className="platform-toggle-container">
          <button
            type="button"
            className={`platform-toggle-btn ${platformTab === 'mobile' ? 'active' : ''}`}
            onClick={() => setPlatformTab('mobile')}
          >
            <Smartphone size={18} />
            <span>Field Collector Mobile Terminal</span>
          </button>

          <button
            type="button"
            className={`platform-toggle-btn ${platformTab === 'web' ? 'active' : ''}`}
            onClick={() => setPlatformTab('web')}
          >
            <Laptop size={18} />
            <span>Sovereign Web Admin HQ</span>
          </button>
        </div>

        {platformTab === 'mobile' ? (
          <div className="platform-panel-content">
            <div className="platform-features-grid">
              <div className="platform-feature-card">
                <Printer size={22} color="#10B981" />
                <h4>Bluetooth 58mm Thermal Printing</h4>
                <p>Instantly issue physical receipt slips on the spot to bazaar merchants via portable Bluetooth thermal printers.</p>
              </div>

              <div className="platform-feature-card">
                <ShieldCheck size={22} color="#60A5FA" />
                <h4>Hardware Biometric Sensor Lock</h4>
                <p>FaceID and Android Fingerprint sensors ensure staff handsets lock instantly upon app minimization or inactivity.</p>
              </div>

              <div className="platform-feature-card">
                <Wifi size={22} color="#F59E0B" />
                <h4>Offline SQLite Auto-Sync</h4>
                <p>Record collections even inside basement shops or zero-coverage areas. Encrypted records auto-sync when online.</p>
              </div>

              <div className="platform-feature-card">
                <QrCode size={22} color="#C084FC" />
                <h4>Dynamic UPI QR & WhatsApp Alert</h4>
                <p>Generate customer-specific UPI QR codes for cash-free payments, automatically dispatching WhatsApp confirmations.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="platform-panel-content">
            <div className="platform-features-grid">
              <div className="platform-feature-card">
                <Building2 size={22} color="#10B981" />
                <h4>Multi-Branch Cash Vault Governance</h4>
                <p>Monitor physical cash chests, collector handoffs, and branch liquidity with cryptographic double-entry checks.</p>
              </div>

              <div className="platform-feature-card">
                <FileSpreadsheet size={22} color="#60A5FA" />
                <h4>Automated RBI/NBFC Compliance Export</h4>
                <p>One-click audit spreadsheets, PAR (Portfolio at Risk) reports, and NPA tracking exportable in PDF and Excel.</p>
              </div>

              <div className="platform-feature-card">
                <Activity size={22} color="#F59E0B" />
                <h4>Staff Incentive & Performance Radar</h4>
                <p>Track collector recovery rates, route completion velocities, and compute automatic monthly commission payouts.</p>
              </div>

              <div className="platform-feature-card">
                <Lock size={22} color="#C084FC" />
                <h4>Granular Role-Based Permissions</h4>
                <p>Safeguard ledger integrity with strict role limits for Admins, Cashiers, Route Officers, and External Auditors.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------
          10. 6-STAGE BORROWER LIFECYCLE ROADMAP
          -------------------------------------------------------------------- */}
      <section className="lifecycle-section" id="lifecycle">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">MICRO-LENDING LIFECYCLE</div>
          <h2 className="qonto-section-intro-title">Complete borrower journey from onboarding to rebate</h2>
        </div>

        <div className="lifecycle-cards-grid">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={idx}
              className={`lifecycle-card ${activeLifecycleStage === idx ? 'active' : ''}`}
              onClick={() => setActiveLifecycleStage(idx)}
            >
              <div className="lifecycle-num">{stage.num}</div>
              <div className="lifecycle-badge">{stage.badge}</div>
              <h3 className="lifecycle-title">{stage.title}</h3>
              <span className="lifecycle-sub">{stage.subtitle}</span>
              <p className="lifecycle-desc">{stage.desc}</p>
              <div className="lifecycle-metric-footer">{stage.metrics}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          11. REAL-TIME CRYPTOGRAPHIC AUDIT STREAM
          -------------------------------------------------------------------- */}
      <section className="audit-feed-section" id="audit-feed">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">LIVE TRANSACTION BROADCAST</div>
          <h2 className="qonto-section-intro-title">Double-entry cryptographic ledger broadcast</h2>
        </div>

        <div className="audit-feed-container">
          <div className="audit-feed-header">
            <div className="feed-status-dot">
              <span className="badge-dot-live" />
              <span>LIVE WEBSOCKET STREAM</span>
            </div>

            <button
              type="button"
              className="btn-feed-control"
              onClick={() => setAuditStreamPaused(!auditStreamPaused)}
            >
              {auditStreamPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{auditStreamPaused ? 'Resume Feed' : 'Pause Feed'}</span>
            </button>
          </div>

          <div className="audit-items-list">
            {auditLogs.map((log) => (
              <div key={log.id} className="audit-feed-item">
                <div className="item-left-block">
                  <span className="item-branch">{log.branch}</span>
                  <p className="item-desc">{log.desc}</p>
                  <span className="item-hash">Hash: {log.hash}</span>
                </div>

                <div className="item-right-block">
                  <span className="item-amount">{log.amount}</span>
                  <span className="item-status-pill">{log.status}</span>
                  <span className="item-time">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          12. INTERACTIVE PRODUCT EXPERIENCE TABS
          -------------------------------------------------------------------- */}
      <section className="product-showcase-section" id="schemes">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">LENDING SCHEMES</div>
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
          13. INTERACTIVE ROI & TIME-SAVINGS CALCULATOR
          -------------------------------------------------------------------- */}
      <section className="roi-section" id="roi-calculator">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">QUANTIFIABLE ROI</div>
          <h2 className="qonto-section-intro-title">Calculate your monthly operational time savings</h2>
        </div>

        <div className="roi-card">
          <div className="roi-controls">
            <div className="calc-input-group">
              <div className="calc-label-row">
                <span>Active Field Collection Staff</span>
                <span className="calc-display-val">{numAgents} Agents</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={numAgents}
                onChange={(e) => setNumAgents(Number(e.target.value))}
                className="qonto-range-slider"
              />
            </div>

            <div className="calc-input-group">
              <div className="calc-label-row">
                <span>Total Active Borrowers</span>
                <span className="calc-display-val">{numBorrowers.toLocaleString('en-IN')} Borrowers</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={numBorrowers}
                onChange={(e) => setNumBorrowers(Number(e.target.value))}
                className="qonto-range-slider"
              />
            </div>
          </div>

          <div className="roi-stats-display">
            <div className="roi-stat-box">
              <div className="roi-stat-number">{hoursSavedPerMonth}+ hrs</div>
              <div className="roi-stat-label">Saved on manual ledger entry each month</div>
            </div>

            <div className="roi-stat-box">
              <div className="roi-stat-number">{speedMultiplier}x</div>
              <div className="roi-stat-label">Faster daily route collection speed</div>
            </div>

            <div className="roi-stat-box">
              <div className="roi-stat-number">100%</div>
              <div className="roi-stat-label">Zero cash discrepancy on route handoff</div>
            </div>

            <div className="roi-stat-box">
              <div className="roi-stat-number">₹{estimatedCostSaving}</div>
              <div className="roi-stat-label">Estimated monthly admin overhead saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          14. SCHEMES DEEP-DIVE COMPARISON MATRIX
          -------------------------------------------------------------------- */}
      <section className="comparison-section" id="schemes-matrix">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">PORTFOLIO MATRIX</div>
          <h2 className="qonto-section-intro-title">Complete comparison of lending schemes</h2>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Lending Scheme</th>
                <th>Target Borrower</th>
                <th>Tenure Cycles</th>
                <th>Standard Principal</th>
                <th>Collection Frequency</th>
                <th>Grace Policy</th>
                <th>Receipt Channel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Daily Merchant</strong></td>
                <td>Bazaar Vendors, Provision Stores</td>
                <td>100 Days</td>
                <td>₹5,000 – ₹50,000</td>
                <td>Daily (6 Days/Wk)</td>
                <td>48-Hour Alert Window</td>
                <td>WhatsApp + Thermal Print</td>
              </tr>
              <tr>
                <td><strong>Weekly Chit</strong></td>
                <td>Trade Associations, Groups</td>
                <td>10 Weeks</td>
                <td>₹10,000 – ₹1,00,000</td>
                <td>Weekly Fixed Day</td>
                <td>7-Day Route Check</td>
                <td>Digital App Receipt</td>
              </tr>
              <tr>
                <td><strong>Monthly Business</strong></td>
                <td>SMEs, Retail Showrooms</td>
                <td>12 – 24 Months</td>
                <td>₹1,00,000 – ₹10,00,000</td>
                <td>Monthly 1st/5th</td>
                <td>10-Day Grace Period</td>
                <td>Direct Bank Debit / UPI</td>
              </tr>
              <tr>
                <td><strong>Emergency Bridge</strong></td>
                <td>Verified Past Borrowers</td>
                <td>15 – 30 Days</td>
                <td>₹5,000 – ₹25,000</td>
                <td>Bullet / Weekly</td>
                <td>24-Hour Notice</td>
                <td>Instant SMS & WhatsApp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          15. INTERACTIVE LOAN CALCULATOR
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
          16. ENTERPRISE SECURITY & COMPLIANCE BENTO GRID
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
          17. CLIENT TESTIMONIALS & TRUST PROOF
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
          18. FAQ ACCORDION
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
          19. INSTITUTIONAL METRICS SECTION
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
          20. BOTTOM CONVERSION ACTION
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
          21. COMPREHENSIVE FOOTER
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
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')}>Daily Bazaar Loans</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')}>Weekly Chit Cycles</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')}>Monthly Business EMIs</a></li>
              <li><a href="#vault-chamber" onClick={(e) => scrollToSection(e, 'vault-chamber')}>Central Vault</a></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h5>3D Engine</h5>
            <ul>
              <li><a href="#card-studio" onClick={(e) => scrollToSection(e, 'card-studio')}>Smart Card Studio</a></li>
              <li><a href="#route-telemetry" onClick={(e) => scrollToSection(e, 'route-telemetry')}>Route Operations</a></li>
              <li><a href="#vault-chamber" onClick={(e) => scrollToSection(e, 'vault-chamber')}>Sovereign Vault</a></li>
              <li><a href="#liquidity-radar" onClick={(e) => scrollToSection(e, 'liquidity-radar')}>Cash Flow Radar</a></li>
              <li><a href="#lifecycle" onClick={(e) => scrollToSection(e, 'lifecycle')}>Borrower Journey</a></li>
              <li><a href="#audit-feed" onClick={(e) => scrollToSection(e, 'audit-feed')}>Security & Ledger</a></li>
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
