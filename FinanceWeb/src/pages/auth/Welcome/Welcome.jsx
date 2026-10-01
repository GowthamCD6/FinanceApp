import React, { useState, useEffect, useRef } from 'react';
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

  // --------------------------------------------------------------------------
  // 1. HERO 3D GYRO-PARTICLE CANVAS
  // --------------------------------------------------------------------------
  const heroCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let w = (canvas.width = canvas.parentElement.offsetWidth);
    let h = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fill();

        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 90) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 90) * 0.09})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. 3D INTERACTIVE CARD STUDIO STATE & INTERACTION
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
      tagline: 'Heavy grade titanium with cold-engraved tenant keys',
      accentColor: '#10B981',
      gradient: 'linear-gradient(135deg, #1C1C1E 0%, #121212 50%, #0A0A0A 100%)',
      border: 'rgba(255, 255, 255, 0.15)',
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
      border: 'rgba(52, 211, 153, 0.3)',
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
      border: 'rgba(245, 158, 11, 0.35)',
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
      border: 'rgba(96, 165, 250, 0.35)',
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
    const rotX = -((y / rect.height - 0.5) * 24);
    const rotY = (x / rect.width - 0.5) * 24;

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
  // 3. 3D ISOMETRIC ROUTE & FIELD COLLECTION TELEMETRY CANVAS
  // --------------------------------------------------------------------------
  const routeCanvasRef = useRef(null);
  const [routeMode, setRouteMode] = useState('AUTO'); // 'AUTO' | 'FAST' | 'RADAR'
  const [routeStats, setRouteStats] = useState({
    shopsCleared: 14,
    totalShops: 16,
    collectedToday: 18750,
    activeAgent: 'Agent V. Ram',
    currentStop: 'Mylapore Vegetable Mandi #04',
  });

  useEffect(() => {
    const canvas = routeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let w = (canvas.width = canvas.parentElement.offsetWidth);
    let h = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Isometric coordinates helper
    const toIso = (gx, gy, gz = 0) => {
      const cx = w * 0.5;
      const cy = h * 0.52;
      const isoX = cx + (gx - gy) * 36;
      const isoY = cy + (gx + gy) * 19 - gz;
      return { x: isoX, y: isoY };
    };

    // 8 Route Waypoints
    const waypoints = [
      { gx: -3, gy: -2, name: 'Saidapet Bazaar #01', amount: '₹125', collected: true },
      { gx: -1, gy: -2, name: 'Provision Mart #02', amount: '₹250', collected: true },
      { gx: 1, gy: -2, name: 'Textile Stall #03', amount: '₹500', collected: true },
      { gx: 2, gy: -0.5, name: 'Mylapore Mandi #04', amount: '₹125', collected: true },
      { gx: 1.5, gy: 1.5, name: 'Stationery Hub #05', amount: '₹375', collected: true },
      { gx: -0.5, gy: 1.8, name: 'Tea Stall #06', amount: '₹125', collected: false },
      { gx: -2.5, gy: 1.5, name: 'Flower Mart #07', amount: '₹250', collected: false },
      { gx: -3, gy: -0.2, name: 'Cycle Works #08', amount: '₹500', collected: false },
    ];

    let progress = 3.4; // along waypoints index
    let rippleRadius = 0;

    const renderRoute = () => {
      ctx.clearRect(0, 0, w, h);

      // Speed configuration
      const speed = routeMode === 'FAST' ? 0.024 : 0.009;
      progress = (progress + speed) % waypoints.length;

      // Draw isometric grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const p1 = toIso(i, -4);
        const p2 = toIso(i, 4);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const q1 = toIso(-4, i);
        const q2 = toIso(4, i);
        ctx.beginPath();
        ctx.moveTo(q1.x, q1.y);
        ctx.lineTo(q2.x, q2.y);
        ctx.stroke();
      }

      // Draw Route Path Lines between waypoints
      ctx.beginPath();
      const first = toIso(waypoints[0].gx, waypoints[0].gy);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < waypoints.length; i++) {
        const pt = toIso(waypoints[i].gx, waypoints[i].gy);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Waypoints (Merchant Stalls)
      waypoints.forEach((wp, idx) => {
        const pos = toIso(wp.gx, wp.gy);

        // Pedestal base
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 16, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = wp.collected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        ctx.fill();
        ctx.strokeStyle = wp.collected ? '#10B981' : '#F59E0B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 3D Pillar column
        const topPos = toIso(wp.gx, wp.gy, 18);
        ctx.beginPath();
        ctx.moveTo(pos.x - 8, pos.y);
        ctx.lineTo(pos.x - 8, topPos.y);
        ctx.lineTo(pos.x + 8, topPos.y);
        ctx.lineTo(pos.x + 8, pos.y);
        ctx.fillStyle = wp.collected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)';
        ctx.fill();

        // Top bead
        ctx.beginPath();
        ctx.arc(topPos.x, topPos.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = wp.collected ? '#34D399' : '#FBBF24';
        ctx.fill();

        // Label
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillStyle = '#A1A1AA';
        ctx.textAlign = 'center';
        ctx.fillText(wp.amount, topPos.x, topPos.y - 10);
      });

      // Compute Agent interpolated position
      const currIdx = Math.floor(progress);
      const nextIdx = (currIdx + 1) % waypoints.length;
      const t = progress - currIdx;
      const curWp = waypoints[currIdx];
      const nextWp = waypoints[nextIdx];
      const agentGx = curWp.gx + (nextWp.gx - curWp.gx) * t;
      const agentGy = curWp.gy + (nextWp.gy - curWp.gy) * t;
      const agentPos = toIso(agentGx, agentGy, 22 + Math.sin(progress * 6) * 3);

      // Agent 3D Radar Wave
      rippleRadius = (rippleRadius + 0.6) % 35;
      ctx.beginPath();
      ctx.ellipse(agentPos.x, agentPos.y + 22, rippleRadius, rippleRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(99, 102, 241, ${1 - rippleRadius / 35})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Agent Glowing Beacon
      ctx.beginPath();
      ctx.arc(agentPos.x, agentPos.y, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#6366F1';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Agent Tag
      ctx.font = 'bold 11px -apple-system, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Agent Live', agentPos.x, agentPos.y - 12);

      animId = requestAnimationFrame(renderRoute);
    };

    renderRoute();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [routeMode]);

  // --------------------------------------------------------------------------
  // 4. DEDICATED 3D INTERACTIVE SOVEREIGN VAULT CHAMBER CANVAS
  // --------------------------------------------------------------------------
  const vaultCanvasRef = useRef(null);
  const [vaultPulseMode, setVaultPulseMode] = useState('NORMAL'); // 'COLLECT' | 'DISBURSE' | 'NORMAL'

  useEffect(() => {
    const canvas = vaultCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let w = (canvas.width = canvas.parentElement.offsetWidth);
    let h = (canvas.height = canvas.parentElement.offsetHeight);

    let angle = 0;
    const renderVault = () => {
      ctx.clearRect(0, 0, w, h);
      angle += 0.014;

      const cx = w / 2;
      const cy = h / 2;
      const rings = [65, 95, 125, 155];

      // Outer circulation orbit
      rings.forEach((r, idx) => {
        const speed = (idx + 1) * 0.4;
        const currentAngle = angle * (idx % 2 === 0 ? 1 : -1) * speed;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(currentAngle);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle =
          idx === 1
            ? 'rgba(200, 245, 233, 0.45)'
            : idx === 2
            ? 'rgba(222, 212, 252, 0.38)'
            : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = idx === 1 ? 2 : 1;
        ctx.setLineDash([8, 12]);
        ctx.stroke();

        // 3D Orbital node beads
        for (let n = 0; n < 3; n++) {
          const a = (n * Math.PI * 2) / 3;
          const nx = r * Math.cos(a);
          const ny = r * Math.sin(a);
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = idx === 1 ? '#10B981' : idx === 2 ? '#8B5CF6' : '#FFFFFF';
          ctx.fill();
        }

        ctx.restore();
      });

      // Central Sovereign Core
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fillStyle =
        vaultPulseMode === 'COLLECT'
          ? 'rgba(16, 185, 129, 0.28)'
          : vaultPulseMode === 'DISBURSE'
          ? 'rgba(99, 102, 241, 0.28)'
          : 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle =
        vaultPulseMode === 'COLLECT'
          ? '#10B981'
          : vaultPulseMode === 'DISBURSE'
          ? '#818CF8'
          : '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rupee Symbol in Center Core
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₹', cx, cy);

      animId = requestAnimationFrame(renderVault);
    };

    renderVault();

    return () => cancelAnimationFrame(animId);
  }, [vaultPulseMode]);

  // --------------------------------------------------------------------------
  // 5. 3D ISOMETRIC LIQUIDITY & TREASURY BAR CANVAS
  // --------------------------------------------------------------------------
  const treasuryCanvasRef = useRef(null);
  const [liquidityTimeframe, setLiquidityTimeframe] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  useEffect(() => {
    const canvas = treasuryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let w = (canvas.width = canvas.parentElement.offsetWidth);
    let h = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const dataset = {
      daily: [
        { label: 'Mon', val: 78, amt: '₹1.85L' },
        { label: 'Tue', val: 92, amt: '₹2.10L' },
        { label: 'Wed', val: 84, amt: '₹1.95L' },
        { label: 'Thu', val: 110, amt: '₹2.60L' },
        { label: 'Fri', val: 135, amt: '₹3.20L' },
        { label: 'Sat', val: 145, amt: '₹3.50L' },
        { label: 'Sun', val: 62, amt: '₹1.40L' },
      ],
      weekly: [
        { label: 'Wk 1', val: 95, amt: '₹14.2L' },
        { label: 'Wk 2', val: 115, amt: '₹17.8L' },
        { label: 'Wk 3', val: 140, amt: '₹21.4L' },
        { label: 'Wk 4', val: 165, amt: '₹25.1L' },
      ],
      monthly: [
        { label: 'Q1', val: 110, amt: '₹58.4L' },
        { label: 'Q2', val: 145, amt: '₹76.2L' },
        { label: 'Q3', val: 180, amt: '₹94.5L' },
        { label: 'Q4', val: 220, amt: '₹1.15Cr' },
      ],
    };

    let step = 0;

    const renderChart = () => {
      ctx.clearRect(0, 0, w, h);
      step += 0.03;

      const items = dataset[liquidityTimeframe];
      const barWidth = 32;
      const barDepth = 18;
      const spacing = w / (items.length + 1);

      items.forEach((item, idx) => {
        const x = spacing * (idx + 1) - barWidth / 2;
        const targetHeight = (item.val / 230) * (h * 0.58);
        const dynamicH = targetHeight + Math.sin(step + idx) * 3;
        const baseY = h * 0.82;
        const topY = baseY - dynamicH;

        // Front Face
        ctx.fillStyle = idx === items.length - 2 ? '#10B981' : '#27272A';
        ctx.beginPath();
        ctx.rect(x, topY, barWidth, dynamicH);
        ctx.fill();
        ctx.strokeStyle = idx === items.length - 2 ? '#34D399' : '#3F3F46';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right 3D Side Face
        ctx.fillStyle = idx === items.length - 2 ? '#059669' : '#18181B';
        ctx.beginPath();
        ctx.moveTo(x + barWidth, topY);
        ctx.lineTo(x + barWidth + barDepth, topY - barDepth * 0.55);
        ctx.lineTo(x + barWidth + barDepth, baseY - barDepth * 0.55);
        ctx.lineTo(x + barWidth, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top 3D Isometric Cap
        ctx.fillStyle = idx === items.length - 2 ? '#6EE7B7' : '#52525B';
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x + barDepth, topY - barDepth * 0.55);
        ctx.lineTo(x + barWidth + barDepth, topY - barDepth * 0.55);
        ctx.lineTo(x + barWidth, topY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Amount on Top
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.fillStyle = idx === items.length - 2 ? '#34D399' : '#E4E4E7';
        ctx.textAlign = 'center';
        ctx.fillText(item.amt, x + barWidth / 2 + 8, topY - barDepth * 0.55 - 8);

        // Day/Time Label Below
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillStyle = '#71717A';
        ctx.fillText(item.label, x + barWidth / 2, baseY + 20);
      });

      animId = requestAnimationFrame(renderChart);
    };

    renderChart();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [liquidityTimeframe]);

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
  const [platformTab, setPlatformTab] = useState('mobile'); // 'mobile' | 'web'

  // --------------------------------------------------------------------------
  // 8. BORROWER LIFECYCLE STAGE
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
              <li className="qonto-nav-item"><a href="#card-studio">3D Cards</a></li>
              <li className="qonto-nav-item"><a href="#route-telemetry">3D Route</a></li>
              <li className="qonto-nav-item"><a href="#vault-chamber">3D Vault</a></li>
              <li className="qonto-nav-item"><a href="#liquidity-radar">3D Cash Flow</a></li>
              <li className="qonto-nav-item"><a href="#lifecycle">Lifecycle</a></li>
              <li className="qonto-nav-item"><a href="#audit-feed">Live Stream</a></li>
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
          2. HERO SECTION & 3D ISOMETRIC STAGE
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

            <a href="#card-studio" className="qonto-btn-hero-secondary">
              <Sparkles size={16} color="#C084FC" />
              <span>3D Card Studio</span>
            </a>
          </div>

          <span className="qonto-hero-subnote">
            From ₹0/month. Enterprise multi-tenant engine. Access with zero obligations.
          </span>
        </div>

        {/* Right Column: Isometric 3D Layered Hardware & Dashboard Showcase */}
        <div className="qonto-hero-right">
          {/* Subtle Particle Starfield Canvas in Background */}
          <canvas ref={heroCanvasRef} className="hero-3d-bg-canvas" />

          <div
            className="qonto-isometric-stage"
            style={{
              transform: `rotateX(${50 + tilt.y}deg) rotateZ(${-35 + tilt.x}deg)`,
            }}
          >
            {/* 3D Floating Rupee Coin */}
            <div className="floating-3d-token token-coin-gold">
              <span>₹</span>
            </div>

            {/* 3D Floating Security Shield */}
            <div className="floating-3d-token token-shield-blue">
              <ShieldCheck size={26} />
            </div>

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
          3. THE 4 SIGNATURE QONTO PASTEL FEATURE CARDS WITH 3D HOVER
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
          4. [NEW & EXPANDED] INTERACTIVE 3D HOLOGRAPHIC CARD STUDIO
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
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                onClick={() => navigate('/login')}
              >
                <span>Request Card</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right 3D Rotatable Holographic Stage */}
          <div
            className="card-studio-3d-stage"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            {nfcBeaming && <div className="nfc-pulse-ring" />}

            <div
              className={`holographic-3d-card ${cardFlipped ? 'is-flipped' : ''}`}
              style={{
                transform: `perspective(1200px) rotateX(${cardRotation.x}deg) rotateY(${
                  cardRotation.y + (cardFlipped ? 180 : 0)
                }deg)`,
                background: cardTiers[activeCardTier].gradient,
                border: `1.5px solid ${cardTiers[activeCardTier].border}`,
              }}
            >
              {/* Dynamic Specular Spotlight */}
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

            <div className="card-hint-text">
              Hover to tilt in 3D perspective · Click Flip to view back
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. [NEW & EXPANDED] INTERACTIVE 3D FIELD ROUTE & TELEMETRY CANVAS
          -------------------------------------------------------------------- */}
      <section className="route-telemetry-section" id="route-telemetry">
        <div className="qonto-section-intro">
          <div className="qonto-section-intro-tag">REAL-TIME FIELD TELEMETRY</div>
          <h2 className="qonto-section-intro-title">Live 3D route pathfinding & collection telemetry</h2>
        </div>

        <div className="route-telemetry-box">
          <div className="route-canvas-wrapper">
            <div className="telemetry-badge-overlay">
              <span className="badge-dot-live" />
              <span>LIVE ISOMETRIC ROUTE MAP</span>
            </div>
            <canvas ref={routeCanvasRef} className="route-canvas-el" />
          </div>

          <div className="route-telemetry-sidebar">
            <div className="qonto-hero-badge" style={{ marginBottom: '1rem' }}>
              <MapPin size={14} color="#10B981" />
              <span>COLLECTOR ROUTE #08 (SAIDAPET & MYLAPORE)</span>
            </div>

            <h3>Automated Route Pathfinding</h3>
            <p>
              Watch field agent positions, instant offline cash match pings, and bazaar merchant waypoints mapped continuously in 3D perspective.
            </p>

            <div className="telemetry-metrics-grid">
              <div className="telemetry-stat">
                <span className="stat-label">Merchants Cleared</span>
                <span className="stat-value">{routeStats.shopsCleared} / {routeStats.totalShops}</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Collected Today</span>
                <span className="stat-value" style={{ color: '#10B981' }}>₹{routeStats.collectedToday.toLocaleString('en-IN')}</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Active Field Agent</span>
                <span className="stat-value">{routeStats.activeAgent}</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Route Discrepancy</span>
                <span className="stat-value" style={{ color: '#60A5FA' }}>0.00 (Zero Leakage)</span>
              </div>
            </div>

            <div className="telemetry-actions-row">
              <button
                type="button"
                className={`btn-telemetry-action ${routeMode === 'AUTO' ? 'active' : ''}`}
                onClick={() => setRouteMode('AUTO')}
              >
                <span>Standard Sweep</span>
              </button>

              <button
                type="button"
                className={`btn-telemetry-action ${routeMode === 'FAST' ? 'active' : ''}`}
                onClick={() => setRouteMode('FAST')}
              >
                <Zap size={14} />
                <span>Accelerate Path</span>
              </button>

              <button
                type="button"
                className="qonto-btn-hero"
                style={{ padding: '0.65rem 1.1rem', fontSize: '0.88rem' }}
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
          6. DEDICATED 3D INTERACTIVE SOVEREIGN VAULT CHAMBER
          -------------------------------------------------------------------- */}
      <section className="vault-3d-section" id="vault-chamber">
        <div className="vault-chamber-card">
          <div className="vault-canvas-wrap">
            <div className="vault-canvas-overlay">
              <Radio size={12} color="#10B981" />
              <span>LIVE 3D VAULT CIRCULATION</span>
            </div>
            <canvas ref={vaultCanvasRef} className="vault-canvas-el" />
          </div>

          <div className="vault-chamber-info">
            <div className="qonto-hero-badge" style={{ marginBottom: '1rem' }}>
              <Zap size={14} color="#C084FC" />
              <span>CRYPTOGRAPHIC TREASURY</span>
            </div>
            <h3>The Sovereign Central Vault Core</h3>
            <p>
              Witness real-time double-entry balancing in 3D. Field collections, capital injections, and loan disbursements are mirrored with microsecond telemetry across all physical branches.
            </p>

            <div className="vault-interactive-controls">
              <button
                type="button"
                className={`vault-btn-action ${vaultPulseMode === 'COLLECT' ? 'active' : ''}`}
                onClick={() => setVaultPulseMode('COLLECT')}
              >
                <TrendingUp size={16} />
                <span>Simulate Collection</span>
              </button>

              <button
                type="button"
                className={`vault-btn-action ${vaultPulseMode === 'DISBURSE' ? 'active' : ''}`}
                onClick={() => setVaultPulseMode('DISBURSE')}
              >
                <CreditCard size={16} />
                <span>Simulate Disbursal</span>
              </button>

              <button
                type="button"
                className={`vault-btn-action ${vaultPulseMode === 'NORMAL' ? 'active' : ''}`}
                onClick={() => setVaultPulseMode('NORMAL')}
              >
                <RefreshCw size={16} />
                <span>Reset Orbit</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. [NEW & EXPANDED] INTERACTIVE 3D LIQUIDITY & TREASURY BAR CANVAS
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

          <div className="liquidity-canvas-wrap">
            <canvas ref={treasuryCanvasRef} className="liquidity-canvas-el" />
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
          8. INTERACTIVE 3D ISOMETRIC WORKFLOW PIPELINE
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
          9. [NEW & EXPANDED] MOBILE APP VS WEB HQ PLATFORM COMPARISON
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
          10. [NEW & EXPANDED] 6-STAGE BORROWER LIFECYCLE ROADMAP
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
          11. [NEW & EXPANDED] REAL-TIME CRYPTOGRAPHIC AUDIT STREAM
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
              <li><a href="#solutions">Daily Bazaar Loans</a></li>
              <li><a href="#solutions">Weekly Chit Cycles</a></li>
              <li><a href="#solutions">Monthly Business EMIs</a></li>
              <li><a href="#vault-chamber">Central Vault</a></li>
            </ul>
          </div>

          <div className="footer-col-links">
            <h5>3D Engine</h5>
            <ul>
              <li><a href="#card-studio">3D Card Studio</a></li>
              <li><a href="#route-telemetry">3D Route Telemetry</a></li>
              <li><a href="#vault-chamber">3D Sovereign Vault</a></li>
              <li><a href="#liquidity-radar">3D Cash Flow</a></li>
              <li><a href="#lifecycle">Borrower Lifecycle</a></li>
              <li><a href="#audit-feed">Live Stream</a></li>
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
