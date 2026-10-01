import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logoImg from '../../../assets/logo-tight.png';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  CreditCard,
  Building2,
  Server,
  Zap,
  CheckCircle2,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  Award,
} from 'lucide-react';
import './Welcome.css';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // 3D Architecture Modal State
  const [modal3dOpen, setModal3dOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);

  // Interactive Loan Calculator State
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcFrequency, setCalcFrequency] = useState('WEEKLY'); // 'DAILY' | 'WEEKLY' | 'MONTHLY'
  const [calcTenure, setCalcTenure] = useState(10); // installments

  // Mouse coordinate state for 3D card tilt
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Canvas ref for 3D Gyro-Sphere
  const canvasRef = useRef(null);
  const vaultCanvasRef = useRef(null);

  // --------------------------------------------------------------------------
  // 1. INTERACTIVE 3D GYRO-SPHERE & NEURAL MESH CANVAS (60 FPS)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Constellation Definition
    const numPoints = 64;
    const points = [];
    const radius = Math.min(width, height) * 0.38;

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        baseX: radius * Math.sin(theta) * Math.cos(phi),
        baseY: radius * Math.sin(theta) * Math.sin(phi),
        baseZ: radius * Math.cos(theta),
      });
    }

    let angleX = 0;
    let angleY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) * 0.0005;
      mouseY = (e.clientY - rect.top - height / 2) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleX += 0.004 + mouseY * 0.1;
      angleY += 0.006 + mouseX * 0.1;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = [];
      const fov = 350;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 3D Rotation math
        let x1 = p.baseX * cosY - p.baseZ * sinY;
        let z1 = p.baseZ * cosY + p.baseX * sinY;
        let y1 = p.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.baseY * sinX;

        // Perspective projection
        const scale = fov / (fov + z2 + 100);
        const x2d = x1 * scale + width / 2;
        const y2d = y1 * scale + height / 2;

        projected.push({ x: x2d, y: y2d, scale, z: z2 });
      }

      // Draw connecting energy lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 65) {
            const alpha = (1 - dist / 65) * 0.25 * ((projected[i].scale + projected[j].scale) / 2);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw 3D glowing orbital rings
      const drawRing = (r, tilt, color) => {
        ctx.beginPath();
        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * Math.PI * 2;
          let rx = r * Math.cos(t);
          let ry = r * Math.sin(t) * Math.cos(tilt);
          let rz = r * Math.sin(t) * Math.sin(tilt);

          let rx1 = rx * cosY - rz * sinY;
          let rz1 = rz * cosY + rx * sinY;
          let ry1 = ry * cosX - rz1 * sinX;
          let rz2 = rz1 * cosX + ry * sinX;

          const scale = fov / (fov + rz2 + 100);
          const px = rx1 * scale + width / 2;
          const py = ry1 * scale + height / 2;

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      };

      drawRing(radius * 0.85, 0.6, 'rgba(99, 102, 241, 0.35)');
      drawRing(radius * 1.05, -0.4, 'rgba(139, 92, 246, 0.25)');
      drawRing(radius * 1.2, 1.2, 'rgba(6, 182, 212, 0.2)');

      // Draw particle nodes with depth sizing & glowing halos
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.max(0.15, Math.min(1, (p.z + radius) / (2 * radius)));

        // Halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, 4 * p.scale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${alpha * 0.4})`;
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, 2 * p.scale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. 3D CARD MOUSE PERSPECTIVE TILT
  // --------------------------------------------------------------------------
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setCardRotate({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
  };

  // --------------------------------------------------------------------------
  // 3. 3D ARCHITECTURE MODAL CANVAS (SPINNING VAULT CORE)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!modal3dOpen) return;
    const canvas = vaultCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    let rot = 0;
    const renderVault = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rot += 0.015;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 90;

      // Draw multi-layered holographic rings
      for (let layer = 0; layer < 5; layer++) {
        const layerR = r + layer * 22;
        const alpha = layer === activeLayer ? 0.9 : 0.25;
        const color = layer === activeLayer ? '#8B5CF6' : 'rgba(99, 102, 241, 0.4)';

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot * (layer % 2 === 0 ? 1 : -1));

        ctx.beginPath();
        ctx.arc(0, 0, layerR, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = layer === activeLayer ? 2.5 : 1;
        ctx.setLineDash([12, 8]);
        ctx.stroke();

        // Pulsing nodes on ring
        for (let n = 0; n < 4; n++) {
          const ang = (n * Math.PI) / 2;
          const nx = layerR * Math.cos(ang);
          const ny = layerR * Math.sin(ang);
          ctx.beginPath();
          ctx.arc(nx, ny, layer === activeLayer ? 4.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = layer === activeLayer ? '#C084FC' : '#6366F1';
          ctx.fill();
        }

        ctx.restore();
      }

      // Center Core
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124, 58, 237, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(renderVault);
    };

    renderVault();

    return () => cancelAnimationFrame(animId);
  }, [modal3dOpen, activeLayer]);

  // --------------------------------------------------------------------------
  // 4. LOAN SIMULATOR CALCULATIONS
  // --------------------------------------------------------------------------
  const interestRate = calcFrequency === 'DAILY' ? 25 : calcFrequency === 'WEEKLY' ? 25 : 20;
  const totalInterest = Math.round((calcAmount * (interestRate / 100)));
  const totalRepayable = calcAmount + totalInterest;
  const emiAmount = Math.round(totalRepayable / calcTenure);

  // Architecture Layers for 3D Modal
  const architectureLayers = [
    {
      name: 'Layer 1: Global Edge & CDN Gateways',
      desc: 'DDoS mitigation, TLS 1.3 mutual-handshake, geo-distributed edge ingress.',
      status: 'VERIFIED • 0ms Edge Latency',
      tag: 'EDGE'
    },
    {
      name: 'Layer 2: Multi-Tenant Role Isolation',
      desc: 'Strict multi-tenant organization compartmentalization with JWT session fencing.',
      status: 'ACTIVE • Role-Based Guard',
      tag: 'TENANT'
    },
    {
      name: 'Layer 3: Real-Time Lending & Ledger Core',
      desc: 'High-throughput transactional double-entry ledger with instant collection audit.',
      status: 'SYNCHRONIZED • 0-Lag State',
      tag: 'CORE'
    },
    {
      name: 'Layer 4: AI Risk & Overdue Radar',
      desc: 'Predictive default telemetry, borrower credit limits, and dynamic repayment grace checks.',
      status: 'ONLINE • Risk Score 99.4%',
      tag: 'AI RADAR'
    },
    {
      name: 'Layer 5: Central Vault & HSM Encryption',
      desc: 'Hardware-backed biometric tokens, AES-256 at rest, automated reconciliation trail.',
      status: 'SECURE • Bank-Grade HSM',
      tag: 'VAULT'
    },
  ];

  return (
    <div className="welcome-container">
      {/* Dynamic Ambient Glow Auroras */}
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-right" />
      <div className="ambient-glow glow-mid-center" />
      <div className="ambient-glow glow-bottom-right" />

      {/* --------------------------------------------------------------------
          TOP NAVIGATION BAR
          -------------------------------------------------------------------- */}
      <header className="welcome-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <div className="brand-logo-wrap">
              <img src={logoImg} alt="Finance Portal" className="brand-logo-img" />
            </div>
            <span className="brand-text">
              Finance<span className="brand-text-accent"> Portal</span>
            </span>
          </Link>

          <nav>
            <ul className="nav-links">
              <li className="nav-link-item"><a href="#features">Solutions</a></li>
              <li className="nav-link-item"><a href="#architecture" onClick={() => setModal3dOpen(true)}>3D Architecture</a></li>
              <li className="nav-link-item"><a href="#calculator">Loan Simulator</a></li>
              <li className="nav-link-item"><a href="#security">Enterprise Security</a></li>
            </ul>
          </nav>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <button
                type="button"
                className="btn-nav-login"
                onClick={() => navigate('/dashboard')}
              >
                <span>Launch Portal</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-nav-login"
                onClick={() => navigate('/login')}
              >
                <Lock size={15} />
                <span>Sign In to Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          HERO SECTION WITH 3D INTERACTIVE GYRO & COCKPIT CARD
          -------------------------------------------------------------------- */}
      <section className="hero-section">
        {/* Left Column: Vision & Action CTAs */}
        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-pulse" />
            <span>ENTERPRISE LENDING & GOVERNANCE ENGINE</span>
          </div>

          <h1 className="hero-title">
            Intelligent Lending Infrastructure for <span className="hero-title-gradient">Modern Finance</span>
          </h1>

          <p className="hero-description">
            Streamline multi-tenant loan origination, daily merchant recovery, and automated portfolio risk governance on a unified, high-security cloud platform.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary-hero"
              onClick={() => navigate('/login')}
            >
              <Lock size={18} />
              <span>Access Portal Now</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-secondary-hero"
              onClick={() => setModal3dOpen(true)}
            >
              <Layers size={18} color="#818CF8" />
              <span>Explore 3D Model</span>
            </button>
          </div>

          {/* Institutional Trust Metrics */}
          <div className="hero-proof-strip">
            <div className="proof-item">
              <span className="proof-stat">₹2.4<span>Cr+</span></span>
              <span className="proof-label">Disbursed Capital</span>
            </div>
            <div className="proof-item">
              <span className="proof-stat">99.4<span>%</span></span>
              <span className="proof-label">On-Time Recovery</span>
            </div>
            <div className="proof-item">
              <span className="proof-stat">12,800<span>+</span></span>
              <span className="proof-label">Active Borrowers</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Canvas & Interactive Floating Card */}
        <div className="hero-right">
          <div className="stage-3d-wrapper">
            {/* Background 3D Canvas Gyro-Sphere */}
            <div className="canvas-3d-container">
              <canvas ref={canvasRef} className="interactive-3d-canvas" />
            </div>

            {/* Interactive 3D Perspective Cockpit Card */}
            <div
              ref={cardRef}
              className="cockpit-card-3d"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
              }}
            >
              <div className="card-top-row">
                <div className="card-org-badge">
                  <Building2 size={14} color="#818CF8" />
                  <span>Apex Finance Corp</span>
                </div>
                <div className="card-status-live">
                  <span className="live-dot-ping" />
                  <span>LIVE RECOVERY</span>
                </div>
              </div>

              <div className="card-balance-metric">
                <span className="balance-caption">Active Circulating Capital</span>
                <h2 className="balance-amount">₹42,85,600</h2>
                <div className="balance-trend-chip">
                  <TrendingUp size={14} />
                  <span>+14.8% portfolio expansion this month</span>
                </div>
              </div>

              {/* Sparkline Visual Activity */}
              <div className="card-mini-chart">
                <div className="chart-header">
                  <span>Weekly Collection Velocity</span>
                  <span style={{ color: '#34D399' }}>99.2% Target Met</span>
                </div>
                <div className="chart-bars-row">
                  {[45, 68, 85, 92, 74, 96, 100].map((val, idx) => (
                    <div
                      key={idx}
                      className="chart-bar-item"
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="card-footer-stats">
                <div className="footer-stat-item">
                  <span className="stat-item-lbl">Settled Today</span>
                  <span className="stat-item-val" style={{ color: '#34D399' }}>₹1,84,500</span>
                </div>
                <div className="footer-stat-item">
                  <span className="stat-item-lbl">Zero-Risk Rate</span>
                  <span className="stat-item-val" style={{ color: '#818CF8' }}>99.4%</span>
                </div>
              </div>
            </div>

            {/* Floating Satellite Holographic Badges */}
            <div className="satellite-pill satellite-top-right">
              <div className="satellite-icon-circle icon-purple">
                <Zap size={16} />
              </div>
              <div className="satellite-info">
                <span className="satellite-label">Automated Ledger</span>
                <span className="satellite-val">0-Lag Sync</span>
              </div>
            </div>

            <div className="satellite-pill satellite-bottom-left">
              <div className="satellite-icon-circle icon-cyan">
                <ShieldCheck size={16} />
              </div>
              <div className="satellite-info">
                <span className="satellite-label">Security Protocol</span>
                <span className="satellite-val">AES-256 Vault</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3D MODEL & ARCHITECTURE PREVIEW BANNER
          -------------------------------------------------------------------- */}
      <section className="section-3d-model-banner" id="architecture">
        <div className="model-banner-card">
          <div className="model-banner-content">
            <div className="model-banner-tag">
              <Sparkles size={14} />
              <span>Interactive 3D Security Model</span>
            </div>
            <h2 className="model-banner-title">
              Bank-Grade Multi-Tenant Cloud Architecture
            </h2>
            <p className="model-banner-desc">
              Inspect our 5-tier cryptographic infrastructure designed for multi-branch chit funds, daily retail merchants, and enterprise credit societies.
            </p>
          </div>

          <button
            type="button"
            className="btn-trigger-3d"
            onClick={() => setModal3dOpen(true)}
          >
            <Eye size={18} />
            <span>Launch 3D Inspector</span>
          </button>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          FEATURE MATRIX (GRID)
          -------------------------------------------------------------------- */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="section-tag">
            <Zap size={14} />
            <span>ENGINEERED FOR SCALE</span>
          </div>
          <h2 className="section-title">
            Complete Suite for Institutional Lending
          </h2>
          <p className="section-subtitle">
            From field agent biometric verification to high-speed daily collection reconciliation, everything is handled under one unified cockpit.
          </p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card-3d">
            <div className="feature-icon-wrapper icon-wrap-indigo">
              <Building2 size={26} />
            </div>
            <h3 className="feature-title">Multi-Tenant Organization Hub</h3>
            <p className="feature-description">
              Isolate branches, delegates, and field agents with granular Role-Based Access Control (RBAC). Manage central vault circulation with zero risk of cross-tenant leakage.
            </p>
            <div className="feature-tags">
              <span className="feature-tag-chip">Branch Isolation</span>
              <span className="feature-tag-chip">Role Hierarchy</span>
              <span className="feature-tag-chip">Tenant Fencing</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="feature-card-3d">
            <div className="feature-icon-wrapper icon-wrap-emerald">
              <Activity size={26} />
            </div>
            <h3 className="feature-title">Omni-Frequency Lending Engine</h3>
            <p className="feature-description">
              Configurable product engines for Daily Merchant Advances (100-day cycles), Weekly Chit Cycles (10-week terms), and Business Monthly EMIs with automated interest calculations.
            </p>
            <div className="feature-tags">
              <span className="feature-tag-chip">Daily Merchant</span>
              <span className="feature-tag-chip">Weekly Chit</span>
              <span className="feature-tag-chip">Monthly EMI</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card-3d">
            <div className="feature-icon-wrapper icon-wrap-cyan">
              <ShieldCheck size={26} />
            </div>
            <h3 className="feature-title">Biometric Lock & Hardware Vault</h3>
            <p className="feature-description">
              Zero-trust biometric unlock with fingerprint and FaceID fallback. Seamless integration across mobile apps and web administrative dashboards.
            </p>
            <div className="feature-tags">
              <span className="feature-tag-chip">Biometric Sensors</span>
              <span className="feature-tag-chip">Hardware Backed</span>
              <span className="feature-tag-chip">Auto App Lock</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="feature-card-3d">
            <div className="feature-icon-wrapper icon-wrap-amber">
              <DollarSign size={26} />
            </div>
            <h3 className="feature-title">Real-Time Central Cash Vault</h3>
            <p className="feature-description">
              Real-time capital injection tracking, automatic disbursement reserves, daily repayment absorption, and live vault circulation velocity charts.
            </p>
            <div className="feature-tags">
              <span className="feature-tag-chip">Capital Injections</span>
              <span className="feature-tag-chip">Double-Entry</span>
              <span className="feature-tag-chip">Vault Trail</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="feature-card-3d">
            <div className="feature-icon-wrapper icon-wrap-purple">
              <TrendingUp size={26} />
            </div>
            <h3 className="feature-title">Risk Radar & Overdue Telemetry</h3>
            <p className="feature-description">
              Instant alerts for delinquent installments, automated WhatsApp notice dispatch, grace period controls, and settlement at maturity date calculations.
            </p>
            <div className="feature-tags">
              <span className="feature-tag-chip">Delinquency Radar</span>
              <span className="feature-tag-chip">WhatsApp Dispatch</span>
              <span className="feature-tag-chip">Maturity Settlements</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="feature-card-3d">
            <div className="feature-icon-wrapper icon-wrap-rose">
              <Server size={26} />
            </div>
            <h3 className="feature-title">Audit Logs & Broadcast Broadcast</h3>
            <p className="feature-description">
              Full cryptographic audit trail on every payment collection, term edit, and loan write-off. WebSocket real-time broadcast to all authenticated monitors.
            </p>
            <div className="feature-tags">
              <span className="feature-tag-chip">Immutable Logs</span>
              <span className="feature-tag-chip">WebSocket Feeds</span>
              <span className="feature-tag-chip">Compliance Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          INTERACTIVE LOAN SIMULATOR / CALCULATOR
          -------------------------------------------------------------------- */}
      <section className="calculator-section" id="calculator">
        <div className="calculator-card">
          {/* Controls */}
          <div className="calc-inputs-col">
            <div className="calc-title-box">
              <h3>Live Interactive Loan Simulator</h3>
              <p>Simulate interest rates, cycle installments, and repayment schedules instantly.</p>
            </div>

            {/* Amount Slider */}
            <div className="calc-slider-group">
              <div className="slider-label-row">
                <span>Principal Disbursal Amount</span>
                <span className="slider-value-display">₹{calcAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="calc-range-slider"
              />
            </div>

            {/* Frequency Selector */}
            <div className="calc-slider-group">
              <div className="slider-label-row">
                <span>Repayment Frequency</span>
              </div>
              <div className="freq-selector-pills">
                <button
                  type="button"
                  className={`freq-btn ${calcFrequency === 'DAILY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('DAILY'); setCalcTenure(100); }}
                >
                  Daily (Merchant)
                </button>
                <button
                  type="button"
                  className={`freq-btn ${calcFrequency === 'WEEKLY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('WEEKLY'); setCalcTenure(10); }}
                >
                  Weekly (Chit)
                </button>
                <button
                  type="button"
                  className={`freq-btn ${calcFrequency === 'MONTHLY' ? 'active' : ''}`}
                  onClick={() => { setCalcFrequency('MONTHLY'); setCalcTenure(12); }}
                >
                  Monthly (Business)
                </button>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="calc-slider-group">
              <div className="slider-label-row">
                <span>Tenure ({calcFrequency === 'DAILY' ? 'Days' : calcFrequency === 'WEEKLY' ? 'Weeks' : 'Months'})</span>
                <span className="slider-value-display">{calcTenure} Cycles</span>
              </div>
              <input
                type="range"
                min={calcFrequency === 'DAILY' ? 30 : calcFrequency === 'WEEKLY' ? 5 : 3}
                max={calcFrequency === 'DAILY' ? 120 : calcFrequency === 'WEEKLY' ? 25 : 36}
                step="1"
                value={calcTenure}
                onChange={(e) => setCalcTenure(Number(e.target.value))}
                className="calc-range-slider"
              />
            </div>
          </div>

          {/* Breakdown Preview Box */}
          <div className="calc-results-col">
            <div className="result-row">
              <span className="result-label">Base Principal</span>
              <span className="result-val">₹{calcAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="result-row">
              <span className="result-label">Lending Rate / Fee</span>
              <span className="result-val" style={{ color: '#818CF8' }}>{interestRate}% Fixed</span>
            </div>

            <div className="result-row">
              <span className="result-label">Total Repayable</span>
              <span className="result-val">₹{totalRepayable.toLocaleString('en-IN')}</span>
            </div>

            <div className="result-row highlight">
              <span className="result-label">Cycle Installment ({calcFrequency.toLowerCase()})</span>
              <span className="result-val primary-accent">₹{emiAmount.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              className="btn-calc-cta"
              onClick={() => navigate('/login')}
            >
              <span>Disburse via Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          CONVERSION CTA BANNER
          -------------------------------------------------------------------- */}
      <section className="bottom-cta-section" id="security">
        <div className="cta-banner-glass">
          <div className="hero-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Award size={14} color="#FBBF24" />
            <span>ENTERPRISE READINESS GUARANTEED</span>
          </div>

          <h2 className="cta-title">
            Ready to Elevate Your Lending Operations?
          </h2>

          <p className="cta-subtitle">
            Join enterprise microfinance organizations and multi-branch chit funds streamlining daily operations on the Finance Portal.
          </p>

          <div className="cta-buttons-row">
            <button
              type="button"
              className="btn-primary-hero"
              onClick={() => navigate('/login')}
            >
              <Lock size={18} />
              <span>Login to Account</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-secondary-hero"
              onClick={() => setModal3dOpen(true)}
            >
              <Shield size={18} />
              <span>Inspect Security Specs</span>
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          FOOTER
          -------------------------------------------------------------------- */}
      <footer className="welcome-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="brand-logo-wrap" style={{ width: 32, height: 32, borderRadius: 8 }}>
              <img src={logoImg} alt="Finance Logo" className="brand-logo-img" />
            </div>
            <span className="footer-copyright">
              © {new Date().getFullYear()} Finance Portal Engine. All rights reserved.
            </span>
            <div className="system-status-indicator">
              <span className="badge-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <ul className="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#architecture" onClick={() => setModal3dOpen(true)}>3D Blueprint</a></li>
            <li><a href="#calculator">Simulator</a></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>
      </footer>

      {/* --------------------------------------------------------------------
          INTERACTIVE 3D ARCHITECTURE MODAL
          -------------------------------------------------------------------- */}
      {modal3dOpen && (
        <div className="modal-3d-backdrop" onClick={() => setModal3dOpen(false)}>
          <div className="modal-3d-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-3d-header">
              <div className="modal-3d-title-box">
                <h3>3D Enterprise Security Blueprint</h3>
                <p>Interactive multi-layer architectural cryptographic verification</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModal3dOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-3d-body">
              {/* Left Column: 3D Holographic Canvas Stage */}
              <div className="interactive-3d-vault-stage">
                <canvas ref={vaultCanvasRef} className="vault-stage-canvas" />
              </div>

              {/* Right Column: Layer Selector & Details */}
              <div className="modal-layers-list">
                {architectureLayers.map((layer, idx) => (
                  <div
                    key={idx}
                    className={`layer-card ${activeLayer === idx ? 'active' : ''}`}
                    onClick={() => setActiveLayer(idx)}
                  >
                    <div className="layer-header">
                      <span className="layer-name">
                        <CheckCircle2 size={16} color={activeLayer === idx ? '#8B5CF6' : '#64748B'} />
                        {layer.name}
                      </span>
                      <span className="layer-status">{layer.tag}</span>
                    </div>
                    <p className="layer-desc">{layer.desc}</p>
                    <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, marginTop: 4, display: 'block' }}>
                      {layer.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
