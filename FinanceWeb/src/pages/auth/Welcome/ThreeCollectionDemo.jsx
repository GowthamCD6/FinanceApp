import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw, Play, Pause, RotateCcw, Store, Milestone, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import './ThreeCollectionDemo.css';

/**
 * ThreeCollectionDemo: Realistic Architectural Financial Settlement Campus
 * - Detailed Merchant Retail Boutique (Glass storefront, awning, counter, POS terminal, wholesale crates)
 * - Detailed Bank Corporate Headquarters (8-tier glass skyscraper, grand lobby, rooftop spire, rotating gear vault)
 * - 100-Day Amortization Viaduct with 5 milestone archways
 * - Interactive Day Scrubber / Simulation Pendulum & Rolling Settlement Engine
 */
export const ThreeCollectionDemo = ({ mode = 'NORMAL', onModeChange }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);

  // Dynamic mesh references
  const vaultOuterWheelRef = useRef(null);
  const vaultInnerWheelRef = useRef(null);
  const vaultSpokesGroupRef = useRef(null);
  const currencyFlowGroupRef = useRef(null);
  const deferralShieldRef = useRef(null);
  const maturityVaultRef = useRef(null);
  const maturityRingsRef = useRef(null);
  const day100BeamRef = useRef(null);
  const floatingCoinRef = useRef(null);
  const beaconLightRef = useRef(null);
  const portalsRef = useRef([]);
  const merchantInventoryRef = useRef([]);
  const particlesRef = useRef(null);

  // Simulation day scrubber state (1 to 100)
  const [simDay, setSimDay] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);
  const simDayRef = useRef(1);

  // Mode reference (avoids re-creating WebGL scene on mode switch)
  const isNormalModeRef = useRef(mode === 'NORMAL' || mode === 'FIXED');
  useEffect(() => {
    isNormalModeRef.current = (mode === 'NORMAL' || mode === 'FIXED');
  }, [mode]);

  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeCamPreset, setActiveCamPreset] = useState('all');
  const [isAutoOrbit, setIsAutoOrbit] = useState(true);
  const isAutoOrbitRef = useRef(true);

  // Camera lerp targets
  const targetCamPosRef = useRef(new THREE.Vector3(26, 18, 27));
  const currentCamPosRef = useRef(new THREE.Vector3(26, 18, 27));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1.8, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 1.8, 0));
  const orbitAngleRef = useRef(0.76);
  const orbitRadiusRef = useRef(32);

  // Pointer drag tracking
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Camera Presets
  const setCamView = useCallback((preset) => {
    setActiveCamPreset(preset);
    if (preset === 'all') {
      targetCamPosRef.current.set(26, 18, 27);
      targetLookAtRef.current.set(0, 1.8, 0);
      orbitRadiusRef.current = 32;
      isAutoOrbitRef.current = true;
      setIsAutoOrbit(true);
    } else if (preset === 'merchant') {
      targetCamPosRef.current.set(-11, 8.5, 14);
      targetLookAtRef.current.set(-9.2, 2.4, 0);
      isAutoOrbitRef.current = false;
      setIsAutoOrbit(false);
    } else if (preset === 'track') {
      targetCamPosRef.current.set(0, 13, 22);
      targetLookAtRef.current.set(0, 1.6, 0);
      isAutoOrbitRef.current = false;
      setIsAutoOrbit(false);
    } else if (preset === 'vault') {
      targetCamPosRef.current.set(12, 10, 15);
      targetLookAtRef.current.set(9.2, 3.4, 0);
      isAutoOrbitRef.current = false;
      setIsAutoOrbit(false);
    }
  }, []);

  const toggleAutoOrbit = () => {
    const nextVal = !isAutoOrbit;
    setIsAutoOrbit(nextVal);
    isAutoOrbitRef.current = nextVal;
  };

  const togglePlay = () => {
    const nextVal = !isPlaying;
    setIsPlaying(nextVal);
    isPlayingRef.current = nextVal;
  };

  const handleDayChange = (newDay) => {
    setSimDay(newDay);
    simDayRef.current = newDay;
  };

  const resetSimulation = () => {
    setSimDay(1);
    simDayRef.current = 1;
    setIsPlaying(true);
    isPlayingRef.current = true;
  };

  /* ── Three.js Scene Setup ── */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 620;

    /* ── 1. SCENE ── */
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xF8FAFC);
    scene.fog = new THREE.FogExp2(0xF8FAFC, 0.011);

    /* ── 2. CAMERA ── */
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 500);
    camera.position.set(26, 18, 27);
    camera.lookAt(0, 1.8, 0);
    cameraRef.current = camera;
    currentCamPosRef.current.copy(camera.position);

    /* ── 3. RENDERER ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    /* ── 4. RADIANT DAYLIGHT STUDIO LIGHTING RIG ── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.55);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 1.35);
    hemiLight.position.set(0, 45, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
    sunLight.position.set(28, 42, 26);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0xE0F2FE, 1.25);
    skyFillLight.position.set(-26, 24, -20);
    scene.add(skyFillLight);

    const centerWarmLight = new THREE.PointLight(0xF59E0B, 1.9, 32);
    centerWarmLight.position.set(0, 5, 2);
    scene.add(centerWarmLight);

    /* ── 5. CURATED ARCHITECTURAL MATERIALS ── */
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.16,
      metalness: 0.05,
    });
    const whiteFacadeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.12,
      metalness: 0.08,
    });
    const warmLimestoneMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.28,
      metalness: 0.12,
    });
    const platinumBodyMat = new THREE.MeshStandardMaterial({
      color: 0xEEF2F6,
      roughness: 0.18,
      metalness: 0.3,
    });
    const navyBrandMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.22,
      metalness: 0.4,
    });
    const royalBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1D4ED8,
      roughness: 0.16,
      metalness: 0.48,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: 0xD97706,
      emissiveIntensity: 0.35,
      roughness: 0.14,
      metalness: 0.88,
    });
    const darkGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0284C7,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      metalness: 0.6,
    });
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0xE0F2FE,
      transparent: true,
      opacity: 0.45,
      roughness: 0.06,
      metalness: 0.4,
    });
    const highwayDeckMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.3,
      metalness: 0.25,
    });
    const purpleShieldMat = new THREE.MeshStandardMaterial({
      color: 0x8B5CF6,
      emissive: 0x7C3AED,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.36,
      roughness: 0.08,
    });
    const cashGreenMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.42,
      roughness: 0.2,
      metalness: 0.2,
    });
    const neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x0284C7,
      emissiveIntensity: 1.6,
      roughness: 0.1,
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      roughness: 0.65,
    });

    /* ── 6. CAMPUS ROOT GROUP ── */
    const campusGroup = new THREE.Group();
    campusGroup.scale.set(0.72, 0.72, 0.72);
    campusGroup.position.set(0, -0.4, 0);
    scene.add(campusGroup);

    // Main Ground Plinth (Structured Architectural Slab)
    const groundPlinth = new THREE.Mesh(new THREE.BoxGeometry(30.4, 0.7, 19.4), plinthMat);
    groundPlinth.position.y = -0.35;
    groundPlinth.receiveShadow = true;
    campusGroup.add(groundPlinth);

    // Beveled Inlaid 18K Gold Perimeter Trim
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(30.6, 0.12, 19.6), goldMat);
    goldTrim.position.y = -0.7;
    campusGroup.add(goldTrim);

    // Decorative Ground Pavers & Glowing Neon Flow Tracks
    const paverLine1 = new THREE.Mesh(new THREE.BoxGeometry(29, 0.02, 0.18), royalBlueMat);
    paverLine1.position.set(0, 0.01, -4.6);
    campusGroup.add(paverLine1);

    const paverLine2 = new THREE.Mesh(new THREE.BoxGeometry(29, 0.02, 0.18), royalBlueMat);
    paverLine2.position.set(0, 0.01, 4.6);
    campusGroup.add(paverLine2);

    // Central Radiant Energy Circuit Line on Ground
    const circuit = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.02, 0.12), neonCyanMat);
    circuit.position.set(0, 0.02, 0);
    campusGroup.add(circuit);

    // Landscaped Planters with Green Foliage along Plaza Edge
    const planterGeo = new THREE.BoxGeometry(3.6, 0.28, 0.65);
    const hedgeGeo = new THREE.BoxGeometry(3.4, 0.45, 0.5);

    const p1 = new THREE.Mesh(planterGeo, whiteFacadeMat);
    p1.position.set(-10, 0.14, 6.4);
    campusGroup.add(p1);
    const h1 = new THREE.Mesh(hedgeGeo, foliageMat);
    h1.position.set(-10, 0.45, 6.4);
    campusGroup.add(h1);

    const p2 = new THREE.Mesh(planterGeo, whiteFacadeMat);
    p2.position.set(10, 0.14, 6.4);
    campusGroup.add(p2);
    const h2 = new THREE.Mesh(hedgeGeo, foliageMat);
    h2.position.set(10, 0.45, 6.4);
    campusGroup.add(h2);

    /* ── 7. LEFT SECTOR: CRAFTED MERCHANT STOREFRONT & KIOSK ── */
    const merchantGroup = new THREE.Group();
    merchantGroup.position.set(-9.2, 0, 0);
    campusGroup.add(merchantGroup);

    // Merchant Terrace Base with Stepped Entrance
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 7.2), whiteFacadeMat);
    mBase.position.y = 0.18;
    mBase.receiveShadow = true;
    merchantGroup.add(mBase);

    const mStep = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 0.9), platinumBodyMat);
    mStep.position.set(0, 0.08, 3.8);
    merchantGroup.add(mStep);

    // Store Building Body (Contemporary Commercial Retail Pavilion)
    const mBuilding = new THREE.Mesh(new THREE.BoxGeometry(5.8, 4.6, 5.2), navyBrandMat);
    mBuilding.position.set(0, 2.6, -0.3);
    mBuilding.castShadow = true;
    mBuilding.receiveShadow = true;
    merchantGroup.add(mBuilding);

    // Architectural Limestone Portico Columns
    const pColGeo = new THREE.BoxGeometry(0.35, 4.6, 0.35);
    const pColL = new THREE.Mesh(pColGeo, warmLimestoneMat);
    pColL.position.set(-2.6, 2.6, 2.3);
    merchantGroup.add(pColL);

    const pColR = new THREE.Mesh(pColGeo, warmLimestoneMat);
    pColR.position.set(2.6, 2.6, 2.3);
    merchantGroup.add(pColR);

    // Storefront Roof Fascia & Architectural Parapet
    const mRoofTrim = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.28, 5.6), royalBlueMat);
    mRoofTrim.position.set(0, 4.95, -0.3);
    merchantGroup.add(mRoofTrim);

    // 3D Store Signboard with Gold Trim
    const mSignboard = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.6, 0.18), navyBrandMat);
    mSignboard.position.set(0, 4.25, 2.38);
    merchantGroup.add(mSignboard);

    const mSignText = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.4, 0.05), goldMat);
    mSignText.position.set(0, 4.25, 2.48);
    merchantGroup.add(mSignText);

    // Storefront Display Glass Windows with Grid Mullions
    const mWindow = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.7, 0.15), windowGlassMat);
    mWindow.position.set(0, 2.2, 2.32);
    merchantGroup.add(mWindow);

    // Window Mullion Dividers
    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.7, 0.18), whiteFacadeMat);
    mullionV.position.set(0, 2.2, 2.32);
    merchantGroup.add(mullionV);

    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 0.18), whiteFacadeMat);
    mullionH.position.set(0, 2.2, 2.32);
    merchantGroup.add(mullionH);

    // Fabric Awning with Navy and White Ribs
    const mCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 2.2), royalBlueMat);
    mCanopy.position.set(0, 3.65, 2.2);
    mCanopy.rotation.x = 0.15;
    mCanopy.castShadow = true;
    merchantGroup.add(mCanopy);

    const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.04, 0.25), whiteFacadeMat);
    canopyTrim.position.set(0, 3.5, 3.25);
    canopyTrim.rotation.x = 0.15;
    merchantGroup.add(canopyTrim);

    // Service Counter Table with Marble Top
    const mCounter = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.1, 1.2), platinumBodyMat);
    mCounter.position.set(0, 0.9, 2.6);
    mCounter.castShadow = true;
    merchantGroup.add(mCounter);

    const mCounterTop = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.08, 1.3), whiteFacadeMat);
    mCounterTop.position.set(0, 1.48, 2.6);
    merchantGroup.add(mCounterTop);

    // Smart POS Terminal (Doorstep Agent Mobile Terminal)
    const posBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.5), navyBrandMat);
    posBase.position.set(-0.7, 1.58, 2.6);
    merchantGroup.add(posBase);

    const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.08), neonCyanMat);
    posScreen.position.set(-0.7, 1.85, 2.55);
    posScreen.rotation.x = -0.35;
    merchantGroup.add(posScreen);

    // Floating 3D Gold Currency Token over the POS Counter
    const coinGroup = new THREE.Group();
    coinGroup.position.set(-0.7, 2.65, 2.6);
    merchantGroup.add(coinGroup);
    floatingCoinRef.current = coinGroup;

    const coinMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.08, 28),
      goldMat
    );
    coinMesh.rotation.x = Math.PI / 2;
    coinGroup.add(coinMesh);

    // Wholesale Stock Inventory Boxes (Growth assets funded by loan)
    const inventoryBoxes = [];
    const crateGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const cratePositions = [
      { x: 1.8, y: 0.72, z: 2.4, r: 0.1 },
      { x: 1.8, y: 1.52, z: 2.4, r: -0.15 },
      { x: 1.0, y: 0.72, z: 2.4, r: 0.25 },
    ];
    cratePositions.forEach((pos) => {
      const crate = new THREE.Mesh(crateGeo, goldMat);
      crate.position.set(pos.x, pos.y, pos.z);
      crate.rotation.y = pos.r;
      crate.castShadow = true;
      merchantGroup.add(crate);
      inventoryBoxes.push(crate);
    });
    merchantInventoryRef.current = inventoryBoxes;

    /* ── 8. CENTER SECTOR: 100-DAY AMORTIZATION HIGHWAY & 5 MILESTONE PORTALS ── */
    const highwayGroup = new THREE.Group();
    campusGroup.add(highwayGroup);

    // Concrete Viaduct Bridge Support Piers
    const pierGeo = new THREE.BoxGeometry(0.45, 0.65, 3.2);
    const pPier1 = new THREE.Mesh(pierGeo, platinumBodyMat);
    pPier1.position.set(-3.5, 0.32, 0);
    highwayGroup.add(pPier1);

    const pPier2 = new THREE.Mesh(pierGeo, platinumBodyMat);
    pPier2.position.set(3.5, 0.32, 0);
    highwayGroup.add(pPier2);

    // Main Elevated Highway Deck
    const deckGeo = new THREE.BoxGeometry(11.8, 0.35, 3.4);
    const deck = new THREE.Mesh(deckGeo, highwayDeckMat);
    deck.position.set(0, 0.65, 0);
    deck.receiveShadow = true;
    highwayGroup.add(deck);

    // Highway Guardrails with Blue Neon Edge
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.14, 0.12), royalBlueMat);
    rail1.position.set(0, 0.9, -1.65);
    highwayGroup.add(rail1);

    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.14, 0.12), royalBlueMat);
    rail2.position.set(0, 0.9, 1.65);
    highwayGroup.add(rail2);

    // 5 Architectural Milestone Portals (Days 1, 25, 50, 75, 100)
    const portals = [];
    const milestoneDays = [1, 25, 50, 75, 100];
    const portalXCoords = [-4.6, -2.3, 0, 2.3, 4.6];

    portalXCoords.forEach((px, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0.8, 0);
      highwayGroup.add(pGroup);

      // Left and Right Arch Pylons
      const pylonGeo = new THREE.BoxGeometry(0.2, 2.3, 0.26);
      const pLeft = new THREE.Mesh(pylonGeo, platinumBodyMat);
      pLeft.position.set(0, 1.15, -1.5);
      pGroup.add(pLeft);

      const pRight = new THREE.Mesh(pylonGeo, platinumBodyMat);
      pRight.position.set(0, 1.15, 1.5);
      pGroup.add(pRight);

      // Arch Header Lintel with LED Glow Trim
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 3.26), platinumBodyMat);
      lintel.position.set(0, 2.3, 0);
      pGroup.add(lintel);

      // Milestone Status Jewel Beacon
      const beaconGeo = new THREE.OctahedronGeometry(0.25);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x10B981,
        emissive: 0x059669,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 2.7, 0);
      pGroup.add(beacon);

      portals.push({
        group: pGroup,
        dayNum: milestoneDays[idx],
        beacon,
        beaconMat,
        px,
      });
    });
    portalsRef.current = portals;

    // Moving Currency Pulse Stream (Active in NORMAL Mode)
    const currencyStreamGroup = new THREE.Group();
    highwayGroup.add(currencyStreamGroup);
    currencyFlowGroupRef.current = currencyStreamGroup;

    const packetMeshes = [];
    const packetGeo = new THREE.BoxGeometry(0.68, 0.18, 0.42);
    for (let c = 0; c < 8; c++) {
      const pGroup = new THREE.Group();
      const pMesh = new THREE.Mesh(packetGeo, cashGreenMat);
      pMesh.castShadow = true;
      pGroup.add(pMesh);

      // Gold perimeter rim on each cash packet
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.46), goldMat);
      rim.position.y = 0.08;
      pGroup.add(rim);

      pGroup.position.set(-4.6 + c * 1.35, 1.0, 0);
      currencyStreamGroup.add(pGroup);
      packetMeshes.push(pGroup);
    }

    // ── LUMP_SUM_END Deferral Shield (Translucent Protective Canopy for Days 1–99) ──
    const shieldGeo = new THREE.BoxGeometry(9.4, 2.3, 3.25);
    const deferralShield = new THREE.Mesh(shieldGeo, purpleShieldMat);
    deferralShield.position.set(-1.15, 1.85, 0);
    deferralShield.visible = false;
    highwayGroup.add(deferralShield);
    deferralShieldRef.current = deferralShield;

    // ── Day 100 Grand Maturity Treasury Vault (Appears at Portal 5) ──
    const maturityVaultGroup = new THREE.Group();
    maturityVaultGroup.position.set(4.6, 0.8, 0);
    highwayGroup.add(maturityVaultGroup);
    maturityVaultRef.current = maturityVaultGroup;

    const mVaultPed = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.4, 24), goldMat);
    mVaultPed.position.y = 0.2;
    maturityVaultGroup.add(mVaultPed);

    const mStackGeo = new THREE.BoxGeometry(1.6, 1.2, 1.0);
    const mStack = new THREE.Mesh(mStackGeo, cashGreenMat);
    mStack.position.y = 0.95;
    mStack.castShadow = true;
    maturityVaultGroup.add(mStack);

    // Rotating Gyroscope Rings on Grand Maturity Vault
    const ringsGroup = new THREE.Group();
    ringsGroup.position.set(0, 1.0, 0);
    maturityVaultGroup.add(ringsGroup);
    maturityRingsRef.current = ringsGroup;

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.04, 12, 32), goldMat);
    ringsGroup.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.04, 12, 32), neonCyanMat);
    ring2.rotation.x = Math.PI / 2;
    ringsGroup.add(ring2);

    // Gold Bullion on Top
    const goldBar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.55), goldMat);
    goldBar.position.set(0, 1.8, 0);
    maturityVaultGroup.add(goldBar);

    // Day 100 Zenith Victory Beam
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.45, 6.5, 16);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x8B5CF6,
      emissive: 0x7C3AED,
      emissiveIntensity: 2.8,
      transparent: true,
      opacity: 0.88,
    });
    const day100Beam = new THREE.Mesh(beamGeo, beamMat);
    day100Beam.position.set(4.6, 4.2, 0);
    day100Beam.visible = false;
    highwayGroup.add(day100Beam);
    day100BeamRef.current = day100Beam;

    /* ── 9. RIGHT SECTOR: CRAFTED INSTITUTIONAL BANK SKYSCRAPER & VAULT ── */
    const bankGroup = new THREE.Group();
    bankGroup.position.set(9.2, 0, 0);
    campusGroup.add(bankGroup);

    // Bank Terrace Base with Entrance Plaza
    const bBase = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.35, 7.4), whiteFacadeMat);
    bBase.position.y = 0.18;
    bBase.receiveShadow = true;
    bankGroup.add(bBase);

    // Lower Corporate Banking Podium
    const bLower = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.8, 6.0), platinumBodyMat);
    bLower.position.set(0, 2.2, 0);
    bLower.castShadow = true;
    bLower.receiveShadow = true;
    bankGroup.add(bLower);

    // Corporate Podium Front Colonnade Pillars
    const bPillarGeo = new THREE.BoxGeometry(0.32, 3.8, 0.32);
    [-2.8, -1.0, 1.0, 2.8].forEach((px) => {
      const pMesh = new THREE.Mesh(bPillarGeo, warmLimestoneMat);
      pMesh.position.set(px, 2.2, 3.1);
      bankGroup.add(pMesh);
    });

    // Entrance Glass Canopy
    const bCanopy = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 3.4), royalBlueMat);
    bCanopy.position.set(-3.3, 2.8, 0);
    bankGroup.add(bCanopy);

    // Multi-tier Curtain Glass Skyscraper Tower (Executive Offices)
    const bTower = new THREE.Mesh(new THREE.BoxGeometry(5.0, 4.2, 4.8), darkGlassMat);
    bTower.position.set(0, 6.2, 0);
    bTower.castShadow = true;
    bankGroup.add(bTower);

    // Floor-to-Floor Horizontal Aluminum Mullions (8 Storey Appearance)
    const floorMullionGeo = new THREE.BoxGeometry(5.1, 0.08, 4.9);
    for (let fl = 0; fl < 5; fl++) {
      const flMesh = new THREE.Mesh(floorMullionGeo, platinumBodyMat);
      flMesh.position.set(0, 4.5 + fl * 0.85, 0);
      bankGroup.add(flMesh);
    }

    // Corner Structural Columns
    const colGeo = new THREE.BoxGeometry(0.24, 4.2, 0.24);
    [
      { x: -2.4, z: -2.3 },
      { x: 2.4, z: -2.3 },
      { x: -2.4, z: 2.3 },
      { x: 2.4, z: 2.3 },
    ].forEach((pos) => {
      const col = new THREE.Mesh(colGeo, navyBrandMat);
      col.position.set(pos.x, 6.2, pos.z);
      bankGroup.add(col);
    });

    // Rooftop Penthouse & Crest
    const bRoof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 5.2), navyBrandMat);
    bRoof.position.set(0, 8.4, 0);
    bankGroup.add(bRoof);

    // Rooftop Penthouse Box
    const bPenthouse = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 3.4), platinumBodyMat);
    bPenthouse.position.set(0, 9.0, 0);
    bankGroup.add(bPenthouse);

    // Rooftop Telecommunication Mast & Spire with Blinking Beacon
    const bFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 1.8, 16), goldMat);
    bFinial.position.set(0, 10.4, 0);
    bankGroup.add(bFinial);

    const bBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), neonCyanMat);
    bBeacon.position.set(0, 11.35, 0);
    bankGroup.add(bBeacon);
    beaconLightRef.current = bBeacon;

    // Ground Floor Vault Safe Door with Dual Counter-Rotating Gears
    const vRim = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.15, 16, 36), goldMat);
    vRim.position.set(-3.22, 1.8, 0);
    vRim.rotation.y = Math.PI / 2;
    bankGroup.add(vRim);

    const vWheelGroup = new THREE.Group();
    vWheelGroup.position.set(-3.24, 1.8, 0);
    vWheelGroup.rotation.y = Math.PI / 2;
    bankGroup.add(vWheelGroup);
    vaultOuterWheelRef.current = vWheelGroup;

    for (let s = 0; s < 4; s++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8), goldMat);
      spoke.rotation.z = (s * Math.PI) / 4;
      vWheelGroup.add(spoke);
    }
    const vCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.24, 16), navyBrandMat);
    vCenter.rotation.x = Math.PI / 2;
    vWheelGroup.add(vCenter);

    // Inner counter-rotating gold gear disc
    const vInner = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.14, 16), goldMat);
    vInner.position.set(-3.26, 1.8, 0);
    vInner.rotation.z = Math.PI / 2;
    bankGroup.add(vInner);
    vaultInnerWheelRef.current = vInner;

    /* ── 10. AMBIENT PARTICLE DUST SYSTEM ── */
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 36;
      particlePositions[i + 1] = Math.random() * 15 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 24;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    /* ── 11. POINTER / RAYCASTER EVENTS ── */
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
          6,
          26
        );
        targetCamPosRef.current.x = Math.sin(orbitAngleRef.current) * orbitRadiusRef.current;
        targetCamPosRef.current.z = Math.cos(orbitAngleRef.current) * orbitRadiusRef.current;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }

      raycaster.setFromCamera(mouseVector, camera);
      const interactivePortals = portals.map((p) => p.beacon);
      const hits = raycaster.intersectObjects(interactivePortals);

      if (hits.length > 0) {
        const hitBeacon = hits[0].object;
        const matched = portals.find((p) => p.beacon === hitBeacon);
        if (matched) {
          const isNormal = isNormalModeRef.current;
          const info = isNormal
            ? `Milestone Day ${matched.dayNum}: Equal Installment Flow Active (₹125.00/day)`
            : matched.dayNum === 100
            ? `Maturity Day 100: Full Principal + Interest Recovery (₹12,500.00 Settle)`
            : `Milestone Day ${matched.dayNum}: Capital Retained in Business (₹0.00 Due)`;
          setHoveredInfo(info);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      } else {
        setHoveredInfo(null);
      }
    };

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    /* ── 12. ANIMATION LOOP (HARMONIC PENDULUM WAVE & SCRUBBER) ── */
    let lastTime = performance.now();
    let clock = 0;
    let isVisible = true;
    let dayAccumulator = 1;

    const animate = () => {
      if (!isVisible) {
        animFrameRef.current = null;
        return;
      }
      animFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      clock += delta;

      // Auto-advance day in simulation when playing
      if (isPlayingRef.current) {
        dayAccumulator += delta * 18; // ~5.5 seconds for full 100-day cycle
        if (dayAccumulator > 100) dayAccumulator = 1;
        const currentIntDay = Math.floor(dayAccumulator);
        if (currentIntDay !== simDayRef.current) {
          simDayRef.current = currentIntDay;
          setSimDay(currentIntDay);
        }
      } else {
        dayAccumulator = simDayRef.current;
      }

      const isNormal = isNormalModeRef.current;
      const progress01 = (simDayRef.current - 1) / 99; // 0 to 1

      // Vault wheels counter-rotate continuously
      if (vaultOuterWheelRef.current) {
        vaultOuterWheelRef.current.rotation.z += delta * 0.55;
      }
      if (vaultInnerWheelRef.current) {
        vaultInnerWheelRef.current.rotation.x -= delta * 0.45;
      }

      // Spire beacon blinking
      if (beaconLightRef.current) {
        beaconLightRef.current.scale.setScalar(1 + Math.sin(clock * 6.0) * 0.2);
      }

      // Floating coin above merchant counter (Harmonic bobbing)
      if (floatingCoinRef.current) {
        floatingCoinRef.current.rotation.y += delta * 2.2;
        floatingCoinRef.current.position.y = 2.65 + Math.sin(clock * 3.2) * 0.08;
      }

      // Ambient particle gentle drift
      if (particlesRef.current) {
        particlesRef.current.rotation.y += delta * 0.03;
      }

      // ── NORMAL MODE: Currency packets glide along highway in harmonic wave ──
      if (currencyFlowGroupRef.current) {
        currencyFlowGroupRef.current.visible = isNormal;
        if (isNormal) {
          packetMeshes.forEach((p, idx) => {
            const speed = 0.6;
            // Harmonic wave offset
            const cycleProgress = ((clock * speed + idx * 0.125) % 1);
            p.position.x = -4.6 + cycleProgress * 9.2;
            p.position.y = 0.95 + Math.sin(cycleProgress * Math.PI) * 0.42;
            p.rotation.z = Math.sin(cycleProgress * Math.PI * 2) * 0.12;
            p.visible = true;
          });
        }
      }

      // ── BULLET MODE: Deferral Shield & Day 100 Maturity Vault ──
      if (deferralShieldRef.current) {
        deferralShieldRef.current.visible = !isNormal;
        if (!isNormal) {
          deferralShieldRef.current.position.y = 1.85 + Math.sin(clock * 2.8) * 0.05;
        }
      }
      if (maturityVaultRef.current) {
        maturityVaultRef.current.visible = !isNormal;
        if (!isNormal) {
          maturityVaultRef.current.position.y = 0.8 + Math.sin(clock * 3.2) * 0.06;
        }
      }
      if (maturityRingsRef.current) {
        maturityRingsRef.current.rotation.y += delta * 1.6;
        maturityRingsRef.current.rotation.x += delta * 0.9;
      }
      if (day100BeamRef.current) {
        day100BeamRef.current.visible = !isNormal;
        if (!isNormal) {
          day100BeamRef.current.rotation.y += delta * 1.5;
        }
      }

      // Merchant inventory crates dynamic vitality in BULLET MODE
      inventoryBoxes.forEach((crate, i) => {
        if (!isNormal) {
          crate.position.y = cratePositions[i].y + Math.sin(clock * 3.2 + i) * 0.04;
        } else {
          crate.position.y = cratePositions[i].y;
        }
      });

      // Update 5 Milestone Portals based on day progress
      portals.forEach((p) => {
        const isPastMilestone = simDayRef.current >= p.dayNum;
        if (isNormal) {
          p.beaconMat.color.setHex(isPastMilestone ? 0x10B981 : 0x64748B);
          p.beaconMat.emissive.setHex(isPastMilestone ? 0x059669 : 0x334155);
          p.beaconMat.emissiveIntensity = isPastMilestone ? 1.4 + Math.sin(clock * 4.0 + p.dayNum) * 0.35 : 0.2;
        } else {
          p.beaconMat.color.setHex(p.dayNum === 100 ? 0xF59E0B : isPastMilestone ? 0x8B5CF6 : 0x64748B);
          p.beaconMat.emissive.setHex(p.dayNum === 100 ? 0xD97706 : isPastMilestone ? 0x7C3AED : 0x334155);
          p.beaconMat.emissiveIntensity = p.dayNum === 100 ? 1.8 + Math.sin(clock * 5.0) * 0.5 : 0.6;
        }
        p.beacon.rotation.y += delta * 1.6;
      });

      // Camera gentle ambient auto-orbit when idle
      if (!isDraggingRef.current && isAutoOrbitRef.current && activeCamPreset === 'all') {
        orbitAngleRef.current += delta * 0.08;
        targetCamPosRef.current.x = Math.sin(orbitAngleRef.current) * orbitRadiusRef.current;
        targetCamPosRef.current.z = Math.cos(orbitAngleRef.current) * orbitRadiusRef.current;
      }

      currentCamPosRef.current.lerp(targetCamPosRef.current, 0.06);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.06);
      camera.position.copy(currentCamPosRef.current);
      camera.lookAt(currentLookAtRef.current);

      renderer.render(scene, camera);
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible && !animFrameRef.current) {
          lastTime = performance.now();
          animate();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    animate();

    /* ── RESIZE HANDLER ── */
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
      intersectionObserver.disconnect();
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [activeCamPreset]);

  const isNormal = mode === 'NORMAL' || mode === 'FIXED';
  const recoveredAmount = isNormal
    ? (simDay * 125).toLocaleString('en-IN')
    : simDay === 100
    ? '12,500'
    : '0 (Deferred)';

  return (
    <div className="collection-stage-3d-wrapper">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="collection-stage-canvas" />

      {/* Top Floating Architectural Status HUD */}
      <div className="collection-stage-header">
        <div className="csh-left">
          <span className={`csh-badge ${isNormal ? 'blue' : 'purple'}`}>
            <span className="csh-pulse" />
            {isNormal ? 'ACTIVE 100-DAY AMORTIZATION' : 'BULLET MATURITY DEFERRAL'}
          </span>
          <h4 className="csh-title">
            {isNormal ? 'Equal Daily Installment Flow' : 'End-of-Tenure Lump Sum Settlement'}
          </h4>
          <p className="csh-desc">
            {isNormal
              ? `Day ${simDay}/100: Real-time ₹125/day micro-repayments flowing from shop to vault.`
              : simDay < 100
              ? `Day ${simDay}/100: ₹0.00 daily dues · Capital retained for merchant inventory.`
              : 'Day 100: Final maturity reached · Full ₹12,500.00 settled with 1-click.'}
          </p>
        </div>

        <div className="csh-right">
          <div className="csh-metric-pill">
            <span className="csh-metric-lbl">{isNormal ? 'CUMULATIVE RECOVERED' : 'DAY 100 RECOVERY'}</span>
            <span className={`csh-metric-val ${isNormal ? 'green' : 'purple'}`}>
              ₹{recoveredAmount}
            </span>
            <span className="csh-metric-pct">
              {isNormal ? `Day ${simDay} of 100` : simDay === 100 ? 'Full Settle Cleared' : 'Deferred Days 1–99'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Floating Master Console Dock (With Day Scrubber & Camera Presets) */}
      <div className="collection-master-dock">
        <div className="dock-views-group">
          <button
            type="button"
            className={`coll-view-btn ${activeCamPreset === 'all' ? 'active' : ''}`}
            onClick={() => setCamView('all')}
          >
            <Eye size={13} />
            <span>Full Campus</span>
          </button>
          <button
            type="button"
            className={`coll-view-btn ${activeCamPreset === 'merchant' ? 'active' : ''}`}
            onClick={() => setCamView('merchant')}
          >
            <Store size={13} />
            <span>Merchant POS</span>
          </button>
          <button
            type="button"
            className={`coll-view-btn ${activeCamPreset === 'track' ? 'active' : ''}`}
            onClick={() => setCamView('track')}
          >
            <Milestone size={13} />
            <span>100-Day Track</span>
          </button>
          <button
            type="button"
            className={`coll-view-btn ${activeCamPreset === 'vault' ? 'active' : ''}`}
            onClick={() => setCamView('vault')}
          >
            <Building2 size={13} />
            <span>Bank Vault</span>
          </button>
        </div>

        <div className="dock-divider" />

        {/* 100-Day Simulation Scrubber / Pendulum Controller */}
        <div className="dock-scrubber-group">
          <button
            type="button"
            className={`dock-ctrl-btn ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>

          <div className="scrubber-slider-wrap">
            <input
              type="range"
              min="1"
              max="100"
              value={simDay}
              onChange={(e) => handleDayChange(Number(e.target.value))}
              className="dock-day-slider"
            />
            <span className="dock-day-label">D-{String(simDay).padStart(2, '0')}</span>
          </div>

          <button
            type="button"
            className="dock-ctrl-btn"
            onClick={resetSimulation}
            title="Reset to Day 1"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <div className="dock-divider" />

        <button
          type="button"
          className={`coll-orbit-btn ${isAutoOrbit ? 'active' : ''}`}
          onClick={toggleAutoOrbit}
          title={isAutoOrbit ? 'Pause Orbit' : 'Resume Auto Orbit'}
        >
          <RotateCw size={13} className={isAutoOrbit ? 'spinning-slow' : ''} />
        </button>
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
