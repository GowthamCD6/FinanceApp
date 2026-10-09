import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw, Sparkles, Building2, Store, Milestone } from 'lucide-react';
import './ThreeCollectionDemo.css';

/**
 * ThreeCollectionDemo: Realistic 3D Architectural Financial Settlement Campus
 * Upgraded with radiant daylight rendering, ambient particle dust, glowing energy circuits,
 * parabolic bouncing cash stream, interactive camera presets, and raycasting tooltips.
 */
export const ThreeCollectionDemo = ({ mode = 'NORMAL', onModeChange }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);

  // Dynamic mesh & node references
  const vaultWheelRef = useRef(null);
  const vaultInnerRingRef = useRef(null);
  const currencyFlowGroupRef = useRef(null);
  const deferralShieldRef = useRef(null);
  const maturityVaultRef = useRef(null);
  const day100BeamRef = useRef(null);
  const floatingCoinRef = useRef(null);
  const portalsRef = useRef([]);
  const merchantInventoryRef = useRef([]);
  const particlesRef = useRef(null);

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
  const targetCamPosRef = useRef(new THREE.Vector3(22, 16, 23));
  const currentCamPosRef = useRef(new THREE.Vector3(22, 16, 23));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 1.8, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 1.8, 0));
  const orbitAngleRef = useRef(0.82);
  const orbitRadiusRef = useRef(27);

  // Pointer drag tracking
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Camera Presets
  const setCamView = useCallback((preset) => {
    setActiveCamPreset(preset);
    if (preset === 'all') {
      targetCamPosRef.current.set(22, 16, 23);
      targetLookAtRef.current.set(0, 1.8, 0);
      orbitRadiusRef.current = 27;
      isAutoOrbitRef.current = true;
      setIsAutoOrbit(true);
    } else if (preset === 'merchant') {
      targetCamPosRef.current.set(-10, 8, 12);
      targetLookAtRef.current.set(-9.2, 2.0, 0);
      isAutoOrbitRef.current = false;
      setIsAutoOrbit(false);
    } else if (preset === 'track') {
      targetCamPosRef.current.set(0, 11, 19);
      targetLookAtRef.current.set(0, 1.4, 0);
      isAutoOrbitRef.current = false;
      setIsAutoOrbit(false);
    } else if (preset === 'vault') {
      targetCamPosRef.current.set(10, 9, 13);
      targetLookAtRef.current.set(9.2, 2.8, 0);
      isAutoOrbitRef.current = false;
      setIsAutoOrbit(false);
    }
  }, []);

  const toggleAutoOrbit = () => {
    const nextVal = !isAutoOrbit;
    setIsAutoOrbit(nextVal);
    isAutoOrbitRef.current = nextVal;
  };

  /* ── Three.js Scene Setup ── */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 560;

    /* ── 1. SCENE ── */
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xF8FAFC);
    scene.fog = new THREE.FogExp2(0xF8FAFC, 0.012);

    /* ── 2. CAMERA ── */
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 500);
    camera.position.set(22, 16, 23);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 1.35);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(26, 38, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -22;
    scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0xE0F2FE, 1.1);
    skyFillLight.position.set(-24, 20, -18);
    scene.add(skyFillLight);

    const centerWarmLight = new THREE.PointLight(0xF59E0B, 1.8, 30);
    centerWarmLight.position.set(0, 5, 2);
    scene.add(centerWarmLight);

    /* ── 5. CURATED ARCHITECTURAL MATERIALS ── */
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.18,
      metalness: 0.05,
    });
    const whiteFacadeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.14,
      metalness: 0.06,
    });
    const platinumBodyMat = new THREE.MeshStandardMaterial({
      color: 0xEEF2F6,
      roughness: 0.22,
      metalness: 0.25,
    });
    const navyBrandMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.25,
      metalness: 0.35,
    });
    const royalBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1D4ED8,
      roughness: 0.2,
      metalness: 0.45,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: 0xD97706,
      emissiveIntensity: 0.28,
      roughness: 0.16,
      metalness: 0.78,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xE0F2FE,
      transparent: true,
      opacity: 0.45,
      roughness: 0.08,
      metalness: 0.3,
    });
    const highwayDeckMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.35,
      metalness: 0.2,
    });
    const purpleShieldMat = new THREE.MeshStandardMaterial({
      color: 0x8B5CF6,
      emissive: 0x7C3AED,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
    });
    const cashGreenMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.15,
    });

    /* ── 6. CAMPUS ROOT GROUP ── */
    const campusGroup = new THREE.Group();
    campusGroup.scale.set(0.72, 0.72, 0.72);
    campusGroup.position.set(0, -0.4, 0);
    scene.add(campusGroup);

    // Main Ground Plinth (Structured Architectural Slab)
    const groundPlinth = new THREE.Mesh(new THREE.BoxGeometry(29.6, 0.7, 18.6), plinthMat);
    groundPlinth.position.y = -0.35;
    groundPlinth.receiveShadow = true;
    campusGroup.add(groundPlinth);

    // Beveled Inlaid 18K Gold Perimeter Trim
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(29.8, 0.12, 18.8), goldMat);
    goldTrim.position.y = -0.7;
    campusGroup.add(goldTrim);

    // Decorative Linear Ground Pavers & Glowing Cyan Neon Flow Tracks
    const paverLine1 = new THREE.Mesh(new THREE.BoxGeometry(28.4, 0.02, 0.15), royalBlueMat);
    paverLine1.position.set(0, 0.01, -4.5);
    campusGroup.add(paverLine1);

    const paverLine2 = new THREE.Mesh(new THREE.BoxGeometry(28.4, 0.02, 0.15), royalBlueMat);
    paverLine2.position.set(0, 0.01, 4.5);
    campusGroup.add(paverLine2);

    // Central Radiant Energy Circuit Line on Ground
    const circuitGeo = new THREE.BoxGeometry(20, 0.02, 0.08);
    const circuitMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x0284C7,
      emissiveIntensity: 1.4,
    });
    const circuit = new THREE.Mesh(circuitGeo, circuitMat);
    circuit.position.set(0, 0.02, 0);
    campusGroup.add(circuit);

    /* ── 7. LEFT SECTOR: MERCHANT STOREFRONT & SMART POS KIOSK ── */
    const merchantGroup = new THREE.Group();
    merchantGroup.position.set(-9.2, 0, 0);
    campusGroup.add(merchantGroup);

    // Merchant Terrace Base
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 6.8), whiteFacadeMat);
    mBase.position.y = 0.18;
    mBase.receiveShadow = true;
    merchantGroup.add(mBase);

    // Store Building Body (Contemporary Commercial Retail Kiosk)
    const mBuilding = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.4, 5.2), navyBrandMat);
    mBuilding.position.set(0, 2.5, -0.3);
    mBuilding.castShadow = true;
    mBuilding.receiveShadow = true;
    merchantGroup.add(mBuilding);

    // Front Display Glass Window
    const mWindow = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.6, 0.15), glassMat);
    mWindow.position.set(0, 2.1, 2.32);
    merchantGroup.add(mWindow);

    // Architectural Slanted Canopy / Awning
    const mCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.22, 2.2), royalBlueMat);
    mCanopy.position.set(0, 3.65, 2.1);
    mCanopy.rotation.x = 0.12;
    mCanopy.castShadow = true;
    merchantGroup.add(mCanopy);

    // Service Counter Table
    const mCounter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 1.2), platinumBodyMat);
    mCounter.position.set(0, 0.9, 2.5);
    mCounter.castShadow = true;
    merchantGroup.add(mCounter);

    // Smart POS Terminal (Doorstep Agent Mobile Terminal)
    const posBase = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.5), navyBrandMat);
    posBase.position.set(-0.6, 1.5, 2.5);
    merchantGroup.add(posBase);

    const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.08), royalBlueMat);
    posScreen.position.set(-0.6, 1.75, 2.45);
    posScreen.rotation.x = -0.35;
    merchantGroup.add(posScreen);

    // Floating Glowing 3D Gold Currency Token over the POS Counter
    const coinGroup = new THREE.Group();
    coinGroup.position.set(-0.6, 2.45, 2.5);
    merchantGroup.add(coinGroup);
    floatingCoinRef.current = coinGroup;

    const coinMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24),
      goldMat
    );
    coinMesh.rotation.x = Math.PI / 2;
    coinGroup.add(coinMesh);

    // Inventory Crates (Symbolizing wholesale stock funded by the advance)
    const inventoryBoxes = [];
    const crateGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const cratePositions = [
      { x: 1.8, y: 0.72, z: 2.3, r: 0.1 },
      { x: 1.8, y: 1.47, z: 2.3, r: -0.15 },
      { x: 1.1, y: 0.72, z: 2.3, r: 0.25 },
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

    // Main Elevated Highway Deck (Grounded & Linear)
    const deckGeo = new THREE.BoxGeometry(11.8, 0.35, 3.4);
    const deck = new THREE.Mesh(deckGeo, highwayDeckMat);
    deck.position.set(0, 0.65, 0);
    deck.receiveShadow = true;
    highwayGroup.add(deck);

    // Highway Guardrails with Blue Neon Edge
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.12, 0.12), royalBlueMat);
    rail1.position.set(0, 0.9, -1.65);
    highwayGroup.add(rail1);

    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.12, 0.12), royalBlueMat);
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
      const pylonGeo = new THREE.BoxGeometry(0.18, 2.2, 0.24);
      const pLeft = new THREE.Mesh(pylonGeo, platinumBodyMat);
      pLeft.position.set(0, 1.1, -1.5);
      pGroup.add(pLeft);

      const pRight = new THREE.Mesh(pylonGeo, platinumBodyMat);
      pRight.position.set(0, 1.1, 1.5);
      pGroup.add(pRight);

      // Arch Header Lintel
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 3.25), platinumBodyMat);
      lintel.position.set(0, 2.25, 0);
      pGroup.add(lintel);

      // Milestone Status Jewel Beacon (Glows when day is reached)
      const beaconGeo = new THREE.OctahedronGeometry(0.22);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x10B981,
        emissive: 0x059669,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 2.62, 0);
      pGroup.add(beacon);

      portals.push({
        group: pGroup,
        dayNum: milestoneDays[idx],
        beacon,
        beaconMat,
      });
    });
    portalsRef.current = portals;

    // Moving Currency Pulse Stream (Active in NORMAL Mode)
    const currencyStreamGroup = new THREE.Group();
    highwayGroup.add(currencyStreamGroup);
    currencyFlowGroupRef.current = currencyStreamGroup;

    const packetMeshes = [];
    const packetGeo = new THREE.BoxGeometry(0.65, 0.18, 0.4);
    for (let c = 0; c < 7; c++) {
      const pGroup = new THREE.Group();
      const pMesh = new THREE.Mesh(packetGeo, cashGreenMat);
      pMesh.castShadow = true;
      pGroup.add(pMesh);

      // Gold perimeter rim on each cash packet
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.43), goldMat);
      rim.position.y = 0.08;
      pGroup.add(rim);

      pGroup.position.set(-4.5 + c * 1.5, 1.0, 0);
      currencyStreamGroup.add(pGroup);
      packetMeshes.push(pGroup);
    }

    // ── LUMP_SUM_END Deferral Shield (Translucent Protective Canopy for Days 1–99) ──
    const shieldGeo = new THREE.BoxGeometry(9.4, 2.2, 3.2);
    const deferralShield = new THREE.Mesh(shieldGeo, purpleShieldMat);
    deferralShield.position.set(-1.15, 1.8, 0);
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

    // Gold Bullion on Top
    const goldBar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.5), goldMat);
    goldBar.position.set(0, 1.7, 0);
    maturityVaultGroup.add(goldBar);

    // Day 100 Zenith Victory Beam
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.45, 6.0, 16);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x8B5CF6,
      emissive: 0x7C3AED,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.85,
    });
    const day100Beam = new THREE.Mesh(beamGeo, beamMat);
    day100Beam.position.set(4.6, 4.0, 0);
    day100Beam.visible = false;
    highwayGroup.add(day100Beam);
    day100BeamRef.current = day100Beam;

    /* ── 9. RIGHT SECTOR: INSTITUTIONAL BANK HEADQUARTERS & CENTRAL VAULT ── */
    const bankGroup = new THREE.Group();
    bankGroup.position.set(9.2, 0, 0);
    campusGroup.add(bankGroup);

    // Bank Terrace Base
    const bBase = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 6.8), whiteFacadeMat);
    bBase.position.y = 0.18;
    bBase.receiveShadow = true;
    bankGroup.add(bBase);

    // Lower Corporate Banking Hall
    const bLower = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.8, 5.6), platinumBodyMat);
    bLower.position.set(0, 2.2, 0);
    bLower.castShadow = true;
    bLower.receiveShadow = true;
    bankGroup.add(bLower);

    // Upper Executive Glass Skyscraper Tower
    const bTower = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.4, 4.4), glassMat);
    bTower.position.set(0, 5.8, 0);
    bTower.castShadow = true;
    bankGroup.add(bTower);

    // Roof Cornice & Architectural Crest
    const bRoof = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.25, 4.8), navyBrandMat);
    bRoof.position.set(0, 7.6, 0);
    bankGroup.add(bRoof);

    const bFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 12), goldMat);
    bFinial.position.set(0, 8.1, 0);
    bankGroup.add(bFinial);

    // Ground Floor Vault Safe Door
    const vRim = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 16, 32), goldMat);
    vRim.position.set(-2.82, 1.8, 0);
    vRim.rotation.y = Math.PI / 2;
    bankGroup.add(vRim);

    const vWheelGroup = new THREE.Group();
    vWheelGroup.position.set(-2.84, 1.8, 0);
    vWheelGroup.rotation.y = Math.PI / 2;
    bankGroup.add(vWheelGroup);
    vaultWheelRef.current = vWheelGroup;

    for (let s = 0; s < 4; s++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), goldMat);
      spoke.rotation.z = (s * Math.PI) / 4;
      vWheelGroup.add(spoke);
    }
    const vCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16), navyBrandMat);
    vCenter.rotation.x = Math.PI / 2;
    vWheelGroup.add(vCenter);

    /* ── 10. AMBIENT PARTICLE DUST SYSTEM ── */
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 32;
      particlePositions[i + 1] = Math.random() * 12 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
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

    /* ── 12. ANIMATION LOOP (NATIVE PERFORMANCE DELTA) ── */
    let lastTime = performance.now();
    let clock = 0;
    let isVisible = true;

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

      const isNormal = isNormalModeRef.current;

      // Vault wheel rotates continuously
      if (vaultWheelRef.current) {
        vaultWheelRef.current.rotation.z += delta * 0.6;
      }

      // Floating coin above merchant counter
      if (floatingCoinRef.current) {
        floatingCoinRef.current.rotation.y += delta * 1.8;
        floatingCoinRef.current.position.y = 2.45 + Math.sin(clock * 3.0) * 0.08;
      }

      // Ambient particle gentle drift
      if (particlesRef.current) {
        particlesRef.current.rotation.y += delta * 0.03;
      }

      // ── NORMAL MODE: Currency packets glide along highway in parabolic wave ──
      if (currencyFlowGroupRef.current) {
        currencyFlowGroupRef.current.visible = isNormal;
        if (isNormal) {
          packetMeshes.forEach((p, idx) => {
            const speed = 0.55;
            const cycleProgress = ((clock * speed + idx * 0.16) % 1);
            p.position.x = -4.6 + cycleProgress * 9.2;
            // Parabolic bouncy wave
            p.position.y = 0.95 + Math.sin(cycleProgress * Math.PI) * 0.35;
            p.rotation.z = Math.sin(cycleProgress * Math.PI * 2) * 0.08;
            p.visible = true;
          });
        }
      }

      // ── BULLET MODE: Deferral Shield & Day 100 Maturity Vault ──
      if (deferralShieldRef.current) {
        deferralShieldRef.current.visible = !isNormal;
        if (!isNormal) {
          deferralShieldRef.current.position.y = 1.8 + Math.sin(clock * 2.5) * 0.04;
        }
      }
      if (maturityVaultRef.current) {
        maturityVaultRef.current.visible = !isNormal;
        if (!isNormal) {
          maturityVaultRef.current.position.y = 0.8 + Math.sin(clock * 3.2) * 0.06;
          maturityVaultRef.current.rotation.y += delta * 0.4;
        }
      }
      if (day100BeamRef.current) {
        day100BeamRef.current.visible = !isNormal;
        if (!isNormal) {
          day100BeamRef.current.rotation.y += delta * 1.2;
        }
      }

      // Update 5 Milestone Portals based on mode
      portals.forEach((p) => {
        if (isNormal) {
          p.beaconMat.color.setHex(0x10B981);
          p.beaconMat.emissive.setHex(0x059669);
          p.beaconMat.emissiveIntensity = 1.2 + Math.sin(clock * 4.0 + p.dayNum) * 0.3;
        } else {
          p.beaconMat.color.setHex(p.dayNum === 100 ? 0xF59E0B : 0x8B5CF6);
          p.beaconMat.emissive.setHex(p.dayNum === 100 ? 0xD97706 : 0x7C3AED);
          p.beaconMat.emissiveIntensity = 1.4 + Math.sin(clock * 4.0 + p.dayNum) * 0.4;
        }
        p.beacon.rotation.y += delta * 1.5;
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

  return (
    <div className="collection-stage-3d-wrapper">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="collection-stage-canvas" />

      {/* Top Floating Status Overlay */}
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
              ? 'Real-time ₹125/day micro-repayment cycle from shop counter to central vault.'
              : 'Zero daily pressure (Days 1–99) · Full settlement collected at Day 100 maturity.'}
          </p>
        </div>

        <div className="csh-right">
          <div className="csh-metric-pill">
            <span className="csh-metric-lbl">{isNormal ? 'DAILY DUES' : 'DAY 100 MATURITY'}</span>
            <span className={`csh-metric-val ${isNormal ? 'green' : 'purple'}`}>
              {isNormal ? '₹125.00 / day' : '₹12,500.00'}
            </span>
            <span className="csh-metric-pct">{isNormal ? '100 Operating Days' : 'Full Settle at Last Date'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Camera Dock */}
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

        <button
          type="button"
          className={`coll-orbit-btn ${isAutoOrbit ? 'active' : ''}`}
          onClick={toggleAutoOrbit}
          title={isAutoOrbit ? 'Pause Orbit' : 'Resume Auto Orbit'}
        >
          <RotateCw size={14} className={isAutoOrbit ? 'spinning-slow' : ''} />
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
