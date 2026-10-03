import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../../../assets/logo-tight.png';
import { LiquidHeroArtwork } from './LiquidHeroArtwork';
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
  Users,
  Layers,
  Receipt,
  Check,
  Percent,
  Wallet,
  Activity,
  Calendar,
  Eye,
  EyeOff,
  Database,
  Fingerprint,
  Save,
  Search,
  Menu,
} from 'lucide-react';
import './Welcome.css';

export const WelcomePage = () => {
  const navigate = useNavigate();

  // Scroll Header state
  const [isScrolled, setIsScrolled] = useState(false);

  // Multi-Tenant Interactive Hero State
  const [selectedTenantIdx, setSelectedTenantIdx] = useState(0);
  const [isConfidentialMode, setIsConfidentialMode] = useState(true);
  const [heroActiveView, setHeroActiveView] = useState('overview'); // 'overview', 'branches', 'enclave'
  const [activeTab, setActiveTab] = useState('daily');
  const [openFaq, setOpenFaq] = useState(0);

  // Multi-Tenant Demo Data Profiles (Sanitized, Confidential Enterprise Architecture)
  const tenantProfiles = [
    {
      id: 'ORG-8041',
      name: 'Apex Finance Corp',
      tier: 'Enterprise NBFC',
      subdomain: 'apex-capital.financeapp.io',
      branchesCount: 12,
      agentsCount: 48,
      scheme: 'Daily 100-Day Merchant Advances',
      stats: {
        portfolio: '₹4,82,50,000',
        portfolioMasked: '₹ • • , • • , • • •',
        todayCollections: '₹3,84,250',
        todayCollectionsMasked: '₹ • , • • , • • •',
        borrowersCount: '1,420 Active',
        recoveryRate: '99.4%',
        vaultBalance: '₹12,45,000',
        vaultBalanceMasked: '₹ • • , • • , • • •',
      },
      branches: [
        { name: 'Central Branch Hub', collectors: 14, status: 'Reconciled' },
        { name: 'Metropolitan Commercial Branch', collectors: 18, status: 'Reconciled' },
        { name: 'Bazaar Route Cluster Branch', collectors: 16, status: 'Reconciled' },
      ],
      stream: [
        { id: 'TX-901', shop: 'Merchant #M-8821', route: 'Sector 04 Route', amount: '₹125.00', status: 'Cleared' },
        { id: 'TX-902', shop: 'Merchant #M-4412', route: 'Sector 12 Route', amount: '₹250.00', status: 'Cleared' },
        { id: 'TX-903', shop: 'Merchant #M-7709', route: 'Sector 02 Route', amount: '₹500.00', status: 'Cleared' },
      ],
    },
    {
      id: 'ORG-9214',
      name: 'Zenith Chit Fund Syndicate',
      tier: 'Multi-Branch Cooperative',
      subdomain: 'zenith-chits.financeapp.io',
      branchesCount: 8,
      agentsCount: 32,
      scheme: 'Weekly Chit & Group Lending',
      stats: {
        portfolio: '₹2,65,00,000',
        portfolioMasked: '₹ • • , • • , • • •',
        todayCollections: '₹2,10,000',
        todayCollectionsMasked: '₹ • , • • , • • •',
        borrowersCount: '860 Active',
        recoveryRate: '99.8%',
        vaultBalance: '₹38,50,000',
        vaultBalanceMasked: '₹ • • , • • , • • •',
      },
      branches: [
        { name: 'Regional Chit Office', collectors: 12, status: 'Reconciled' },
        { name: 'Industrial Belt Branch', collectors: 10, status: 'Reconciled' },
        { name: 'Suburban Hub Branch', collectors: 10, status: 'Reconciled' },
      ],
      stream: [
        { id: 'TX-601', shop: 'Chit Group #G-104', route: 'Weekly Batch A', amount: '₹2,500.00', status: 'Cleared' },
        { id: 'TX-602', shop: 'Chit Group #G-208', route: 'Weekly Batch B', amount: '₹5,000.00', status: 'Cleared' },
        { id: 'TX-603', shop: 'Chit Group #G-112', route: 'Weekly Batch A', amount: '₹2,500.00', status: 'Cleared' },
      ],
    },
    {
      id: 'ORG-7750',
      name: 'Sovereign Rural Microcredit',
      tier: 'Federated Rural Credit Hub',
      subdomain: 'sovereign-credit.financeapp.io',
      branchesCount: 16,
      agentsCount: 64,
      scheme: 'Hybrid Bazaar & Weekly Microcredit',
      stats: {
        portfolio: '₹6,15,00,000',
        portfolioMasked: '₹ • • , • • , • • •',
        todayCollections: '₹5,20,000',
        todayCollectionsMasked: '₹ • , • • , • • •',
        borrowersCount: '2,840 Active',
        recoveryRate: '99.1%',
        vaultBalance: '₹45,20,000',
        vaultBalanceMasked: '₹ • • , • • , • • •',
      },
      branches: [
        { name: 'Agri Mandi Terminal', collectors: 22, status: 'Reconciled' },
        { name: 'Wholesale Market Division', collectors: 24, status: 'Reconciled' },
        { name: 'Retail Merchant Cluster', collectors: 18, status: 'Reconciled' },
      ],
      stream: [
        { id: 'TX-401', shop: 'Terminal #T-102', route: 'Mandi Route 01', amount: '₹375.00', status: 'Cleared' },
        { id: 'TX-402', shop: 'Terminal #T-309', route: 'Mandi Route 04', amount: '₹125.00', status: 'Cleared' },
        { id: 'TX-403', shop: 'Terminal #T-512', route: 'Mandi Route 02', amount: '₹250.00', status: 'Cleared' },
      ],
    },
  ];

  const currentTenant = tenantProfiles[selectedTenantIdx];

  // Org Admin Interactive Configurator Demo State
  const [adminConfigScheme, setAdminConfigScheme] = useState('DAILY');
  const [adminDailyRate, setAdminDailyRate] = useState(10.0);
  const [adminDailyTenure, setAdminDailyTenure] = useState(100);
  const [adminWeeklyRate, setAdminWeeklyRate] = useState(10.0);
  const [adminWeeklyTenure, setAdminWeeklyTenure] = useState(10);
  const [adminOperatingDays, setAdminOperatingDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
  const [adminToast, setAdminToast] = useState(false);

  // Repayment Mode Demo State ('NORMAL' vs 'LUMP_SUM_END')
  const [repaymentDemoMode, setRepaymentDemoMode] = useState('LUMP_SUM_END');

  // Interactive Loan Calculator State
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcScheme, setCalcScheme] = useState('DAILY');
  const [calcTenure, setCalcTenure] = useState(100);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const interestRate = calcScheme === 'DAILY' ? 25 : calcScheme === 'WEEKLY' ? 22 : 18;
  const totalInterest = Math.round(calcAmount * (interestRate / 100));
  const totalRepayable = calcAmount + totalInterest;
  const cycleInstallment = Math.round(totalRepayable / calcTenure);

  const handleSchemeChange = (scheme) => {
    setCalcScheme(scheme);
    if (scheme === 'DAILY') setCalcTenure(100);
    else if (scheme === 'WEEKLY') setCalcTenure(10);
    else setCalcTenure(12);
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // FAQ Data tailored to Multi-Tenant SaaS
  const faqs = [
    {
      q: 'How does Multi-Tenant separation guarantee that customer credentials remain confidential?',
      a: 'Every finance organization is provisioned with an isolated cryptographic tenant workspace. Borrower identities, phone numbers, phone OTPs, and double-entry vault records are cryptographically tagged with organization UUIDs. No tenant or branch officer can ever query, inspect, or leak data outside their assigned organization.',
    },
    {
      q: 'Can our organization operate multiple physical branches on our own branded workspace?',
      a: 'Yes. Each tenant receives a dedicated white-labeled portal (e.g. yourcompany.financeapp.io). The organization admin can create unlimited branches, assign branch managers, define local route collectors, and monitor real-time cash balances across physical branch safes.',
    },
    {
      q: 'How do field agents record collections offline in busy bazaars?',
      a: 'Field agents utilize our encrypted mobile app with local SQLite storage. When collecting daily 100-day bazaar installments or weekly chits without network connectivity, agents issue 58mm thermal receipts via Bluetooth. The records automatically synchronize securely with central cloud vaults as soon as connectivity resumes.',
    },
    {
      q: 'What role-based access control (RBAC) levels exist in the platform?',
      a: 'The system enforces 4 strict governance tiers: (1) SuperAdmin Platform Overseer, (2) Organization Admin (Tenant Owner), (3) Branch Officer / Cashier, and (4) Field Collection Route Agent. Each tier has tightly enforced token expiration and permission sets.',
    },
    {
      q: 'Can each organization configure custom interest rates and 100-day cycles?',
      a: 'Yes. Tenant Admins can set organization-specific lending rules: 100-day daily merchant advances (e.g. ₹10,000 principal yields ₹12,500 at ₹125/day), 10-week/20-week chit funds, or monthly business loans, complete with automated penalty grace periods.',
    },
    {
      q: 'Are automated customer WhatsApp receipts sent directly?',
      a: 'Yes. Upon receiving an installment, an automated verified WhatsApp receipt with remaining balance and transaction token is dispatched directly to the borrower without exposing internal ledger credentials.',
    },
  ];

  return (
    <div className="landing-wrapper">
      {/* ================================================================
          1. EXACT LIQUID FLUID HOME SCREEN (100% IDENTICAL ARTWORK FROM REFERENCE)
          ================================================================ */}
      <section className="exact-liquid-screen" id="hero">
        <div className="exact-liquid-frame">
          {/* Authentic Fluid Liquid Hero Artwork */}
          <div className="exact-liquid-code-wrapper">
            <LiquidHeroArtwork />
          </div>

          {/* Integrated Top Navigation */}
          <nav className="exact-top-nav">
            <div className="et-links">
              <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="et-link active">Home</a>
              <a href="#multi-tenancy" onClick={(e) => scrollToSection(e, 'multi-tenancy')} className="et-link">Service</a>
              <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="et-link">Products</a>
              <a href="#admin-powers" onClick={(e) => scrollToSection(e, 'admin-powers')} className="et-link">About Us</a>
              <a href="#privacy" onClick={(e) => scrollToSection(e, 'privacy')} className="et-link">Contact</a>
            </div>

            <div className="et-right-tools">
              <button
                type="button"
                className="et-tool-btn"
                title="Portal Menu"
                onClick={() => scrollToSection({ preventDefault: () => {} }, 'multi-tenancy')}
              >
                <Menu size={20} />
              </button>
              <button
                type="button"
                className="et-tool-btn"
                title="Search Platform"
                onClick={() => scrollToSection({ preventDefault: () => {} }, 'solutions')}
              >
                <Search size={18} />
              </button>
            </div>
          </nav>

          {/* Content Block overlaid directly on the right white region */}
          <div className="exact-content-overlay">
            <div className="et-tag-badge">
              <span className="et-tag-dot" />
              <span>Next-Gen Enterprise Lending OS</span>
            </div>

            <h1 className="et-main-title">FINANCE PORTAL</h1>
            <h2 className="et-sub-title">SAAS LENDING PLATFORM</h2>

            <p className="et-desc">
              High-throughput cloud infrastructure engineered for automated 100-day daily microcredit, weekly chit fund syndicates, and centralized double-entry branch vaults with real-time audit verification.
            </p>

            <div className="et-actions">
              <button
                type="button"
                className="btn-et-join"
                onClick={() => navigate('/login')}
              >
                <span>JOIN US</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                className="btn-et-signup"
                onClick={() => navigate('/login')}
              >
                <span>SIGN UP</span>
              </button>
            </div>

            <div className="et-trust-bar">
              <div className="et-trust-item">
                <CheckCircle2 size={13} className="et-check-icon" />
                <span>Zero Credential Leakage</span>
              </div>
              <span className="et-trust-dot">•</span>
              <div className="et-trust-item">
                <CheckCircle2 size={13} className="et-check-icon" />
                <span>Multi-Tenant Vaults</span>
              </div>
              <span className="et-trust-dot">•</span>
              <div className="et-trust-item">
                <CheckCircle2 size={13} className="et-check-icon" />
                <span>Automated Daily Settlement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. WORKSPACE SHOWCASE (Live Multi-Tenant Enclave & Branch Safes)
          ================================================================ */}
      <section className="workspace-showcase-section" id="workspace-preview">
        <div className="section-header">
          <div className="section-pill">LIVE CLOUD WORKSPACE DEMO</div>
          <h2 className="section-title">Isolated multi-tenant execution with row-level security</h2>
          <p className="section-subtitle">
            Switch between demo organizations to see real-time ledger isolation and credential masking in action.
          </p>
        </div>

        <div className="hero-container" style={{ paddingTop: '1rem' }}>

          {/* ============================================================
              HERO SAAS WORKSPACE SHOWCASE (Interactive Multi-Tenant Switcher)
              ============================================================ */}
          <div className="hero-app-mockup">
            <div className="app-window-frame">
              {/* Window Top Controls */}
              <div className="window-header">
                <div className="window-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>

                <div className="window-tenant-selector">
                  <span className="selector-label">ACTIVE TENANT WORKSPACE:</span>
                  <div className="tenant-pills">
                    {tenantProfiles.map((t, idx) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`tenant-pill-btn ${selectedTenantIdx === idx ? 'active' : ''}`}
                        onClick={() => setSelectedTenantIdx(idx)}
                      >
                        <Building2 size={13} />
                        <span>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidentiality Privacy Mask Toggle */}
                <div className="window-privacy-toggle">
                  <button
                    type="button"
                    className={`privacy-btn ${isConfidentialMode ? 'is-masked' : ''}`}
                    onClick={() => setIsConfidentialMode(!isConfidentialMode)}
                    title="Toggle Confidentiality Protection Mode"
                  >
                    {isConfidentialMode ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isConfidentialMode ? 'Confidential Shield: ON' : 'Confidential Shield: OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Header: Subdomain & Navigation */}
              <div className="window-sub-bar">
                <div className="sub-bar-domain">
                  <Lock size={13} className="lock-icon" />
                  <span className="domain-text">https://{currentTenant.subdomain}</span>
                  <span className="tenant-id-tag">ID: {currentTenant.id}</span>
                </div>
                <div className="sub-bar-tabs">
                  <button
                    type="button"
                    className={`sub-tab ${heroActiveView === 'overview' ? 'active' : ''}`}
                    onClick={() => setHeroActiveView('overview')}
                  >
                    Tenant Overview
                  </button>
                  <button
                    type="button"
                    className={`sub-tab ${heroActiveView === 'branches' ? 'active' : ''}`}
                    onClick={() => setHeroActiveView('branches')}
                  >
                    Branch Network ({currentTenant.branchesCount})
                  </button>
                  <button
                    type="button"
                    className={`sub-tab ${heroActiveView === 'enclave' ? 'active' : ''}`}
                    onClick={() => setHeroActiveView('enclave')}
                  >
                    Security Enclave
                  </button>
                </div>
              </div>

              {/* Window Body: Interactive Multi-Tenant Views */}
              <div className="window-body">
                {heroActiveView === 'overview' && (
                  <>
                    {/* KPI Grid */}
                    <div className="mockup-kpi-grid">
                      <div className="kpi-card">
                        <div className="kpi-header">
                          <span className="kpi-label">Active Portfolio</span>
                          <span className="kpi-badge green">+18.4% MoM</span>
                        </div>
                        <div className="kpi-val">
                          {isConfidentialMode ? currentTenant.stats.portfolioMasked : currentTenant.stats.portfolio}
                        </div>
                        <span className="kpi-sub">{currentTenant.stats.borrowersCount}</span>
                      </div>

                      <div className="kpi-card">
                        <div className="kpi-header">
                          <span className="kpi-label">Today's Collections</span>
                          <span className="kpi-badge blue">99.4% on-time</span>
                        </div>
                        <div className="kpi-val" style={{ color: '#059669' }}>
                          {isConfidentialMode ? currentTenant.stats.todayCollectionsMasked : currentTenant.stats.todayCollections}
                        </div>
                        <span className="kpi-sub">Across {currentTenant.agentsCount} field routes</span>
                      </div>

                      <div className="kpi-card">
                        <div className="kpi-header">
                          <span className="kpi-label">Central Vault Balance</span>
                          <span className="kpi-badge purple">Double-Entry Verified</span>
                        </div>
                        <div className="kpi-val">
                          {isConfidentialMode ? currentTenant.stats.vaultBalanceMasked : currentTenant.stats.vaultBalance}
                        </div>
                        <span className="kpi-sub">{currentTenant.branchesCount} physical branches</span>
                      </div>

                      <div className="kpi-card">
                        <div className="kpi-header">
                          <span className="kpi-label">Tenant Isolation</span>
                          <span className="kpi-badge green">AES-256</span>
                        </div>
                        <div className="kpi-val" style={{ color: '#4F46E5', fontSize: '1.25rem' }}>
                          Partitioned
                        </div>
                        <span className="kpi-sub">Zero credential cross-exposure</span>
                      </div>
                    </div>

                    {/* Chart & Stream Split */}
                    <div className="mockup-split-view">
                      <div className="mockup-chart-panel">
                        <div className="panel-title-row">
                          <div>
                            <h4 className="panel-title">{currentTenant.name} · Recovery Curve</h4>
                            <p className="panel-sub">{currentTenant.scheme}</p>
                          </div>
                          <span className="badge-live-stream">● ENCRYPTED TENANT FEED</span>
                        </div>

                        <div className="chart-canvas-mock">
                          <svg viewBox="0 0 540 130" className="chart-mock-svg">
                            <defs>
                              <linearGradient id="tenantAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M0,100 Q70,35 140,65 T280,25 T420,45 T540,15 L540,130 L0,130 Z"
                              fill="url(#tenantAreaGrad)"
                            />
                            <path
                              d="M0,90 L540,25"
                              stroke="#E2E8F0"
                              strokeWidth="2"
                              strokeDasharray="6 6"
                              fill="none"
                            />
                            <path
                              d="M0,100 Q70,35 140,65 T280,25 T420,45 T540,15"
                              stroke="#4F46E5"
                              strokeWidth="3.5"
                              fill="none"
                            />
                            <circle cx="420" cy="45" r="5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" />
                          </svg>
                          <div className="chart-legend-row">
                            <div className="legend-item"><span className="legend-dot indigo" />Recovered Cashflow</div>
                            <div className="legend-item"><span className="legend-dot gray" />Target Forecast</div>
                            <div className="legend-item" style={{ marginLeft: 'auto' }}>
                              <Shield size={12} color="#059669" />
                              <span>Row-Level Security Active</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Anonymized / Confidential Incoming Ledger Stream */}
                      <div className="mockup-feed-panel">
                        <div className="panel-title-row">
                          <h4 className="panel-title">Real-Time Ingestion</h4>
                          <span className="feed-counter">Encrypted Stream</span>
                        </div>

                        <div className="live-feed-list">
                          {currentTenant.stream.map((item) => (
                            <div key={item.id} className="feed-item-card">
                              <div className="feed-avatar">
                                <Receipt size={16} color="#4F46E5" />
                              </div>
                              <div className="feed-details">
                                <div className="feed-row-top">
                                  <span className="feed-borrower">
                                    {isConfidentialMode ? `[CONFIDENTIAL ${item.id}]` : item.shop}
                                  </span>
                                  <span className="feed-amount">
                                    {isConfidentialMode ? '₹ • • •' : item.amount}
                                  </span>
                                </div>
                                <div className="feed-row-bot">
                                  <span className="feed-route">{item.route}</span>
                                  <span className="feed-tag">{item.status}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {heroActiveView === 'branches' && (
                  <div className="tenant-branches-view">
                    <div className="branch-view-header">
                      <div>
                        <h4>Configured Branch Units for {currentTenant.name}</h4>
                        <p>Each branch operates with an independent physical cash safe, staff fleet, and route schedule.</p>
                      </div>
                      <span className="badge-branches">{currentTenant.branchesCount} Total Branches</span>
                    </div>

                    <div className="branches-grid-mock">
                      {currentTenant.branches.map((b, i) => (
                        <div key={i} className="branch-card-mock">
                          <div className="b-head">
                            <Building2 size={18} color="#4F46E5" />
                            <span className="b-name">{b.name}</span>
                          </div>
                          <div className="b-meta">
                            <span>Field Fleet: <strong>{b.collectors} Collectors</strong></span>
                            <span>Safe Vault: <strong style={{ color: '#059669' }}>{b.status}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {heroActiveView === 'enclave' && (
                  <div className="tenant-enclave-view">
                    <div className="enclave-banner">
                      <ShieldCheck size={28} color="#059669" />
                      <div>
                        <h4>Cryptographic Multi-Tenant Enclave Active</h4>
                        <p>Tenant ID <code>{currentTenant.id}</code> is strictly partitioned. Database queries enforce hard row-level tenant filtering.</p>
                      </div>
                    </div>
                    <div className="enclave-features-row">
                      <div className="enclave-chip">
                        <Lock size={14} color="#4F46E5" />
                        <span>AES-256 Storage Encryption</span>
                      </div>
                      <div className="enclave-chip">
                        <Key size={14} color="#D97706" />
                        <span>RBAC Token Enforcement</span>
                      </div>
                      <div className="enclave-chip">
                        <Database size={14} color="#0891B2" />
                        <span>Zero Cross-Tenant Leakage</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Context Floating Pills */}
            <div className="floating-context-badge badge-top-left">
              <div className="f-icon-circle green">
                <Check size={14} />
              </div>
              <div>
                <div className="f-title">Zero Credential Exposure</div>
                <div className="f-desc">End-to-End Encrypted Tenant Enclave</div>
              </div>
            </div>

            <div className="floating-context-badge badge-bottom-right">
              <div className="f-icon-circle indigo">
                <Building2 size={14} />
              </div>
              <div>
                <div className="f-title">Multi-Branch Architecture</div>
                <div className="f-desc">Independent Branch Safes & Rosters</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          3. MULTI-TENANT ARCHITECTURE: 4-TIER GOVERNANCE
          ================================================================ */}
      <section className="architecture-section" id="multi-tenancy">
        <div className="section-header">
          <div className="section-pill">ENTERPRISE SAAS INFRASTRUCTURE</div>
          <h2 className="section-title">Engineered from the ground up for multi-tenancy</h2>
          <p className="section-subtitle">
            Scale from a single finance organization to hundreds of autonomous tenant companies with institutional-grade separation.
          </p>
        </div>

        <div className="architecture-grid">
          {/* Tier 1 */}
          <div className="arch-card tier-1">
            <div className="arch-tier-badge">TIER 1 · GLOBAL SAAS GOVERNANCE</div>
            <div className="arch-icon-box">
              <Server size={24} color="#4F46E5" />
            </div>
            <h3 className="arch-title">SuperAdmin Global Hub</h3>
            <p className="arch-desc">
              Platform-level control plane. Provision new tenant organizations in 60 seconds, monitor API latency, inspect audit trails, and manage cluster resources.
            </p>
            <ul className="arch-bullets">
              <li><Check size={14} className="bullet-ico" /> 1-Click Tenant Provisioning</li>
              <li><Check size={14} className="bullet-ico" /> Platform-Wide API Health</li>
              <li><Check size={14} className="bullet-ico" /> Global Compliance Auditing</li>
            </ul>
          </div>

          {/* Tier 2 */}
          <div className="arch-card tier-2">
            <div className="arch-tier-badge">TIER 2 · TENANT ORGANIZATION</div>
            <div className="arch-icon-box">
              <Building2 size={24} color="#059669" />
            </div>
            <h3 className="arch-title">Tenant Org Admin Workspace</h3>
            <p className="arch-desc">
              Autonomous corporate portal for each finance company. Define 100-day daily lending rates, weekly chit rules, and add physical branches.
            </p>
            <ul className="arch-bullets">
              <li><Check size={14} className="bullet-ico" /> Custom White-Label Subdomains</li>
              <li><Check size={14} className="bullet-ico" /> Custom Interest & Amortization</li>
              <li><Check size={14} className="bullet-ico" /> Central Treasury Balancing</li>
            </ul>
          </div>

          {/* Tier 3 */}
          <div className="arch-card tier-3">
            <div className="arch-tier-badge">TIER 3 · PHYSICAL BRANCH</div>
            <div className="arch-icon-box">
              <Layers size={24} color="#0891B2" />
            </div>
            <h3 className="arch-title">Branch Cashier Terminal</h3>
            <p className="arch-desc">
              Dedicated branch management interface. Local cashiers manage the physical branch safe, verify agent counter handovers, and disburse loans.
            </p>
            <ul className="arch-bullets">
              <li><Check size={14} className="bullet-ico" /> Local Safe Vault Reconciliation</li>
              <li><Check size={14} className="bullet-ico" /> Agent Shift Check-In / Check-Out</li>
              <li><Check size={14} className="bullet-ico" /> Zero Cross-Branch Visibility</li>
            </ul>
          </div>

          {/* Tier 4 */}
          <div className="arch-card tier-4">
            <div className="arch-tier-badge">TIER 4 · FIELD AGENT FLEET</div>
            <div className="arch-icon-box">
              <Smartphone size={24} color="#D97706" />
            </div>
            <h3 className="arch-title">Offline Field Agent Fleet</h3>
            <p className="arch-desc">
              Field agents collect on bazaar routes with offline-capable mobile apps, biometric security, Bluetooth thermal printing, and auto-sync.
            </p>
            <ul className="arch-bullets">
              <li><Check size={14} className="bullet-ico" /> Offline SQLite Local Storage</li>
              <li><Check size={14} className="bullet-ico" /> 58mm Bluetooth Thermal Print</li>
              <li><Check size={14} className="bullet-ico" /> Instant WhatsApp Receipts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          3B. ORG ADMIN POWERS: RATE CONFIGURATION & ADMIN DELEGATION
          ================================================================ */}
      <section className="admin-powers-section" id="admin-powers">
        <div className="section-header">
          <div className="section-pill">TENANT AUTONOMY & CONTROL</div>
          <h2 className="section-title">Complete power in the hands of the Org Admin</h2>
          <p className="section-subtitle">
            Configure custom interest percentage rates per scheme, manage lending operating calendars, and delegate branch administrators with explicit permission tiers.
          </p>
        </div>

        <div className="admin-powers-grid">
          {/* Feature 1: Org Admin Sets Percentage Rates & Operating Days */}
          <div className="admin-power-box">
            <div className="ap-badge-top">
              <Percent size={14} color="#4F46E5" />
              <span>CUSTOM INTEREST RATE & TENURE ENGINE</span>
            </div>
            <h3 className="ap-title">Set Custom Interest Rates & Days</h3>
            <p className="ap-desc">
              Organization Admins have 100% control over lending parameters. Define exact interest percentages, tenure lengths, minimum/maximum amounts, and operating days for each scheme.
            </p>

            <div className="ap-configurator-card">
              <div className="ap-scheme-selector">
                {['DAILY', 'WEEKLY', 'MONTHLY'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`ap-scheme-btn ${adminConfigScheme === s ? 'active' : ''}`}
                    onClick={() => {
                      setAdminConfigScheme(s);
                      if (s === 'DAILY') { setAdminDailyRate(10.0); setAdminDailyTenure(100); }
                      else if (s === 'WEEKLY') { setAdminWeeklyRate(10.0); setAdminWeeklyTenure(10); }
                      else { setAdminDailyRate(18.0); setAdminDailyTenure(12); }
                    }}
                  >
                    {s === 'DAILY' ? '100-Day Daily' : s === 'WEEKLY' ? 'Weekly Chit' : 'Monthly SME'}
                  </button>
                ))}
              </div>

              <div className="ap-control-rows">
                <div className="ap-input-row">
                  <span className="ap-lbl">Interest Percentage Rate (%):</span>
                  <div className="ap-val-stepper">
                    <button type="button" onClick={() => setAdminDailyRate(Math.max(1, adminDailyRate - 0.5))}>-</button>
                    <span className="ap-num-val">{adminDailyRate.toFixed(1)}%</span>
                    <button type="button" onClick={() => setAdminDailyRate(adminDailyRate + 0.5)}>+</button>
                  </div>
                </div>

                <div className="ap-input-row">
                  <span className="ap-lbl">Standard Tenure Duration:</span>
                  <span className="ap-badge-tenure">{adminDailyTenure} {adminConfigScheme === 'DAILY' ? 'Days' : adminConfigScheme === 'WEEKLY' ? 'Weeks' : 'Months'}</span>
                </div>

                <div className="ap-operating-days">
                  <span className="ap-lbl">Collection Operating Days:</span>
                  <div className="day-chips-row">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                      const isActive = adminOperatingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`day-chip ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            if (isActive) setAdminOperatingDays(adminOperatingDays.filter(d => d !== day));
                            else setAdminOperatingDays([...adminOperatingDays, day]);
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-ap-save"
                  onClick={() => {
                    setAdminToast(true);
                    setTimeout(() => setAdminToast(false), 3000);
                  }}
                >
                  <Save size={15} />
                  <span>{adminToast ? '✓ Rates Saved to Tenant Enclave!' : 'Save Scheme Configuration'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feature 2: Multi-Tier Staff Delegation ("Add the Admin") */}
          <div className="admin-power-box">
            <div className="ap-badge-top">
              <Users size={14} color="#059669" />
              <span>ROLE-BASED STAFF DELEGATION</span>
            </div>
            <h3 className="ap-title">Add & Delegate Administrators</h3>
            <p className="ap-desc">
              SuperAdmins and Org Admins can provision new staff in seconds. Assign explicit permission tiers to branch managers, cashiers, and mobile field collectors with branch boundaries.
            </p>

            <div className="ap-staff-directory-card">
              <div className="staff-header-row">
                <span className="sh-title">Tenant Administrative Roster</span>
                <span className="sh-badge">+ Add New Admin</span>
              </div>

              <div className="staff-roster-list">
                <div className="staff-member-item">
                  <div className="sm-avatar org">OA</div>
                  <div className="sm-info">
                    <span className="sm-name">Organization Admin</span>
                    <span className="sm-role">Tenant Corporate Control · All Branches</span>
                  </div>
                  <span className="sm-pill primary">FULL ACCESS</span>
                </div>

                <div className="staff-member-item">
                  <div className="sm-avatar branch">BA</div>
                  <div className="sm-info">
                    <span className="sm-name">Branch Manager (South Hub)</span>
                    <span className="sm-role">Branch Vault Safe · Daily Loan Approval</span>
                  </div>
                  <span className="sm-pill emerald">BRANCH BOUND</span>
                </div>

                <div className="staff-member-item">
                  <div className="sm-avatar cashier">CS</div>
                  <div className="sm-info">
                    <span className="sm-name">Cashier & Counter Desk</span>
                    <span className="sm-role">End-of-Day Agent Cash Handover</span>
                  </div>
                  <span className="sm-pill amber">CASH DESK</span>
                </div>

                <div className="staff-member-item">
                  <div className="sm-avatar agent">FA</div>
                  <div className="sm-info">
                    <span className="sm-name">Route Collection Agent</span>
                    <span className="sm-role">Mobile SQLite App · Bluetooth Thermal</span>
                  </div>
                  <span className="sm-pill cyan">ROUTE FLEET</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          3C. DUAL REPAYMENT ENGINE: NORMAL VS. LUMP_SUM_END (SETTLE AT LAST DATE)
          ================================================================ */}
      <section className="repayment-modes-section" id="repayment-modes">
        <div className="section-header">
          <div className="section-pill">SPECIALIZED FINTECH WORKFLOW</div>
          <h2 className="section-title">Cycle installments or collect full amount at the last date</h2>
          <p className="section-subtitle">
            Support diverse merchant cashflows: standard daily installments or bullet repayment at tenure maturity with early settlement waivers.
          </p>
        </div>

        <div className="repayment-modes-card">
          <div className="rm-mode-selector">
            <button
              type="button"
              className={`rm-toggle-btn ${repaymentDemoMode === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setRepaymentDemoMode('NORMAL')}
            >
              <Calendar size={18} />
              <div>
                <strong>NORMAL Collection Mode</strong>
                <span>Equal daily/weekly cycle installments</span>
              </div>
            </button>

            <button
              type="button"
              className={`rm-toggle-btn ${repaymentDemoMode === 'LUMP_SUM_END' ? 'active' : ''}`}
              onClick={() => setRepaymentDemoMode('LUMP_SUM_END')}
            >
              <Wallet size={18} />
              <div>
                <strong>LUMP_SUM_END Mode (Get Amount at Last Date)</strong>
                <span>Zero daily dues during tenure · Settle full amount on last day</span>
              </div>
            </button>
          </div>

          <div className="rm-demo-display">
            {repaymentDemoMode === 'NORMAL' ? (
              <div className="rm-mode-details">
                <div className="rm-explanation">
                  <h4>Standard Installment Recovery</h4>
                  <p>
                    Borrower receives principal (e.g. ₹10,000) and repays an exact equal installment (₹125.00) every single operating day for 100 days until ₹12,500 is recovered.
                  </p>
                  <ul className="rm-tags">
                    <li><Check size={14} /> Fixed daily collections</li>
                    <li><Check size={14} /> WhatsApp confirmation per installment</li>
                    <li><Check size={14} /> Automated overdue flags if day is missed</li>
                  </ul>
                </div>
                <div className="rm-schedule-box">
                  <div className="rm-sched-header">
                    <span>100-Day Schedule Preview (NORMAL)</span>
                    <span className="sched-tag">Daily Dues</span>
                  </div>
                  <div className="sched-rows">
                    <div className="s-row"><span className="s-day">Day 01</span><span className="s-amt">₹125.00</span><span className="status-tag green">Paid</span></div>
                    <div className="s-row"><span className="s-day">Day 02</span><span className="s-amt">₹125.00</span><span className="status-tag green">Paid</span></div>
                    <div className="s-row"><span className="s-day">Day ...</span><span className="s-amt">₹125.00 / day</span><span className="status-tag green">In Progress</span></div>
                    <div className="s-row"><span className="s-day">Day 100</span><span className="s-amt">₹125.00</span><span className="status-tag green">Final Day Cleared</span></div>
                  </div>
                  <div className="sched-footer">Total Recovered: <strong>₹12,500.00</strong></div>
                </div>
              </div>
            ) : (
              <div className="rm-mode-details">
                <div className="rm-explanation">
                  <h4>Settle Fixed Amount at Last Date (`LUMP_SUM_END`)</h4>
                  <p>
                    Specially designed for seasonal bazaar merchants, wholesale inventory purchases, and harvest traders. During days 1 to 99, daily dues are deferred (<code>DUE_AT_END</code>). On the final 100th date, the borrower repays the complete fixed amount (₹12,500.00).
                  </p>
                  <ul className="rm-tags">
                    <li><Check size={14} /> Zero daily pressure during active sales cycle</li>
                    <li><Check size={14} /> Settle full balance at last date with 1 click</li>
                    <li><Check size={14} /> Early settlement interest waiver auto-calculated</li>
                  </ul>
                </div>
                <div className="rm-schedule-box highlight">
                  <div className="rm-sched-header">
                    <span>100-Day Schedule Preview (LUMP_SUM_END)</span>
                    <span className="sched-tag purple">Bullet Repayment</span>
                  </div>
                  <div className="sched-rows">
                    <div className="s-row"><span className="s-day">Day 01 - 99</span><span className="s-amt">₹0.00 / day</span><span className="status-tag purple">DUE_AT_END</span></div>
                    <div className="s-row highlight-final">
                      <div>
                        <span className="s-day">Day 100 (Final Maturity Date)</span>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Zero-Dues Certificate Issued Upon Settle</div>
                      </div>
                      <span className="s-amt highlight">₹12,500.00</span>
                      <span className="status-tag green">Settle Full Balance</span>
                    </div>
                  </div>
                  <div className="sched-footer">
                    <span>Total Settle at Last Date: <strong style={{ color: '#4F46E5', fontSize: '1.05rem' }}>₹12,500.00</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          4. CONFIDENTIALITY & PRIVACY SHIELD
          ================================================================ */}
      <section className="privacy-section" id="privacy">
        <div className="privacy-banner-box">
          <div className="privacy-content">
            <div className="privacy-pill">
              <ShieldCheck size={16} />
              <span>TOTAL CREDENTIAL PRIVACY & ENCRYPTION</span>
            </div>
            <h2 className="privacy-heading">Your borrowers, your ledgers. 100% confidential.</h2>
            <p className="privacy-sub">
              Unlike legacy lending software that bundles records together, our multi-tenant enclave guarantees that no competitor, external user, or third party can ever see your customer names, contact credentials, or loan amounts.
            </p>

            <div className="privacy-badges-row">
              <div className="p-badge">
                <Lock size={15} color="#4F46E5" />
                <span>AES-256 Storage & SSL In-Transit</span>
              </div>
              <div className="p-badge">
                <Database size={15} color="#059669" />
                <span>Tenant-Enforced Row Level Security</span>
              </div>
              <div className="p-badge">
                <Fingerprint size={15} color="#0891B2" />
                <span>Hardware Biometric Terminal Lock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. SOLUTIONS: TAILORED FOR DAILY, WEEKLY & MONTHLY LENDING
          ================================================================ */}
      <section className="solutions-section" id="solutions">
        <div className="section-header">
          <div className="section-pill">FLEXIBLE TENANT SCHEMES</div>
          <h2 className="section-title">Support every financial model on your tenant workspace</h2>
          <p className="section-subtitle">
            Configure daily 100-day bazaar advances, weekly chit group auctions, or monthly SME term loans.
          </p>
        </div>

        <div className="solutions-tabs-nav">
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <Activity size={18} />
            <span>Daily Merchant Advance (100-Day)</span>
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <Calendar size={18} />
            <span>Weekly Chit & Market Loans</span>
          </button>
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            <Wallet size={18} />
            <span>Multi-Branch Vault Treasury</span>
          </button>
        </div>

        <div className="solution-content-card">
          {activeTab === 'daily' && (
            <div className="solution-grid">
              <div className="solution-copy">
                <div className="sol-tag">100-DAY BAZAAR AMORTIZATION</div>
                <h3 className="sol-heading">Daily bazaar merchant advance with zero collection leakage</h3>
                <p className="sol-body">
                  Disburse capital to vegetable vendors, grocery shop owners, and tea stalls in the morning. Field agents collect fixed installments every afternoon using our offline-capable mobile app.
                </p>
                <ul className="sol-checklist">
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>100-Day Mathematical Amortization:</strong> Disburse ₹10,000, collect ₹125/day to recover ₹12,500 total.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>Automated WhatsApp Receipts:</strong> Borrowers immediately receive a verified digital confirmation with days remaining.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>Route Risk Engine:</strong> Auto-flags overdue accounts and optimizes field agent sweep orders.</span>
                  </li>
                </ul>
                <button type="button" className="btn-sol-action" onClick={() => navigate('/login')}>
                  <span>Deploy Daily Advance Scheme</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="solution-preview-box">
                <div className="mini-ledger-card">
                  <div className="ml-header">
                    <span>100-Day Collection Ledger · Tenant Enclave #ORG-8041</span>
                    <span className="ml-status">Encrypted Sandbox</span>
                  </div>
                  <table className="ml-table">
                    <thead>
                      <tr>
                        <th>Account ID</th>
                        <th>Cycle</th>
                        <th>Per Day</th>
                        <th>Repaid / Target</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Merchant #M-8821</strong></td>
                        <td>Day 42/100</td>
                        <td>₹125.00</td>
                        <td>₹5,250 / ₹12,500</td>
                        <td><span className="status-tag green">Paid</span></td>
                      </tr>
                      <tr>
                        <td><strong>Merchant #M-4412</strong></td>
                        <td>Day 78/100</td>
                        <td>₹125.00</td>
                        <td>₹9,750 / ₹12,500</td>
                        <td><span className="status-tag green">Paid</span></td>
                      </tr>
                      <tr>
                        <td><strong>Merchant #M-3190</strong></td>
                        <td>Day 12/100</td>
                        <td>₹250.00</td>
                        <td>₹3,000 / ₹25,000</td>
                        <td><span className="status-tag orange">Pending</span></td>
                      </tr>
                      <tr>
                        <td><strong>Merchant #M-9024</strong></td>
                        <td>Day 95/100</td>
                        <td>₹375.00</td>
                        <td>₹35,625 / ₹37,500</td>
                        <td><span className="status-tag green">Paid</span></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="ml-footer">
                    <span>Route Completion: <strong>92.5%</strong></span>
                    <span>Collected Today: <strong style={{ color: '#059669' }}>₹14,250.00</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weekly' && (
            <div className="solution-grid">
              <div className="solution-copy">
                <div className="sol-tag">WEEKLY CHIT FUND MANAGEMENT</div>
                <h3 className="sol-heading">Weekly chit fund tracking and auction ledger administration</h3>
                <p className="sol-body">
                  Structure weekly collections, dividend allocations, and chit auctions with automated double-entry verification. Prevent cashier disputes with digital borrower signoffs.
                </p>
                <ul className="sol-checklist">
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>10-Week / 20-Week Tenures:</strong> Configurable weekly installment tables with automatic grace period calculation.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>Member Dividend Ledger:</strong> Real-time tracking of auction discount payouts and monthly dividends.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>Early Settlement Waivers:</strong> Instant zero-dues computation when borrowers pay off the lump sum before tenure ends.</span>
                  </li>
                </ul>
                <button type="button" className="btn-sol-action" onClick={() => navigate('/login')}>
                  <span>Deploy Weekly Chit Scheme</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="solution-preview-box">
                <div className="mini-ledger-card">
                  <div className="ml-header">
                    <span>Weekly Chit Batch #W-20 · Tenant #ORG-9214</span>
                    <span className="ml-status">Week 04</span>
                  </div>
                  <table className="ml-table">
                    <thead>
                      <tr>
                        <th>Member Code</th>
                        <th>Chit Value</th>
                        <th>Weekly Due</th>
                        <th>Auction Taken</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Member #CH-102</strong></td>
                        <td>₹1,00,000</td>
                        <td>₹10,000</td>
                        <td>No (Investor)</td>
                        <td><span className="status-tag green">Cleared</span></td>
                      </tr>
                      <tr>
                        <td><strong>Member #CH-205</strong></td>
                        <td>₹1,00,000</td>
                        <td>₹10,000</td>
                        <td>Yes (Week 02)</td>
                        <td><span className="status-tag green">Cleared</span></td>
                      </tr>
                      <tr>
                        <td><strong>Member #CH-319</strong></td>
                        <td>₹1,00,000</td>
                        <td>₹10,000</td>
                        <td>No (Investor)</td>
                        <td><span className="status-tag green">Cleared</span></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="ml-footer">
                    <span>Group Total: <strong>₹10,00,000</strong></span>
                    <span>Pool Cleared: <strong style={{ color: '#4F46E5' }}>100%</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="solution-grid">
              <div className="solution-copy">
                <div className="sol-tag">DOUBLE-ENTRY TREASURY</div>
                <h3 className="sol-heading">Sovereign vault balancing across all physical branch safes</h3>
                <p className="sol-body">
                  Eliminate internal discrepancies. Every field agent cash deposit, branch disbursement, and owner capital infusion is tied to an immutable double-entry ledger.
                </p>
                <ul className="sol-checklist">
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>End-of-Day Branch Handover:</strong> Field agents return collected cash to cashier with 1-click counter reconciliation.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>Multi-Branch Safe Governance:</strong> SuperAdmin monitors real-time cash balances across 10+ branch safes simultaneously.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={18} className="check-ico" />
                    <span><strong>Audit-Ready Ledger:</strong> Export RBI and tax-ready journal vouchers in Excel and PDF formats instantly.</span>
                  </li>
                </ul>
                <button type="button" className="btn-sol-action" onClick={() => navigate('/login')}>
                  <span>Deploy Multi-Branch Vault</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="solution-preview-box">
                <div className="mini-ledger-card">
                  <div className="ml-header">
                    <span>Central Vault Summary · Tenant #ORG-7750</span>
                    <span className="ml-status">Reconciled</span>
                  </div>
                  <div className="vault-split-summary">
                    <div className="v-stat-item">
                      <span className="v-label">Physical Cash in Branch Safes</span>
                      <span className="v-amount">₹24,80,000.00</span>
                    </div>
                    <div className="v-stat-item">
                      <span className="v-label">Bank Accounts / UPI Balance</span>
                      <span className="v-amount">₹59,40,500.00</span>
                    </div>
                  </div>
                  <div className="vault-audit-row">
                    <ShieldCheck size={16} color="#059669" />
                    <span>Double-Entry Balancing: <strong>Zero Discrepancy Verified</strong></span>
                  </div>
                  <div className="ml-footer">
                    <span>Total Liquid Treasury: <strong>₹84,20,500.00</strong></span>
                    <span>Status: <strong style={{ color: '#059669' }}>100% Balanced</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          6. INTERACTIVE LOAN CALCULATOR
          ================================================================ */}
      <section className="calculator-section" id="calculator">
        <div className="section-header">
          <div className="section-pill">INTERACTIVE AMORTIZATION ENGINE</div>
          <h2 className="section-title">Simulate any lending scheme in real time</h2>
          <p className="section-subtitle">
            Adjust principal disbursal amount, collection frequency, and tenure to see exact installment amounts and total yields.
          </p>
        </div>

        <div className="calculator-container">
          {/* Controls Column */}
          <div className="calc-inputs-column">
            <div className="calc-group">
              <div className="calc-label-row">
                <span className="calc-label">Principal Disbursal Amount</span>
                <span className="calc-value-display">₹{calcAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="clean-slider"
              />
              <div className="slider-limits">
                <span>₹5,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            <div className="calc-group">
              <div className="calc-label-row">
                <span className="calc-label">Collection Frequency Scheme</span>
                <span className="calc-value-display">{calcScheme}</span>
              </div>
              <div className="calc-scheme-toggles">
                <button
                  type="button"
                  className={`scheme-btn ${calcScheme === 'DAILY' ? 'active' : ''}`}
                  onClick={() => handleSchemeChange('DAILY')}
                >
                  Daily (Merchant 100-Day)
                </button>
                <button
                  type="button"
                  className={`scheme-btn ${calcScheme === 'WEEKLY' ? 'active' : ''}`}
                  onClick={() => handleSchemeChange('WEEKLY')}
                >
                  Weekly (Chit 10-Week)
                </button>
                <button
                  type="button"
                  className={`scheme-btn ${calcScheme === 'MONTHLY' ? 'active' : ''}`}
                  onClick={() => handleSchemeChange('MONTHLY')}
                >
                  Monthly (Business 12-Month)
                </button>
              </div>
            </div>

            <div className="calc-group">
              <div className="calc-label-row">
                <span className="calc-label">Tenure Duration</span>
                <span className="calc-value-display">
                  {calcTenure} {calcScheme === 'DAILY' ? 'Days' : calcScheme === 'WEEKLY' ? 'Weeks' : 'Months'}
                </span>
              </div>
              <input
                type="range"
                min={calcScheme === 'DAILY' ? 30 : calcScheme === 'WEEKLY' ? 5 : 3}
                max={calcScheme === 'DAILY' ? 120 : calcScheme === 'WEEKLY' ? 25 : 36}
                step="1"
                value={calcTenure}
                onChange={(e) => setCalcTenure(Number(e.target.value))}
                className="clean-slider"
              />
              <div className="slider-limits">
                <span>Min: {calcScheme === 'DAILY' ? '30 Days' : calcScheme === 'WEEKLY' ? '5 Wks' : '3 Mos'}</span>
                <span>Max: {calcScheme === 'DAILY' ? '120 Days' : calcScheme === 'WEEKLY' ? '25 Wks' : '36 Mos'}</span>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="calc-summary-column">
            <div className="summary-card">
              <div className="summary-header">
                <span className="summary-badge">SIMULATED SCHEDULE</span>
                <span className="rate-badge">{interestRate}% Fixed Fee</span>
              </div>

              <div className="summary-stat-row">
                <span className="stat-label">Principal Amount</span>
                <span className="stat-val">₹{calcAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-stat-row">
                <span className="stat-label">Total Fee / Interest</span>
                <span className="stat-val" style={{ color: '#059669' }}>+₹{totalInterest.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-stat-row">
                <span className="stat-label">Total Repayable</span>
                <span className="stat-val">₹{totalRepayable.toLocaleString('en-IN')}</span>
              </div>

              <div className="installment-box">
                <span className="inst-sub">Each Installment ({calcScheme.toLowerCase()})</span>
                <div className="inst-amount">₹{cycleInstallment.toLocaleString('en-IN')}</div>
                <span className="inst-note">For {calcTenure} scheduled {calcScheme === 'DAILY' ? 'days' : calcScheme === 'WEEKLY' ? 'weeks' : 'months'}</span>
              </div>

              <div className="yield-progress-track">
                <div className="track-bar fill-principal" style={{ width: '80%' }} />
                <div className="track-bar fill-yield" style={{ width: '20%' }} />
              </div>
              <div className="track-labels">
                <span>Principal 80%</span>
                <span>Yield 20%</span>
              </div>

              <button
                type="button"
                className="btn-calc-disburse"
                onClick={() => navigate('/login')}
              >
                <span>Disburse in Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          7. METRICS BANNER
          ================================================================ */}
      <section className="metrics-banner-section">
        <div className="metrics-banner-inner">
          <div className="metric-box">
            <div className="metric-big-num">100+</div>
            <div className="metric-small-label">Finance Organizations Supported</div>
          </div>
          <div className="metric-box">
            <div className="metric-big-num">₹50 Cr+</div>
            <div className="metric-small-label">Circulating Portfolio Deployed</div>
          </div>
          <div className="metric-box">
            <div className="metric-big-num">99.4%</div>
            <div className="metric-small-label">On-Time Daily Recovery Rate</div>
          </div>
          <div className="metric-box">
            <div className="metric-big-num">100%</div>
            <div className="metric-small-label">Tenant Cryptographic Isolation</div>
          </div>
        </div>
      </section>

      {/* ================================================================
          8. FAQ SECTION
          ================================================================ */}
      <section className="faq-section" id="faq">
        <div className="section-header">
          <div className="section-pill">FREQUENTLY ASKED QUESTIONS</div>
          <h2 className="section-title">Everything you need to know about the SaaS platform</h2>
          <p className="section-subtitle">
            Clear answers on tenant isolation, data confidentiality, and multi-branch onboarding.
          </p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-row-item ${openFaq === idx ? 'open' : ''}`}>
              <button
                type="button"
                className="faq-toggle-btn"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className="faq-arrow-icon"
                />
              </button>
              {openFaq === idx && (
                <div className="faq-content-body">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          9. HIGH-CONVERSION BOTTOM CTA
          ================================================================ */}
      <section className="bottom-cta-banner">
        <div className="cta-container">
          <div className="cta-pill">DEPLOY YOUR ORGANIZATION WORKSPACE</div>
          <h2 className="cta-heading">Ready to scale your finance organization?</h2>
          <p className="cta-subtitle">
            Launch your isolated tenant portal with multi-branch management, offline mobile collectors, and zero credential leakage.
          </p>
          <div className="cta-btn-group">
            <button
              type="button"
              className="btn-cta-primary-large"
              onClick={() => navigate('/login')}
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </button>
            <Link to="/login" className="btn-cta-ghost-large">
              <span>Sign In to Tenant Portal</span>
            </Link>
          </div>
          <span className="cta-footnote">Setup in under 60 seconds · Dedicated tenant encryption enclave</span>
        </div>
      </section>

      {/* ================================================================
          10. CORPORATE FOOTER
          ================================================================ */}
      <footer className="landing-footer">
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
              <li><a href="#multi-tenancy" onClick={(e) => scrollToSection(e, 'multi-tenancy')}>SuperAdmin Global Hub</a></li>
              <li><a href="#multi-tenancy" onClick={(e) => scrollToSection(e, 'multi-tenancy')}>Tenant Org Portal</a></li>
              <li><a href="#multi-tenancy" onClick={(e) => scrollToSection(e, 'multi-tenancy')}>Branch Cashier Safes</a></li>
              <li><a href="#multi-tenancy" onClick={(e) => scrollToSection(e, 'multi-tenancy')}>Field Mobile Fleet</a></li>
            </ul>
          </div>

          <div className="footer-nav-column">
            <h6>Lending Schemes</h6>
            <ul>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')}>Daily Merchant 100-Day</a></li>
              <li><a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')}>Weekly Chit Funds</a></li>
              <li><a href="#privacy" onClick={(e) => scrollToSection(e, 'privacy')}>Data Confidentiality Shield</a></li>
              <li><a href="#calculator" onClick={(e) => scrollToSection(e, 'calculator')}>Loan Engine Simulator</a></li>
            </ul>
          </div>

          <div className="footer-nav-column">
            <h6>Access</h6>
            <ul>
              <li><Link to="/login">SuperAdmin Central Hub</Link></li>
              <li><Link to="/login">Tenant Admin Workspace</Link></li>
              <li><Link to="/login">Branch Manager Terminal</Link></li>
              <li><Link to="/login">Field Staff Mobile App</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} Finance Portal SaaS Inc. All tenant records are cryptographically isolated.</span>
          <div className="footer-legal-links">
            <Link to="/login">Privacy Policy</Link>
            <Link to="/login">Terms of Service</Link>
            <Link to="/login">Tenant Data Encryption Standard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;