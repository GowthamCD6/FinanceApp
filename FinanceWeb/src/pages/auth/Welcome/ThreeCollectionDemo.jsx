import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Play,
  Pause,
  Layers,
  Calendar,
  Wallet,
  Building2,
  Lock,
  Clock,
} from 'lucide-react';
import './ThreeCollectionDemo.css';

/**
 * ThreeCollectionDemo: Realistic Architectural Financial Settlement Facility
 * Featuring distinct FIXED vs CLOCK-BASED mechanisms:
 *
 * 1. FIXED Mode (Equal Daily Installments):
 *    - Precision Linear Fixed Cadence Matrix:
 *    - Polished Chrome & Brass Metronome Pendulum swinging with steady, invariant tempo.
 *    - 20 Stainless Steel Deposit Drawers with identical, locked-height banknote bundles
 *      (₹125.00/day fixed packets) illustrating unwavering predictability.
 *
 * 2. CLOCK-BASED Mode (LUMP_SUM_END / Bullet Repayment):
 *    - Astronomical Banking Chronometer & Maturity Clock:
 *    - Circular 100-Day Clock Dial with 100 radial calendar ticks and Roman numerals.
 *    - Interlocking 3D Brass Clockwork Gears that rotate continuously.
 *    - Sweeping Golden Chronometer Clock Hand that sweeps 360° across days 1–99 (zero dues).
 *    - Striking 12 o'clock (Day 100): Grand Vault opens with massive ₹12,500 cash pyramid,
 *      gold bullion ingots, and Zero-Dues Clearance Plaque.
 */
export const ThreeCollectionDemo = ({ mode = 'NORMAL', onModeChange }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);

  // Dynamic references
  const vaultWheelRef = useRef(null);
  const transitCapsuleRef = useRef(null);
  const drawerSlotsRef = useRef([]);
  const cashPacketsRef = useRef([]);
  const lumpSumVaultRef = useRef(null);
  const billboardSpriteRef = useRef(null);
  const billboardTexRef = useRef(null);

  // FIXED Metronome refs
  const metronomeGroupRef = useRef(null);
  const metronomeArmRef = useRef(null);
  const metronomePulseRef = useRef(null);

  // CLOCK Mechanism refs
  const clockGroupRef = useRef(null);
  const clockHandRef = useRef(null);
  const clockSecHandRef = useRef(null);
  const clockGear1Ref = useRef(null);
  const clockGear2Ref = useRef(null);
  const clockGear3Ref = useRef(null);
  const day100BeamRef = useRef(null);
  const day100CrownRef = useRef(null);

  // Clean interactive state
  const isNormalMode = mode === 'NORMAL' || mode === 'FIXED';
  const [activeCamView, setActiveCamView] = useState('overview'); // 'overview' | 'mechanism' | 'vault'
  const [isAutoOrbit, setIsAutoOrbit] = useState(true);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [simDay, setSimDay] = useState(100); // 1 to 100
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Camera lerp vectors (adjusted for scaled 3D stage)
  const targetCamPosRef = useRef(new THREE.Vector3(20, 16, 24));
  const currentCamPosRef = useRef(new THREE.Vector3(20, 16, 24));
  const orbitAngleRef = useRef(0.85);

  // Pointer drag tracking
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  const SLOT_COUNT = 20; // 20 physical teller slots representing 100 days

  /* ── Ultra-crisp high-DPI text canvas generator for 3D architectural signage ── */
  const makeTextTexture = useCallback((title, subtitle = '', tag = 'ENTERPRISE SETTLEMENT') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Deep realistic drop shadow around card
    ctx.shadowColor = 'rgba(8, 13, 43, 0.16)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    // Crisp white card background
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(24, 24, 1152, 372, 40);
    ctx.fill();

    // Reset shadow for crisp text & borders
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#F1F5F9';
    ctx.strokeRect(34, 34, 1132, 352);

    // Top Category / Status Badge Pill
    const tagWidth = 440;
    const tagX = (1200 - tagWidth) / 2;
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(tagX, 46, tagWidth, 50, 25);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Status Indicator Dot (Emerald Green or Royal Purple)
    ctx.fillStyle = isNormalMode ? '#10B981' : '#7C3AED';
    ctx.beginPath();
    ctx.arc(tagX + 30, 71, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tag Text
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 22px "Inter", -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag.toUpperCase(), tagX + 50, 72);

    // Main Architectural Signage Title
    ctx.fillStyle = '#080D2B';
    ctx.font = '800 48px "Inter", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 600, 168);

    // Subtitle Container
    if (subtitle) {
      const subWidth = 840;
      const subX = (1200 - subWidth) / 2;
      ctx.fillStyle = isNormalMode ? '#EFF6FF' : '#F5F3FF';
      ctx.beginPath();
      ctx.roundRect(subX, 245, subWidth, 68, 34);
      ctx.fill();
      ctx.strokeStyle = isNormalMode ? '#BFDBFE' : '#DDD6FE';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = isNormalMode ? '#1D4ED8' : '#6D28D9';
      ctx.font = '700 28px "Inter", -apple-system, sans-serif';
      ctx.fillText(subtitle, 600, 279);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [isNormalMode]);

  /* ── Switch Camera View ── */
  const setCamView = (viewName) => {
    setActiveCamView(viewName);
    setIsAutoOrbit(false);
    if (viewName === 'overview') {
      targetCamPosRef.current.set(20, 16, 24);
    } else if (viewName === 'mechanism') {
      targetCamPosRef.current.set(0, 11, 15);
    } else if (viewName === 'vault') {
      targetCamPosRef.current.set(10, 8.5, 10);
    }
  };

  /* ── Simulation Step Loop ── */
  useEffect(() => {
    let timer;
    if (isPlayingSim) {
      timer = setInterval(() => {
        setSimDay((prev) => {
          if (prev >= 100) {
            setIsPlayingSim(false);
            return 100;
          }
          return prev + 1;
        });
      }, 70);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim]);

  /* ── Three.js Scene Setup ── */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 580;

    /* ── 1. SCENE CREATION ── */
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xF8FAFC);
    scene.fog = new THREE.FogExp2(0xF8FAFC, 0.012);

    /* ── 2. CAMERA ── */
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 500);
    camera.position.set(20, 16, 24);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;
    currentCamPosRef.current.copy(camera.position);

    /* ── 3. RENDERER ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    /* ── 4. RADIANT DAYLIGHT STUDIO LIGHTING ── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(24, 38, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0xE0F2FE, 1.3);
    skyFillLight.position.set(-24, 22, -18);
    scene.add(skyFillLight);

    const centerSpot = new THREE.PointLight(0xF59E0B, 2.2, 32);
    centerSpot.position.set(0, 6, -3);
    scene.add(centerSpot);

    /* ── 5. REALISTIC ARCHITECTURAL MATERIALS ── */
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.25,
      metalness: 0.22,
    });
    const whiteCounterMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.15,
      metalness: 0.1,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      roughness: 0.18,
      metalness: 0.88,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xCFD8E3,
      roughness: 0.08,
      metalness: 0.98,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFBBF24,
      emissive: 0xD97706,
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.95,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xE0F2FE,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.85,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xD97706,
      roughness: 0.28,
      metalness: 0.85,
    });

    /* ── 6. ARCHITECTURAL MARBLE PLINTH & COUNTER TERRACE ── */
    const stageGroup = new THREE.Group();
    stageGroup.scale.set(0.68, 0.68, 0.68);
    stageGroup.position.set(0, -0.3, 0);
    scene.add(stageGroup);

    // Tier 1: Lower Travertine Plinth
    const plinth1Geo = new THREE.CylinderGeometry(17.5, 18, 0.45, 64);
    const plinth1 = new THREE.Mesh(plinth1Geo, marbleMat);
    plinth1.position.y = -0.25;
    plinth1.receiveShadow = true;
    stageGroup.add(plinth1);

    // Tier 2: Upper Polished Terrace
    const plinth2Geo = new THREE.CylinderGeometry(16.2, 16.5, 0.3, 64);
    const plinth2 = new THREE.Mesh(plinth2Geo, whiteCounterMat);
    plinth2.position.y = 0.1;
    plinth2.receiveShadow = true;
    stageGroup.add(plinth2);

    // Inlaid Brass Perimeter Rings
    const ring1Geo = new THREE.RingGeometry(15.8, 16.0, 64);
    const ring1 = new THREE.Mesh(ring1Geo, brassMat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.26;
    stageGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(12.8, 12.95, 64);
    const ring2 = new THREE.Mesh(ring2Geo, brassMat);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.26;
    stageGroup.add(ring2);

    // Curved Glass Balustrade
    const balustradeGeo = new THREE.CylinderGeometry(16.0, 16.0, 1.4, 48, 1, true, Math.PI * 0.75, Math.PI * 1.5);
    const balustrade = new THREE.Mesh(balustradeGeo, glassMat);
    balustrade.position.y = 1.0;
    stageGroup.add(balustrade);

    const handrailGeo = new THREE.TorusGeometry(16.0, 0.08, 16, 48, Math.PI * 1.5);
    const handrail = new THREE.Mesh(handrailGeo, chromeMat);
    handrail.rotation.x = Math.PI / 2;
    handrail.rotation.z = Math.PI * 0.75;
    handrail.position.y = 1.7;
    stageGroup.add(handrail);

    /* ── 7. CENTRAL BANKING DROP-VAULT SAFE ── */
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, 0.25, -4.5);
    stageGroup.add(vaultGroup);

    const vPedGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.6, 36);
    const vPed = new THREE.Mesh(vPedGeo, marbleMat);
    vPed.position.y = 0.3;
    vPed.receiveShadow = true;
    vaultGroup.add(vPed);

    const vBodyGeo = new THREE.CylinderGeometry(3.6, 3.6, 3.2, 36);
    const vBody = new THREE.Mesh(vBodyGeo, steelMat);
    vBody.position.y = 2.1;
    vBody.castShadow = true;
    vaultGroup.add(vBody);

    const vRimGeo = new THREE.TorusGeometry(3.4, 0.28, 16, 36);
    const vRim = new THREE.Mesh(vRimGeo, chromeMat);
    vRim.rotation.x = Math.PI / 2;
    vRim.position.y = 3.7;
    vaultGroup.add(vRim);

    // Vault Perimeter Bolts
    for (let b = 0; b < 10; b++) {
      const angle = (b / 10) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 12);
      const bolt = new THREE.Mesh(boltGeo, chromeMat);
      bolt.position.set(Math.cos(angle) * 3.4, 3.8, Math.sin(angle) * 3.4);
      vaultGroup.add(bolt);
    }

    // Vault Combination Wheel
    const wheelGroup = new THREE.Group();
    vaultWheelRef.current = wheelGroup;
    wheelGroup.position.set(0, 3.8, 0);
    vaultGroup.add(wheelGroup);

    const wheelRimGeo = new THREE.TorusGeometry(1.8, 0.18, 16, 32);
    const wheelRim = new THREE.Mesh(wheelRimGeo, goldMat);
    wheelRim.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelRim);

    for (let s = 0; s < 4; s++) {
      const spokeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8);
      const spoke = new THREE.Mesh(spokeGeo, goldMat);
      spoke.rotation.z = Math.PI / 2;
      spoke.rotation.y = (s * Math.PI) / 4;
      wheelGroup.add(spoke);
    }

    const spindleGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.4, 20);
    const spindle = new THREE.Mesh(spindleGeo, steelMat);
    spindle.position.y = 0.15;
    wheelGroup.add(spindle);

    const ledGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      emissive: 0x10B981,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const statusLed = new THREE.Mesh(ledGeo, ledMat);
    statusLed.position.y = 0.4;
    wheelGroup.add(statusLed);

    // Gold Bullion Ingot Stacks on Vault Plinth
    const ingotGeo = new THREE.BoxGeometry(1.3, 0.38, 0.65);
    const ingotPositions = [
      { x: -2.2, y: 0.8, z: 1.5, r: 0.2 },
      { x: -2.2, y: 1.18, z: 1.5, r: 0.2 },
      { x: 2.1, y: 0.8, z: 1.6, r: -0.3 },
      { x: 2.1, y: 1.18, z: 1.6, r: -0.3 },
    ];
    ingotPositions.forEach((pos) => {
      const ingot = new THREE.Mesh(ingotGeo, goldMat);
      ingot.position.set(pos.x, pos.y, pos.z);
      ingot.rotation.y = pos.r;
      ingot.castShadow = true;
      vaultGroup.add(ingot);
    });

    /* ── 8. PRECISION HOROLOGICAL CADENCE METRONOME REGULATOR (FIXED MODE) ── */
    const metronomeGroup = new THREE.Group();
    metronomeGroup.position.set(0, 0.3, 1.2);
    stageGroup.add(metronomeGroup);
    metronomeGroupRef.current = metronomeGroup;

    // Outer Marble & Inlaid Brass Plinth
    const mPlinthGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.25, 48);
    const mPlinth = new THREE.Mesh(mPlinthGeo, marbleMat);
    mPlinth.position.y = 0.12;
    mPlinth.receiveShadow = true;
    metronomeGroup.add(mPlinth);

    const mRingGeo = new THREE.RingGeometry(2.18, 2.3, 48);
    const mRing = new THREE.Mesh(mRingGeo, brassMat);
    mRing.rotation.x = -Math.PI / 2;
    mRing.position.y = 0.26;
    metronomeGroup.add(mRing);

    // Dynamic Cadence Harmonic Pulse Ring at Base
    const mPulseGeo = new THREE.TorusGeometry(2.1, 0.05, 16, 48);
    const mPulseMat = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      emissive: 0x10B981,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const mPulse = new THREE.Mesh(mPulseGeo, mPulseMat);
    mPulse.rotation.x = Math.PI / 2;
    mPulse.position.y = 0.27;
    metronomeGroup.add(mPulse);
    metronomePulseRef.current = mPulse;

    // Modern Open-Architecture Metronome Tower (Brushed Titanium & Polished Chrome)
    const mFrameGroup = new THREE.Group();
    mFrameGroup.position.y = 0.25;
    metronomeGroup.add(mFrameGroup);

    // Metronome Triangular Backplate
    const mBackGeo = new THREE.BoxGeometry(1.6, 3.4, 0.15);
    const mBack = new THREE.Mesh(mBackGeo, steelMat);
    mBack.position.set(0, 1.7, -0.4);
    mBack.castShadow = true;
    mFrameGroup.add(mBack);

    // Left and Right Angled Chrome Pylons
    const pylonGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.5, 16);
    const leftPylon = new THREE.Mesh(pylonGeo, chromeMat);
    leftPylon.position.set(-0.75, 1.7, -0.15);
    leftPylon.rotation.z = -0.18;
    leftPylon.castShadow = true;
    mFrameGroup.add(leftPylon);

    const rightPylon = new THREE.Mesh(pylonGeo, chromeMat);
    rightPylon.position.set(0.75, 1.7, -0.15);
    rightPylon.rotation.z = 0.18;
    rightPylon.castShadow = true;
    mFrameGroup.add(rightPylon);

    // Inlaid 18K Gold Precision Graduated Scale Plate
    const mScaleGeo = new THREE.PlaneGeometry(0.8, 2.6);
    const mScaleMat = new THREE.MeshStandardMaterial({
      color: 0xFDE68A,
      roughness: 0.2,
      metalness: 0.75,
    });
    const mScale = new THREE.Mesh(mScaleGeo, mScaleMat);
    mScale.position.set(0, 1.75, -0.31);
    mFrameGroup.add(mScale);

    // Laser-etched Cadence Calibration Bars on Scale Plate
    for (let k = 0; k < 12; k++) {
      const isMajor = k % 3 === 0;
      const barGeo = new THREE.BoxGeometry(isMajor ? 0.65 : 0.35, 0.025, 0.02);
      const bar = new THREE.Mesh(barGeo, isMajor ? brassMat : steelMat);
      bar.position.set(0, 0.6 + k * 0.2, -0.3);
      mFrameGroup.add(bar);
    }

    // Pivot Bearing Assembly (Gold Chaton & Hardened Steel Axle)
    const mPivotBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.25, 20), goldMat);
    mPivotBase.rotation.x = Math.PI / 2;
    mPivotBase.position.set(0, 0.8, -0.05);
    mFrameGroup.add(mPivotBase);

    // Metronome Harmonic Swinging Pendulum Arm
    const mArmGroup = new THREE.Group();
    mArmGroup.position.set(0, 0.8, 0.08);
    metronomeGroup.add(mArmGroup);
    metronomeArmRef.current = mArmGroup;

    // Upward Wand (Mirror Chrome)
    const mRodGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.1, 12);
    const mRod = new THREE.Mesh(mRodGeo, chromeMat);
    mRod.position.y = 1.25;
    mRod.castShadow = true;
    mArmGroup.add(mRod);

    // Sliding Knurled Brass Cadence Bob (Fixed Invariant Height)
    const bobGroup = new THREE.Group();
    bobGroup.position.y = 1.7;
    mArmGroup.add(bobGroup);

    const bobBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.26), goldMat);
    bobBody.castShadow = true;
    bobGroup.add(bobBody);

    const bobScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.38, 16), chromeMat);
    bobScrew.rotation.z = Math.PI / 2;
    bobGroup.add(bobScrew);

    // Bottom Counterpoise Spherical Weight
    const mCounterGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const mCounter = new THREE.Mesh(mCounterGeo, chromeMat);
    mCounter.position.y = -0.55;
    mArmGroup.add(mCounter);

    /* ── 9. ASTRONOMICAL HOROLOGICAL CHRONOMETER CLOCKWORK (CLOCK-BASED MODE) ── */
    const clockGroup = new THREE.Group();
    clockGroup.position.set(0, 0.28, 1.2);
    stageGroup.add(clockGroup);
    clockGroupRef.current = clockGroup;

    // Circular 100-Day Obsidian & Titanium Clock Dial Base
    const clockDialGeo = new THREE.CylinderGeometry(4.4, 4.6, 0.24, 64);
    const clockDialMat = new THREE.MeshStandardMaterial({
      color: 0x090D1A, // Deep midnight obsidian dial
      roughness: 0.22,
      metalness: 0.88,
    });
    const clockDial = new THREE.Mesh(clockDialGeo, clockDialMat);
    clockDial.receiveShadow = true;
    clockGroup.add(clockDial);

    // Beveled 18K Gold Outer Clock Bezel
    const cBezelGeo = new THREE.TorusGeometry(4.42, 0.14, 16, 64);
    const cBezel = new THREE.Mesh(cBezelGeo, goldMat);
    cBezel.rotation.x = Math.PI / 2;
    cBezel.position.y = 0.14;
    clockGroup.add(cBezel);

    // Inlaid Dual Concentric Gold Chapter Rings
    const cRing1 = new THREE.Mesh(new THREE.RingGeometry(4.15, 4.28, 64), goldMat);
    cRing1.rotation.x = -Math.PI / 2;
    cRing1.position.y = 0.13;
    clockGroup.add(cRing1);

    const cRing2 = new THREE.Mesh(new THREE.RingGeometry(2.35, 2.45, 48), brassMat);
    cRing2.rotation.x = -Math.PI / 2;
    cRing2.position.y = 0.13;
    clockGroup.add(cRing2);

    // 100 Radial Calendar Day Ticks (1 to 100 Days)
    const tickGroup = new THREE.Group();
    for (let t = 0; t < 100; t++) {
      const tAngle = (t / 100) * Math.PI * 2;
      const isMajor = t % 10 === 0;
      const isSemi = t % 5 === 0;
      const length = isMajor ? 0.65 : isSemi ? 0.42 : 0.22;
      const thickness = isMajor ? 0.07 : 0.04;
      const tGeo = new THREE.BoxGeometry(thickness, 0.035, length);
      const tMesh = new THREE.Mesh(tGeo, isMajor ? goldMat : isSemi ? brassMat : chromeMat);
      const r = 3.65;
      tMesh.position.set(Math.cos(tAngle) * r, 0.14, Math.sin(tAngle) * r);
      tMesh.rotation.y = -tAngle + Math.PI / 2;
      tickGroup.add(tMesh);
    }
    clockGroup.add(tickGroup);

    // Four Cardinal Milestone Tablets (Day 25, 50, 75, 100)
    const cardinalGroup = new THREE.Group();
    const cardinalAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    cardinalAngles.forEach((cAng) => {
      const cardTab = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), goldMat);
      cardTab.position.set(Math.cos(cAng) * 3.0, 0.15, Math.sin(cAng) * 3.0);
      cardTab.rotation.y = -cAng;
      cardinalGroup.add(cardTab);
    });
    clockGroup.add(cardinalGroup);

    // Day 100 Zenith Crown Monument & Maturity Light Beacon
    const day100Crown = new THREE.Group();
    day100Crown.position.set(0, 0.18, -4.0);
    clockGroup.add(day100Crown);
    day100CrownRef.current = day100Crown;

    const crownArch = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.08, 12, 24, Math.PI), goldMat);
    crownArch.rotation.x = Math.PI / 2;
    crownArch.rotation.z = Math.PI;
    day100Crown.add(crownArch);

    const crownGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24),
      new THREE.MeshStandardMaterial({
        color: 0x8B5CF6,
        emissive: 0x7C3AED,
        emissiveIntensity: 1.5,
        roughness: 0.1,
      })
    );
    crownGem.position.y = 0.55;
    day100Crown.add(crownGem);

    // Vertical Maturity Zenith Beam (Lights up when simDay === 100)
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.32, 5.0, 16);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x8B5CF6,
      emissive: 0x7C3AED,
      emissiveIntensity: 2.2,
      transparent: true,
      opacity: 0.85,
    });
    const day100Beam = new THREE.Mesh(beamGeo, beamMat);
    day100Beam.position.set(0, 2.6, -4.0);
    day100Beam.visible = false;
    clockGroup.add(day100Beam);
    day100BeamRef.current = day100Beam;

    // Sunken Open-Heart Movement Cavity (Brushed Brass)
    const wellGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.14, 36);
    const wellMat = new THREE.MeshStandardMaterial({
      color: 0xB45309,
      roughness: 0.35,
      metalness: 0.8,
    });
    const wellMesh = new THREE.Mesh(wellGeo, wellMat);
    wellMesh.position.y = 0.14;
    clockGroup.add(wellMesh);

    // Center Mechanical Gear 1: Master Sun Gear (Brass, 24 teeth)
    const gear1Geo = new THREE.CylinderGeometry(1.25, 1.25, 0.12, 24);
    const gear1 = new THREE.Mesh(gear1Geo, brassMat);
    gear1.position.set(-0.55, 0.22, -0.35);
    clockGroup.add(gear1);
    clockGear1Ref.current = gear1;

    // Center Mechanical Gear 2: Planetary Reduction Gear (18K Gold, 16 teeth)
    const gear2Geo = new THREE.CylinderGeometry(0.95, 0.95, 0.12, 18);
    const gear2 = new THREE.Mesh(gear2Geo, goldMat);
    gear2.position.set(0.65, 0.24, 0.3);
    clockGroup.add(gear2);
    clockGear2Ref.current = gear2;

    // Center Mechanical Gear 3: High-Speed Escapement Pinion (Rose Gold, 12 teeth)
    const gear3Geo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 12);
    const gear3Mat = new THREE.MeshStandardMaterial({ color: 0xF43F5E, roughness: 0.2, metalness: 0.85 });
    const gear3 = new THREE.Mesh(gear3Geo, gear3Mat);
    gear3.position.set(-0.35, 0.25, 0.55);
    clockGroup.add(gear3);
    clockGear3Ref.current = gear3;

    // Center Ruby Escapement Jewel Bearing (Crimson Red with Emissive Brilliance)
    const rubyGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      emissive: 0xDC2626,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const ruby = new THREE.Mesh(rubyGeo, rubyMat);
    ruby.position.set(0, 0.26, 0);
    clockGroup.add(ruby);

    // Arching Skeleton Balance Bridge (Mirror Chrome)
    const bridgeGeo = new THREE.BoxGeometry(0.24, 0.08, 2.6);
    const bridge = new THREE.Mesh(bridgeGeo, chromeMat);
    bridge.position.set(0, 0.32, 0);
    bridge.rotation.y = 0.45;
    clockGroup.add(bridge);

    // Master Sweeping Golden Chronometer Clock Hand
    const handGroup = new THREE.Group();
    handGroup.position.set(0, 0.35, 0);
    clockGroup.add(handGroup);
    clockHandRef.current = handGroup;

    // Center Gold Hand Hub
    const hSpindle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.22, 20), goldMat);
    handGroup.add(hSpindle);

    // Sculpted Dauphine Spear Hand Blade
    const hBladeGeo = new THREE.ConeGeometry(0.22, 3.8, 4);
    const hBlade = new THREE.Mesh(hBladeGeo, goldMat);
    hBlade.rotation.x = Math.PI / 2;
    hBlade.position.set(0, 0.1, -1.9);
    handGroup.add(hBlade);

    // Luminous Diamond Tip on Chronometer Hand
    const hTipGeo = new THREE.OctahedronGeometry(0.18);
    const hTipMat = new THREE.MeshStandardMaterial({
      color: 0xA7F3D0,
      emissive: 0x10B981,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });
    const hTip = new THREE.Mesh(hTipGeo, hTipMat);
    hTip.position.set(0, 0.1, -3.75);
    handGroup.add(hTip);

    // Crescent Balance Counterpoise Tail
    const hTailGeo = new THREE.BoxGeometry(0.24, 0.08, 0.9);
    const hTail = new THREE.Mesh(hTailGeo, goldMat);
    hTail.position.set(0, 0.1, 0.55);
    handGroup.add(hTail);

    // Secondary Blued-Steel High-Frequency Sweep Needle
    const secHandGroup = new THREE.Group();
    secHandGroup.position.set(0, 0.42, 0);
    clockGroup.add(secHandGroup);
    clockSecHandRef.current = secHandGroup;

    const secNeedleMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.1, metalness: 0.9 });
    const secNeedle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.4, 8), secNeedleMat);
    secNeedle.rotation.x = Math.PI / 2;
    secNeedle.position.set(0, 0, -1.2);
    secHandGroup.add(secNeedle);

    /* ── 10. CURVED TELLER COUNTER WITH 20 PHYSICAL DEPOSIT DRAWERS ── */
    const counterRadius = 11.2;
    const counterArc = Math.PI * 0.9;
    const startAngle = Math.PI * 0.5 - counterArc / 2;

    const drawerMeshes = [];
    const cashPackets = [];

    // Currency Materials (Reserve Banknotes with Cream Band)
    const billBodyMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.4,
      metalness: 0.1,
    });
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xFEF3C7,
      roughness: 0.6,
      metalness: 0.05,
    });
    const receiptPaperMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.7,
      metalness: 0.02,
    });

    const createCashPacket = () => {
      const packet = new THREE.Group();
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.45), billBodyMat);
      bMesh.castShadow = true;
      packet.add(bMesh);

      const band = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.23, 0.46), bandMat);
      packet.add(band);

      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.35), receiptPaperMat);
      tab.position.set(0, 0.12, 0.15);
      tab.rotation.x = 0.2;
      packet.add(tab);

      return packet;
    };

    const deferredCardMat = new THREE.MeshStandardMaterial({
      color: 0x3B82F6,
      roughness: 0.3,
      metalness: 0.3,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.2,
    });

    for (let i = 0; i < SLOT_COUNT; i++) {
      const angle = startAngle + (i / (SLOT_COUNT - 1)) * counterArc;
      const x = Math.cos(angle) * counterRadius;
      const z = Math.sin(angle) * counterRadius * 0.75 + 2.0;

      const slotGroup = new THREE.Group();
      slotGroup.position.set(x, 0.25, z);
      slotGroup.rotation.y = -angle + Math.PI / 2;
      stageGroup.add(slotGroup);

      // Stainless Steel Drawer Housing
      const boxGeo = new THREE.BoxGeometry(0.95, 0.35, 0.7);
      const boxMesh = new THREE.Mesh(boxGeo, steelMat);
      boxMesh.position.y = 0.2;
      boxMesh.receiveShadow = true;
      boxMesh.castShadow = true;
      slotGroup.add(boxMesh);

      // Top Chrome Drawer Trim
      const rimGeo = new THREE.BoxGeometry(1.0, 0.06, 0.75);
      const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
      rimMesh.position.y = 0.38;
      slotGroup.add(rimMesh);

      // Milestone Tag Plaque on Front
      const plaqueGeo = new THREE.PlaneGeometry(0.45, 0.16);
      const plaqueMesh = new THREE.Mesh(plaqueGeo, brassMat);
      plaqueMesh.position.set(0, 0.2, 0.36);
      slotGroup.add(plaqueMesh);

      // Glass Teller Partition Divider
      if (i < SLOT_COUNT - 1) {
        const partGeo = new THREE.BoxGeometry(0.04, 0.6, 0.65);
        const part = new THREE.Mesh(partGeo, glassMat);
        part.position.set(0.52, 0.45, 0);
        slotGroup.add(part);
      }

      // Stack of Physical Cash Packets
      const stackGroup = new THREE.Group();
      stackGroup.position.set(0, 0.42, 0);
      slotGroup.add(stackGroup);

      const p1 = createCashPacket();
      p1.position.y = 0.1;
      stackGroup.add(p1);

      const p2 = createCashPacket();
      p2.position.set(0.02, 0.32, -0.02);
      p2.rotation.y = 0.05;
      stackGroup.add(p2);

      const defCard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.45), deferredCardMat);
      defCard.position.y = 0.05;
      defCard.visible = false;
      stackGroup.add(defCard);

      drawerMeshes.push({
        box: boxMesh,
        index: i,
        dayNum: i === SLOT_COUNT - 1 ? 100 : Math.round((i / (SLOT_COUNT - 1)) * 99) + 1,
        slotGroup,
        stackGroup,
        p1,
        p2,
        defCard,
      });

      cashPackets.push(stackGroup);
    }
    drawerSlotsRef.current = drawerMeshes;
    cashPacketsRef.current = cashPackets;

    /* ── 11. DAY 100 GRAND TREASURY VAULT PODIUM ── */
    const lastSlot = drawerMeshes[SLOT_COUNT - 1];
    const lumpSumGroup = new THREE.Group();
    lumpSumGroup.position.set(lastSlot.slotGroup.position.x, 0.25, lastSlot.slotGroup.position.z);
    lumpSumGroup.rotation.y = lastSlot.slotGroup.rotation.y;
    stageGroup.add(lumpSumGroup);
    lumpSumVaultRef.current = lumpSumGroup;

    const lPedGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.6, 24);
    const lPed = new THREE.Mesh(lPedGeo, marbleMat);
    lPed.position.y = 0.3;
    lPed.receiveShadow = true;
    lumpSumGroup.add(lPed);

    const lRimGeo = new THREE.TorusGeometry(1.65, 0.1, 16, 32);
    const lRim = new THREE.Mesh(lRimGeo, goldMat);
    lRim.rotation.x = Math.PI / 2;
    lRim.position.y = 0.6;
    lumpSumGroup.add(lRim);

    // Massive Cash Stack (₹12,500 Full Maturity Recovery)
    const masterStackGroup = new THREE.Group();
    masterStackGroup.position.set(0, 0.7, 0);
    lumpSumGroup.add(masterStackGroup);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const p = createCashPacket();
        p.position.set((col - 0.5) * 0.78, row * 0.24, 0);
        masterStackGroup.add(p);
      }
    }

    const topIngot1 = new THREE.Mesh(ingotGeo, goldMat);
    topIngot1.position.set(-0.35, 1.15, 0);
    topIngot1.scale.set(0.65, 0.65, 0.65);
    masterStackGroup.add(topIngot1);

    const topIngot2 = new THREE.Mesh(ingotGeo, goldMat);
    topIngot2.position.set(0.35, 1.15, 0);
    topIngot2.scale.set(0.65, 0.65, 0.65);
    masterStackGroup.add(topIngot2);

    const certGeo = new THREE.PlaneGeometry(1.1, 0.75);
    const certMat = new THREE.MeshStandardMaterial({
      color: 0xFEF3C7,
      roughness: 0.3,
      metalness: 0.1,
    });
    const certMesh = new THREE.Mesh(certGeo, certMat);
    certMesh.position.set(0, 1.8, 0.2);
    masterStackGroup.add(certMesh);

    const certPinGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
    const certPin = new THREE.Mesh(certPinGeo, brassMat);
    certPin.position.set(0, 1.2, 0.18);
    masterStackGroup.add(certPin);

    /* ── 12. OVERHEAD BRASS CASH TRANSIT RAIL & CAPSULE ── */
    const railRadius = 11.2;
    const railGeo = new THREE.TorusGeometry(railRadius, 0.06, 16, 64, counterArc);
    const railMesh = new THREE.Mesh(railGeo, brassMat);
    railMesh.rotation.x = Math.PI / 2;
    railMesh.rotation.z = startAngle;
    railMesh.position.set(0, 2.8, 2.0);
    stageGroup.add(railMesh);

    const capsuleGroup = new THREE.Group();
    const capBodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
    const capBody = new THREE.Mesh(capBodyGeo, chromeMat);
    capBody.rotation.z = Math.PI / 2;
    capsuleGroup.add(capBody);

    const capRingGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16);
    const capRing = new THREE.Mesh(capRingGeo, goldMat);
    capsuleGroup.add(capRing);

    capsuleGroup.position.set(0, 2.8, 2.0);
    stageGroup.add(capsuleGroup);
    transitCapsuleRef.current = capsuleGroup;

    /* ── 13. ARCHITECTURAL MOUNTING STANCHION & CAMERA-FACING SIGNAGE ── */
    const stanchionPinGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 16);
    const stanchionPin = new THREE.Mesh(stanchionPinGeo, steelMat);
    stanchionPin.position.set(0, 5.8, -6.5);
    stageGroup.add(stanchionPin);

    const titleTex = makeTextTexture(
      isNormalMode ? 'EQUAL DAILY INSTALLMENTS' : 'BULLET REPAYMENT AT MATURITY',
      isNormalMode ? 'Fixed ₹125.00 / day × 100 Cycles = ₹12,500 Recovered' : 'Days 1–99: ₹0.00 Dues ➔ Day 100: Settle ₹12,500 Full',
      isNormalMode ? 'FIXED CADENCE REGULATOR' : 'CHRONOMETER MATURITY CLOCK'
    );
    billboardTexRef.current = titleTex;

    const billboardMat = new THREE.SpriteMaterial({
      map: titleTex,
      transparent: true,
      depthWrite: false,
    });
    const billboardSprite = new THREE.Sprite(billboardMat);
    billboardSprite.scale.set(9.4, 3.3, 1);
    billboardSprite.position.set(0, 7.8, -6.5);
    billboardSprite.renderOrder = 999;
    stageGroup.add(billboardSprite);
    billboardSpriteRef.current = billboardSprite;

    /* ── 14. POINTER / RAYCASTER EVENTS ── */
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseVector.set(x, y);

      if (isDraggingRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;
        orbitAngleRef.current += deltaX * 0.006;
        targetCamPosRef.current.y = THREE.MathUtils.clamp(
          targetCamPosRef.current.y - deltaY * 0.05,
          4,
          26
        );
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }

      raycaster.setFromCamera(mouseVector, camera);
      const interactiveBoxes = drawerMeshes.map((d) => d.box);
      const hits = raycaster.intersectObjects(interactiveBoxes);

      if (hits.length > 0) {
        const hitBox = hits[0].object;
        const matched = drawerMeshes.find((d) => d.box === hitBox);
        if (matched) {
          const dayLabel = `Day ${matched.dayNum}`;
          const statusText = isNormalMode
            ? `${dayLabel}: Fixed ₹125.00 Banknote Bundle (Cycle Cleared)`
            : matched.index === SLOT_COUNT - 1
            ? `Day 100 (Final Maturity): ₹12,500 Full Balance Settled + Certificate`
            : `${dayLabel}: Clock Tick at ₹0.00 Due (Deferred to Day 100)`;
          setHoveredInfo(statusText);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      } else {
        setHoveredInfo(null);
      }
    };

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      setIsAutoOrbit(false);
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    /* ── 15. ANIMATION LOOP ── */
    let clock = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      clock += 0.016;

      // Vault combination wheel turns with slow realistic precision
      if (vaultWheelRef.current) {
        vaultWheelRef.current.rotation.y += 0.005;
      }

      // Overhead capsule carriage glides along curved rail
      if (transitCapsuleRef.current) {
        const railProgress = (Math.sin(clock * 0.8) + 1) / 2;
        const capAngle = startAngle + railProgress * counterArc;
        transitCapsuleRef.current.position.x = Math.cos(capAngle) * railRadius;
        transitCapsuleRef.current.position.z = Math.sin(capAngle) * railRadius * 0.75 + 2.0;
        transitCapsuleRef.current.rotation.y = -capAngle + Math.PI / 2;
      }

      // ── FIXED MODE: Metronome swings with steady, invariant cadence ──
      if (metronomeGroupRef.current) {
        metronomeGroupRef.current.visible = isNormalMode;
      }
      if (metronomeArmRef.current && isNormalMode) {
        const swing = Math.sin(clock * 3.6);
        metronomeArmRef.current.rotation.z = swing * 0.36;
        if (metronomePulseRef.current) {
          const pulseScale = 1.0 + Math.abs(swing) * 0.08;
          metronomePulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
          if (metronomePulseRef.current.material) {
            metronomePulseRef.current.material.opacity = 0.5 + Math.abs(swing) * 0.45;
          }
        }
      }

      // ── CLOCK MODE: Gears spin and golden clock hand sweeps through 100 days ──
      if (clockGroupRef.current) {
        clockGroupRef.current.visible = !isNormalMode;
      }
      if (!isNormalMode) {
        if (clockGear1Ref.current) clockGear1Ref.current.rotation.y += 0.016;
        if (clockGear2Ref.current) clockGear2Ref.current.rotation.y -= 0.022;
        if (clockGear3Ref.current) clockGear3Ref.current.rotation.y += 0.038;
        if (clockSecHandRef.current) clockSecHandRef.current.rotation.y += 0.045;

        if (clockHandRef.current) {
          // Sweeps clockwise around the clock face according to simulated day (1 to 100)
          const targetAngle = -((simDay - 1) / 99) * Math.PI * 1.8 + Math.PI * 0.9;
          clockHandRef.current.rotation.y += (targetAngle - clockHandRef.current.rotation.y) * 0.1;
        }

        if (day100BeamRef.current) {
          day100BeamRef.current.visible = simDay === 100;
          if (simDay === 100) {
            day100BeamRef.current.rotation.y += 0.03;
          }
        }
        if (day100CrownRef.current) {
          day100CrownRef.current.position.y = 0.18 + (simDay === 100 ? Math.sin(clock * 4.0) * 0.06 : 0);
        }
      }

      // Update Drawers according to active mode & simulated day progress
      drawerMeshes.forEach((d) => {
        const isDayReached = d.dayNum <= simDay;

        if (isNormalMode) {
          // NORMAL (FIXED): Equal height cash bundles
          d.p1.visible = isDayReached;
          d.p2.visible = isDayReached;
          d.defCard.visible = false;
          lumpSumGroup.visible = false;
          d.slotGroup.visible = true;

          // Metronome-synchronized subtle pulse
          if (isDayReached && Math.abs(d.dayNum - simDay) < 3) {
            d.stackGroup.position.y = 0.42 + Math.abs(Math.sin(clock * 3.6)) * 0.04;
          } else {
            d.stackGroup.position.y = 0.42;
          }
        } else {
          // LUMP_SUM_END (CLOCK): Deferred cards for days 1–99, Day 100 Grand Vault
          if (d.index === SLOT_COUNT - 1) {
            d.slotGroup.visible = false;
            lumpSumGroup.visible = true;
            lumpSumGroup.position.y = isDayReached ? 0.25 : -2;
          } else {
            d.p1.visible = false;
            d.p2.visible = false;
            d.defCard.visible = true;
            d.slotGroup.visible = true;
            d.stackGroup.position.y = 0.42;
          }
        }
      });

      // Camera auto-orbit
      if (isAutoOrbit && !isDraggingRef.current) {
        orbitAngleRef.current += 0.0022;
        const camR = 28;
        targetCamPosRef.current.x = Math.sin(orbitAngleRef.current) * camR;
        targetCamPosRef.current.z = Math.cos(orbitAngleRef.current) * camR;
      }

      currentCamPosRef.current.lerp(targetCamPosRef.current, 0.05);
      camera.position.copy(currentCamPosRef.current);
      camera.lookAt(0, 1.2, 0);

      renderer.render(scene, camera);
    };
    animate();

    /* ── 16. RESIZE HANDLER ── */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', onResize);

    /* ── CLEANUP ── */
    return () => {
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });
    };
  }, [isNormalMode, simDay, makeTextTexture]);

  /* ── Dynamic Billboard Texture Update on Mode Change ── */
  useEffect(() => {
    if (billboardSpriteRef.current && billboardTexRef.current) {
      billboardTexRef.current.dispose();
      const newTex = makeTextTexture(
        isNormalMode ? 'EQUAL DAILY INSTALLMENTS' : 'BULLET REPAYMENT AT MATURITY',
        isNormalMode ? 'Fixed ₹125.00 / day × 100 Cycles = ₹12,500 Recovered' : 'Days 1–99: ₹0.00 Dues ➔ Day 100: Settle ₹12,500 Full',
        isNormalMode ? 'FIXED CADENCE REGULATOR' : 'CHRONOMETER MATURITY CLOCK'
      );
      billboardTexRef.current = newTex;
      billboardSpriteRef.current.material.map = newTex;
      billboardSpriteRef.current.material.needsUpdate = true;
    }
  }, [isNormalMode, makeTextTexture]);

  const recoveredAmount = isNormalMode
    ? Math.round((simDay / 100) * 12500)
    : simDay === 100
    ? 12500
    : 0;

  return (
    <div className="collection-stage-3d-wrapper">
      <div ref={mountRef} className="collection-stage-canvas" />

      {/* Top Toolbar: Mode Status Pill */}
      <div className="collection-hud-overlay">
        <div className="collection-hud-pill">
          <div className={`collection-hud-led ${isNormalMode ? '' : 'purple'}`} />
          <div>
            <span className="collection-hud-text">
              {isNormalMode ? 'FIXED DAILY CADENCE' : 'CLOCK-BASED BULLET MATURITY'}
            </span>
            <span className="collection-hud-subtext">
              ({isNormalMode ? 'Metronome Regulator' : 'Astronomical Chronometer'})
            </span>
          </div>
        </div>
      </div>

      {/* Unified Floating Master Console Dock (Bottom Center) */}
      <div className="collection-master-dock">
        {/* Left: View Presets */}
        <div className="dock-views-group">
          <button
            type="button"
            className={`coll-view-btn ${activeCamView === 'overview' ? 'active' : ''}`}
            onClick={() => setCamView('overview')}
            title="Campus Overview"
          >
            <Building2 size={13} />
            <span>Campus</span>
          </button>

          <button
            type="button"
            className={`coll-view-btn ${activeCamView === 'mechanism' ? 'active' : ''}`}
            onClick={() => setCamView('mechanism')}
            title={isNormalMode ? 'Metronome & Drawers' : 'Chronometer Clock Dial'}
          >
            {isNormalMode ? <Layers size={13} /> : <Clock size={13} />}
            <span>{isNormalMode ? 'Fixed Rack' : 'Clock Dial'}</span>
          </button>

          <button
            type="button"
            className={`coll-view-btn ${activeCamView === 'vault' ? 'active' : ''}`}
            onClick={() => setCamView('vault')}
            title="Zoom to Central Bank Vault Safe"
          >
            <Lock size={13} />
            <span>Vault</span>
          </button>

          <button
            type="button"
            className={`coll-orbit-btn ${isAutoOrbit ? 'active' : ''}`}
            onClick={() => setIsAutoOrbit(!isAutoOrbit)}
            title={isAutoOrbit ? 'Pause Orbit Rotation' : 'Enable 360° Auto-Orbit'}
          >
            {isAutoOrbit ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>

        <div className="dock-divider" />

        {/* Right: Simulation Controls & Recovery Ticker */}
        <div className="dock-sim-group">
          <button
            type="button"
            className={`sim-play-btn ${isPlayingSim ? 'playing' : ''}`}
            onClick={() => setIsPlayingSim(!isPlayingSim)}
            title={isPlayingSim ? 'Pause Simulation' : 'Run 100-Day Simulation'}
          >
            {isPlayingSim ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlayingSim ? 'Pause' : 'Simulate'}</span>
          </button>

          <div className="sim-slider-container">
            <input
              type="range"
              min="1"
              max="100"
              value={simDay}
              onChange={(e) => {
                setIsPlayingSim(false);
                setSimDay(Number(e.target.value));
              }}
              className="sim-day-slider"
              title="Scrub Day (1 to 100)"
            />
            <span className="sim-day-badge">Day {simDay}</span>
          </div>

          <button
            type="button"
            className="sim-reset-btn"
            onClick={() => {
              setIsPlayingSim(false);
              setSimDay(1);
            }}
            title="Reset to Day 1"
          >
            <RotateCcw size={12} />
          </button>

          <span
            className="sim-amount-badge"
            style={{ color: isNormalMode ? '#059669' : '#7C3AED' }}
          >
            ₹{recoveredAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Interactive Raycasting Hover Tooltip */}
      {hoveredInfo && (
        <div
          className="collection-node-tooltip"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          {hoveredInfo}
        </div>
      )}
    </div>
  );
};

export default ThreeCollectionDemo;
