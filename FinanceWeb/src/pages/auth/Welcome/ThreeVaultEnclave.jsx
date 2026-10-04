import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  Lock,
  Layers,
  Building2,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import './ThreeVaultEnclave.css';

/**
 * ThreeVaultEnclave: Realistic Architectural Financial Campus with Curved Structures
 * Featuring:
 * 1. Central Banking Rotunda: Curved colonnade, tiered marble terrace, glass atrium & dome, precision steel vault safe.
 * 2. Branch Banking Pavilion: Sweeping curved glass facade, cantilevered canopy, teller desk, and branch safe alcove.
 * 3. Merchant Route Terminal: Curved architectural wing canopy, circular sweep kiosk pods.
 * 4. Chit Syndicate Treasury Tower: Tiered curved cylindrical tower with glass observation decks.
 * 5. Curved Architectural Glass Sky-Bridges with flowing cash disbursals & recovery tokens.
 */
export const ThreeVaultEnclave = ({
  selectedScheme = 'DAILY',
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // 3D Model group references
  const vaultSafeGroupRef = useRef(null);
  const vaultWheelRef = useRef(null);
  const cashPacketsRef = useRef([]);
  const yieldBarsRef = useRef({ principal: null, yield: null });
  const targetCamPosRef = useRef(new THREE.Vector3(0, 20, 48));

  // Interactive controls
  const [activeCamPreset, setActiveCamPreset] = useState('all'); // 'all', 'vault', 'merchants', 'branches'
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Ultra-crisp high-DPI text canvas generator for 3D architectural signage
  const makeTextTexture = (title, subtitle = '', tag = 'ENTERPRISE SYSTEM') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');

    // Enable maximum text rasterization quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Deep realistic drop shadow around card
    ctx.shadowColor = 'rgba(8, 13, 43, 0.18)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;

    // Crisp white card background
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(24, 24, 1232, 472, 48);
    ctx.fill();

    // Reset shadow for crisp text & stroke rendering
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    // Subtle inner hairline border for high-end polish
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#F1F5F9';
    ctx.strokeRect(34, 34, 1212, 452);

    // Top Category / Status Badge Pill
    const tagWidth = 340;
    const tagX = (1280 - tagWidth) / 2;
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(tagX, 48, tagWidth, 54, 27);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Status Indicator Dot (Emerald Green)
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(tagX + 32, 75, 8, 0, Math.PI * 2);
    ctx.fill();

    // Tag Text
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 26px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag.toUpperCase(), tagX + 52, 76);

    // Main Architectural Signage Title (Deep navy, maximum contrast)
    ctx.fillStyle = '#080D2B';
    ctx.font = '800 64px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 640, 200);

    // Subtitle in Dedicated Pill Container (Legible & comfortable from any angle)
    if (subtitle) {
      const subWidth = 720;
      const subX = (1280 - subWidth) / 2;
      ctx.fillStyle = '#EFF6FF';
      ctx.beginPath();
      ctx.roundRect(subX, 300, subWidth, 76, 38);
      ctx.fill();
      ctx.strokeStyle = '#BFDBFE';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#1D4ED8';
      ctx.font = '700 36px "Plus Jakarta Sans", "Inter", -apple-system, sans-serif';
      ctx.fillText(subtitle, 640, 339);
    }

    const tex = new THREE.CanvasTexture(canvas);
    // CRITICAL: Disable mipmaps to eliminate distance/tilt blur in WebGL
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 540;

    // 1. Scene setup: Radiant white daylight atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 20, 48);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with soft realistic shadows
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

    // 4. Radiant Daylight Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
    sunLight.position.set(28, 44, 26);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    skyFillLight.position.set(-28, 25, -22);
    scene.add(skyFillLight);

    const topDownLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topDownLight.position.set(0, 48, 0);
    scene.add(topDownLight);

    const vaultAccentLight = new THREE.PointLight(0x38bdf8, 2.8, 36);
    vaultAccentLight.position.set(0, 6.5, 0);
    scene.add(vaultAccentLight);

    // 5. Floor Studio Pedestal
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xfcfdff,
      roughness: 0.55,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // Architectural curved concentric paving rings
    const ringGeo1 = new THREE.RingGeometry(18, 18.3, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x93c5fd, side: THREE.DoubleSide });
    const floorRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    floorRing1.rotation.x = -Math.PI / 2;
    floorRing1.position.y = 0.05;
    scene.add(floorRing1);

    const ringGeo2 = new THREE.RingGeometry(32, 32.35, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xc7d2fe, side: THREE.DoubleSide });
    const floorRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    floorRing2.rotation.x = -Math.PI / 2;
    floorRing2.position.y = 0.05;
    scene.add(floorRing2);

    // ================================================================
    // 6. CENTRAL OBJECT: ARCHITECTURAL BANKING ROTUNDA WITH CURVED COLONNADE & DOME
    // ================================================================
    const rotundaGroup = new THREE.Group();
    vaultSafeGroupRef.current = rotundaGroup;
    scene.add(rotundaGroup);

    // 6a. Curved Terraced Marble Steps (Classical Modern Plinth)
    const step1Geo = new THREE.CylinderGeometry(11.4, 11.8, 0.4, 48);
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.25 });
    const step1 = new THREE.Mesh(step1Geo, marbleMat);
    step1.position.y = 0.2;
    step1.receiveShadow = true;
    rotundaGroup.add(step1);

    const step2Geo = new THREE.CylinderGeometry(10.0, 10.4, 0.4, 48);
    const step2 = new THREE.Mesh(step2Geo, marbleMat);
    step2.position.y = 0.6;
    step2.receiveShadow = true;
    rotundaGroup.add(step2);

    const step3Geo = new THREE.CylinderGeometry(8.8, 9.2, 0.5, 48);
    const step3 = new THREE.Mesh(step3Geo, marbleMat);
    step3.position.y = 1.05;
    step3.receiveShadow = true;
    step3.castShadow = true;
    rotundaGroup.add(step3);

    // 6b. Curved Cylindrical Glass Atrium Wall
    const glassGeo = new THREE.CylinderGeometry(6.8, 6.8, 6.4, 48, 1, true);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.28,
      roughness: 0.05,
      metalness: 0.85,
      side: THREE.DoubleSide,
    });
    const glassAtrium = new THREE.Mesh(glassGeo, glassMat);
    glassAtrium.position.y = 4.4;
    rotundaGroup.add(glassAtrium);

    // 6c. Curved Architectural Colonnade (8 Majestic Curved Marble Pillars)
    const columnCount = 8;
    const colRadius = 7.6;
    const colGeo = new THREE.CylinderGeometry(0.3, 0.3, 6.4, 16);
    const colCapGeo = new THREE.TorusGeometry(0.38, 0.08, 12, 24);

    for (let c = 0; c < columnCount; c++) {
      const angle = (c / columnCount) * Math.PI * 2;
      const cx = Math.cos(angle) * colRadius;
      const cz = Math.sin(angle) * colRadius;

      const column = new THREE.Mesh(colGeo, marbleMat);
      column.position.set(cx, 4.4, cz);
      column.castShadow = true;
      rotundaGroup.add(column);

      // Base cap
      const baseCap = new THREE.Mesh(colCapGeo, marbleMat);
      baseCap.rotation.x = Math.PI / 2;
      baseCap.position.set(cx, 1.3, cz);
      rotundaGroup.add(baseCap);

      // Top capital
      const topCap = new THREE.Mesh(colCapGeo, marbleMat);
      topCap.rotation.x = Math.PI / 2;
      topCap.position.set(cx, 7.5, cz);
      rotundaGroup.add(topCap);
    }

    // 6d. Overhanging Curved Cornice & Entablature Ring
    const corniceGeo = new THREE.TorusGeometry(7.8, 0.42, 16, 48);
    const corniceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 });
    const cornice = new THREE.Mesh(corniceGeo, corniceMat);
    cornice.rotation.x = Math.PI / 2;
    cornice.position.y = 7.6;
    cornice.castShadow = true;
    rotundaGroup.add(cornice);

    // Upper Roof Ring
    const roofRingGeo = new THREE.CylinderGeometry(7.2, 7.8, 0.6, 48);
    const roofRing = new THREE.Mesh(roofRingGeo, marbleMat);
    roofRing.position.y = 8.0;
    roofRing.castShadow = true;
    rotundaGroup.add(roofRing);

    // 6e. Curved Transparent Glass Skylight Dome
    const domeGeo = new THREE.SphereGeometry(6.6, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.42);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.9,
      side: THREE.DoubleSide,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 8.0;
    rotundaGroup.add(dome);

    // Crown Finial Ring atop Dome
    const crownGeo = new THREE.TorusGeometry(1.4, 0.16, 16, 32);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 10.8;
    rotundaGroup.add(crown);

    // 6f. Central Bank Vault Safe (Inside Rotunda)
    const vaultBodyGeo = new THREE.CylinderGeometry(4.2, 4.2, 3.4, 36);
    const vaultBodyMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.16,
      metalness: 0.88,
    });
    const vaultBody = new THREE.Mesh(vaultBodyGeo, vaultBodyMat);
    vaultBody.position.y = 3.0;
    vaultBody.castShadow = true;
    rotundaGroup.add(vaultBody);

    // Heavy Chrome Vault Rim
    const rimGeo = new THREE.TorusGeometry(4.0, 0.35, 16, 36);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcfd8e3, roughness: 0.1, metalness: 0.95 });
    const vaultRim = new THREE.Mesh(rimGeo, rimMat);
    vaultRim.rotation.x = Math.PI / 2;
    vaultRim.position.y = 4.7;
    rotundaGroup.add(vaultRim);

    // Perimeter locking bolts
    const boltCount = 10;
    for (let b = 0; b < boltCount; b++) {
      const angle = (b / boltCount) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.5, 12);
      const boltMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.08 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(Math.cos(angle) * 4.0, 4.8, Math.sin(angle) * 4.0);
      rotundaGroup.add(bolt);
    }

    // Precision Gold Combination Wheel
    const wheelGroup = new THREE.Group();
    vaultWheelRef.current = wheelGroup;
    wheelGroup.position.set(0, 4.8, 0);
    rotundaGroup.add(wheelGroup);

    const wheelRimGeo = new THREE.TorusGeometry(2.2, 0.22, 16, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      metalness: 0.95,
      roughness: 0.12,
    });
    const wheelRim = new THREE.Mesh(wheelRimGeo, goldMat);
    wheelRim.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelRim);

    for (let s = 0; s < 4; s++) {
      const spokeGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.2, 8);
      const spoke = new THREE.Mesh(spokeGeo, goldMat);
      spoke.rotation.z = Math.PI / 2;
      spoke.rotation.y = (s * Math.PI) / 4;
      wheelGroup.add(spoke);
    }

    // Center Spindle with Luminous Emerald LED
    const spindleGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 24);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.y = 0.18;
    wheelGroup.add(spindle);

    const ledGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const statusLed = new THREE.Mesh(ledGeo, ledMat);
    statusLed.position.y = 0.48;
    wheelGroup.add(statusLed);

    // Gleaming Gold Bullion Ingot Stacks
    const ingotGeo = new THREE.BoxGeometry(1.6, 0.45, 0.75);
    const ingotPositions = [
      { x: -2.6, y: 1.5, z: 1.8, r: 0.2 },
      { x: -2.6, y: 1.95, z: 1.8, r: 0.2 },
      { x: -2.0, y: 1.5, z: 2.6, r: -0.4 },
      { x: 2.4, y: 1.5, z: 2.0, r: 0.5 },
      { x: 2.4, y: 1.95, z: 2.0, r: 0.5 },
    ];
    ingotPositions.forEach((pos) => {
      const ingot = new THREE.Mesh(ingotGeo, goldMat);
      ingot.position.set(pos.x, pos.y, pos.z);
      ingot.rotation.y = pos.r;
      ingot.castShadow = true;
      rotundaGroup.add(ingot);
    });

    // Rotunda Camera-Facing 3D Billboard Sprite (Readable at any angle)
    const vaultLabelTex = makeTextTexture('CENTRAL BANK ROTUNDA', 'Double-Entry Vault Core', 'Core Treasury');
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    // Architectural Mounting Stanchion Pin
    const rotundaPinGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 16);
    const rotundaPin = new THREE.Mesh(rotundaPinGeo, pinMat);
    rotundaPin.position.set(0, 12.5, 0);
    rotundaGroup.add(rotundaPin);

    const labelSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: vaultLabelTex, transparent: true, depthWrite: false })
    );
    labelSprite.scale.set(9.6, 3.9, 1);
    labelSprite.position.set(0, 14.4, 0);
    labelSprite.renderOrder = 999;
    rotundaGroup.add(labelSprite);

    // ================================================================
    // 7. REALISTIC ARCHITECTURAL FINANCIAL STATIONS (HIGH CURVATURE DESIGN)
    // ================================================================
    const pipelines = [];

    const stationConfigs = [
      {
        name: 'Merchant Route Terminal',
        sub: 'Automated Daily Sweep',
        tag: 'Daily 100-Day Route',
        pos: new THREE.Vector3(-25, 0, 10),
        type: 'route',
        pinHeight: 4.6,
        pinY: 6.8,
        labelY: 9.3,
      },
      {
        name: 'Branch Cash Pavilion',
        sub: 'Cash Drawer Safe Alcove',
        tag: 'Branch Liquidity',
        pos: new THREE.Vector3(25, 0, 10),
        type: 'branch',
        pinHeight: 4.6,
        pinY: 6.8,
        labelY: 9.3,
      },
      {
        name: 'Chit Syndicate Tower',
        sub: 'Syndicate Treasury Core',
        tag: 'Auction Pool Vault',
        pos: new THREE.Vector3(0, 0, -23),
        type: 'chit',
        pinHeight: 3.6,
        pinY: 8.2,
        labelY: 10.3,
      },
    ];

    stationConfigs.forEach((st) => {
      const sGroup = new THREE.Group();
      sGroup.position.copy(st.pos);

      // Station Curved Stepped Base Plinth
      const p1Geo = new THREE.CylinderGeometry(6.4, 6.8, 0.45, 36);
      const p1Mesh = new THREE.Mesh(p1Geo, marbleMat);
      p1Mesh.position.y = 0.22;
      p1Mesh.receiveShadow = true;
      sGroup.add(p1Mesh);

      const p2Geo = new THREE.CylinderGeometry(5.4, 5.8, 0.45, 36);
      const p2Mesh = new THREE.Mesh(p2Geo, marbleMat);
      p2Mesh.position.y = 0.65;
      p2Mesh.receiveShadow = true;
      p2Mesh.castShadow = true;
      sGroup.add(p2Mesh);

      if (st.type === 'route') {
        // --- 1. MERCHANT TERMINAL: Curved Airfoil / Wing Canopy Architecture ---
        // Semicircular Curved Service Counter
        const counterGeo = new THREE.CylinderGeometry(3.6, 3.6, 1.8, 36, 1, false, -Math.PI * 0.4, Math.PI * 1.8);
        const counterMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.25, metalness: 0.6 });
        const counter = new THREE.Mesh(counterGeo, counterMat);
        counter.position.y = 1.7;
        counter.castShadow = true;
        sGroup.add(counter);

        // Curved Cantilevered Roof Wing
        const canopyGeo = new THREE.TorusGeometry(4.4, 0.35, 16, 36, Math.PI * 1.5);
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.2 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.rotation.x = Math.PI / 2;
        canopy.position.set(0, 4.2, 0);
        canopy.castShadow = true;
        sGroup.add(canopy);

        // Curved Tensile Glass Shade
        const shadeGeo = new THREE.CylinderGeometry(4.0, 4.0, 0.2, 36, 1, false);
        const shade = new THREE.Mesh(shadeGeo, glassMat);
        shade.position.y = 4.3;
        sGroup.add(shade);

        // Orbiting Curved Kiosk Pods
        for (let m = 0; m < 4; m++) {
          const a = (m / 4) * Math.PI * 2;
          const kGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.2, 16);
          const kMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.2, metalness: 0.5 });
          const kiosk = new THREE.Mesh(kGeo, kMat);
          kiosk.position.set(Math.cos(a) * 4.6, 1.5, Math.sin(a) * 4.6);
          sGroup.add(kiosk);
        }
      } else if (st.type === 'branch') {
        // --- 2. BRANCH CASH PAVILION: Sweeping Curved Glass Facade & Safe Alcove ---
        // Semicircular Curved Glass Rotunda Wall
        const bGlassGeo = new THREE.CylinderGeometry(4.2, 4.2, 3.8, 36, 1, true, -Math.PI * 0.2, Math.PI * 1.4);
        const bGlass = new THREE.Mesh(bGlassGeo, glassMat);
        bGlass.position.y = 2.8;
        sGroup.add(bGlass);

        // Curved Cantilevered Floating Roof Disc with Emerald Ring
        const bRoofGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.5, 36);
        const bRoof = new THREE.Mesh(bRoofGeo, marbleMat);
        bRoof.position.y = 4.8;
        bRoof.castShadow = true;
        sGroup.add(bRoof);

        const bTrimGeo = new THREE.TorusGeometry(4.9, 0.12, 16, 36);
        const bTrimMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.2 });
        const bTrim = new THREE.Mesh(bTrimGeo, bTrimMat);
        bTrim.rotation.x = Math.PI / 2;
        bTrim.position.y = 4.8;
        sGroup.add(bTrim);

        // Physical Branch Safe Alcove inside pavilion
        const bSafeGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.4, 24);
        const bSafeMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.2, metalness: 0.8 });
        const bSafe = new THREE.Mesh(bSafeGeo, bSafeMat);
        bSafe.position.set(0, 2.1, 0.4);
        bSafe.castShadow = true;
        sGroup.add(bSafe);

        // Branch Safe Chrome Wheel
        const bWheelGeo = new THREE.TorusGeometry(0.7, 0.08, 12, 24);
        const bWheelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95 });
        const bWheel = new THREE.Mesh(bWheelGeo, bWheelMat);
        bWheel.position.set(0, 2.2, 2.2);
        sGroup.add(bWheel);
      } else {
        // --- 3. CHIT SYNDICATE: Tiered Cylindrical Curved Tower ---
        const t1Geo = new THREE.CylinderGeometry(3.6, 4.0, 2.2, 32);
        const t1Mat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.6 });
        const t1 = new THREE.Mesh(t1Geo, t1Mat);
        t1.position.y = 2.0;
        t1.castShadow = true;
        sGroup.add(t1);

        // Mid Curved Glass Atrium Collar
        const tGlassGeo = new THREE.CylinderGeometry(3.2, 3.2, 1.8, 32, 1, true);
        const tGlass = new THREE.Mesh(tGlassGeo, glassMat);
        tGlass.position.y = 4.0;
        sGroup.add(tGlass);

        // Upper Observatory Curved Tier
        const t2Geo = new THREE.CylinderGeometry(2.4, 3.4, 1.6, 32);
        const t2 = new THREE.Mesh(t2Geo, marbleMat);
        t2.position.y = 5.6;
        t2.castShadow = true;
        sGroup.add(t2);

        // Golden Curved Spire Ring atop tower
        const tRingGeo = new THREE.TorusGeometry(2.6, 0.16, 16, 32);
        const tRing = new THREE.Mesh(tRingGeo, goldMat);
        tRing.rotation.x = Math.PI / 2;
        tRing.position.y = 6.4;
        sGroup.add(tRing);
      }

      // Station Architectural Mounting Stanchion Pin
      const sPinGeo = new THREE.CylinderGeometry(0.08, 0.08, st.pinHeight, 16);
      const sPin = new THREE.Mesh(sPinGeo, pinMat);
      sPin.position.set(0, st.pinY, 0);
      sGroup.add(sPin);

      // Station Architectural Camera-Facing Billboard Sprite (Clear & Readable at any angle)
      const signTex = makeTextTexture(st.name, st.sub, st.tag);
      const signSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: signTex, transparent: true, depthWrite: false })
      );
      signSprite.scale.set(9.6, 3.9, 1);
      signSprite.position.set(0, st.labelY, 0);
      signSprite.renderOrder = 999;
      sGroup.add(signSprite);

      scene.add(sGroup);

      // --- 8. CURVED ARCHITECTURAL GLASS SKY-BRIDGES ---
      // Elevated curved conduit bridge connecting central rotunda to station
      const midPoint = new THREE.Vector3(st.pos.x * 0.5, 5.2, st.pos.z * 0.5);
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 4.6, 0),
        midPoint,
        new THREE.Vector3(st.pos.x, 3.2, st.pos.z)
      );
      pipelines.push(curve);

      // Outer transparent curved glass sleeve
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.35, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.35,
        roughness: 0.08,
        metalness: 0.85,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);

      // Inner silver transit rail
      const railGeo = new THREE.TubeGeometry(curve, 36, 0.08, 8, false);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.15 });
      const rail = new THREE.Mesh(railGeo, railMat);
      scene.add(rail);
    });

    // ================================================================
    // 9. FLOWING CASH DISBURSAL BLOCKS & RECOVERY TOKENS (Riding Inside Sky-Bridges)
    // ================================================================
    const cashPackets = [];
    const packetGroup = new THREE.Group();
    scene.add(packetGroup);

    pipelines.forEach((curve) => {
      // Disbursal packet (radiant royal blue)
      for (let p = 0; p < 3; p++) {
        const pGeo = new THREE.BoxGeometry(0.75, 0.25, 1.2);
        const pMat = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.65,
          metalness: 0.6,
        });
        const mesh = new THREE.Mesh(pGeo, pMat);
        packetGroup.add(mesh);
        cashPackets.push({
          mesh,
          curve,
          t: p / 3,
          speed: 0.0036,
          dir: 1, // Central Rotunda -> Station
        });
      }

      // Installment recovery packet (radiant emerald)
      for (let r = 0; r < 3; r++) {
        const rGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.22, 16);
        const rMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.75,
          metalness: 0.7,
        });
        const mesh = new THREE.Mesh(rGeo, rMat);
        mesh.rotation.x = Math.PI / 2;
        packetGroup.add(mesh);
        cashPackets.push({
          mesh,
          curve,
          t: 1 - r / 3,
          speed: 0.004,
          dir: -1, // Station -> Central Rotunda
        });
      }
    });

    cashPacketsRef.current = cashPackets;

    // ================================================================
    // 10. CURVED AMORTIZATION YIELD PODIUM
    // ================================================================
    const yieldGroup = new THREE.Group();
    yieldGroup.position.set(-18, 0, -18);
    scene.add(yieldGroup);

    const yPodiumGeo = new THREE.CylinderGeometry(5.4, 5.8, 0.8, 32);
    const yPodium = new THREE.Mesh(yPodiumGeo, marbleMat);
    yPodium.position.y = 0.4;
    yPodium.receiveShadow = true;
    yieldGroup.add(yPodium);

    // Amortization Mounting Stanchion Pin
    const yPinGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.8, 16);
    const yPin = new THREE.Mesh(yPinGeo, pinMat);
    yPin.position.set(0, 5.9, 0);
    yieldGroup.add(yPin);

    // Amortization Camera-Facing Billboard Sprite (Clear at any angle)
    const yLabelTex = makeTextTexture('AMORTIZATION ENGINE', 'Mathematical Yield Model', 'Ledger Analytics');
    const yLabelSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: yLabelTex, transparent: true, depthWrite: false })
    );
    yLabelSprite.scale.set(9.6, 3.9, 1);
    yLabelSprite.position.set(0, 8.0, 0);
    yLabelSprite.renderOrder = 999;
    yieldGroup.add(yLabelSprite);

    // Principal Column
    const b1Geo = new THREE.CylinderGeometry(0.8, 0.8, 4.0, 24);
    const b1Mat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.7, roughness: 0.2 });
    const b1Mesh = new THREE.Mesh(b1Geo, b1Mat);
    b1Mesh.position.set(-1.8, 2.4, 0);
    yieldGroup.add(b1Mesh);

    // Interest Fee Column
    const b2Geo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 24);
    const b2Mat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.15 });
    const b2Mesh = new THREE.Mesh(b2Geo, b2Mat);
    b2Mesh.position.set(1.8, 1.5, 0);
    yieldGroup.add(b2Mesh);

    yieldBarsRef.current = { principal: b1Mesh, yield: b2Mesh };

    // ================================================================
    // 11. MOUSE INTERACTION & DRAG ORBIT
    // ================================================================
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0.35, phi: Math.PI / 2.65, radius: 52 };

    const handlePointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        prevMouse = { x: e.clientX, y: e.clientY };

        spherical.theta -= deltaX * 0.007;
        spherical.phi = Math.max(0.2, Math.min(Math.PI / 2.05, spherical.phi - deltaY * 0.007));

        targetCamPosRef.current.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        targetCamPosRef.current.y = spherical.radius * Math.cos(spherical.phi);
        targetCamPosRef.current.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // ================================================================
    // 12. ANIMATION LOOP
    // ================================================================
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      camera.position.lerp(targetCamPosRef.current, 0.06);
      camera.lookAt(0, 3.5, 0);

      // Rotunda vault combination wheel rotation
      if (vaultWheelRef.current) {
        vaultWheelRef.current.rotation.y += delta * 0.45;
      }

      // Smooth auto-orbit camera
      if (isAutoRotate && !isDragging && activeCamPreset === 'all') {
        spherical.theta += delta * 0.07;
        targetCamPosRef.current.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        targetCamPosRef.current.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      }

      // Advance flowing cash packets inside sky-bridges
      cashPackets.forEach((pkt) => {
        if (pkt.dir === 1) {
          pkt.t = (pkt.t + pkt.speed) % 1;
        } else {
          pkt.t = (pkt.t - pkt.speed + 1) % 1;
        }
        const pt = pkt.curve.getPoint(pkt.t);
        pkt.mesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  // Update yield bars when scheme changes
  useEffect(() => {
    if (!yieldBarsRef.current.principal || !yieldBarsRef.current.yield) return;

    if (selectedScheme === 'DAILY') {
      yieldBarsRef.current.principal.scale.set(1, 1.0, 1);
      yieldBarsRef.current.yield.scale.set(1, 1.25, 1);
    } else if (selectedScheme === 'WEEKLY') {
      yieldBarsRef.current.principal.scale.set(1, 1.1, 1);
      yieldBarsRef.current.yield.scale.set(1, 1.1, 1);
    } else {
      yieldBarsRef.current.principal.scale.set(1, 1.3, 1);
      yieldBarsRef.current.yield.scale.set(1, 0.9, 1);
    }
  }, [selectedScheme]);

  const setCamPreset = (preset) => {
    setActiveCamPreset(preset);
    if (preset === 'all') {
      targetCamPosRef.current.set(0, 20, 48);
    } else if (preset === 'vault') {
      targetCamPosRef.current.set(0, 11, 20);
    } else if (preset === 'merchants') {
      targetCamPosRef.current.set(-25, 13, 28);
    } else if (preset === 'branches') {
      targetCamPosRef.current.set(25, 13, 28);
    }
  };

  return (
    <div className="open-stage-3d-wrapper">
      {/* 3D WebGL Canvas Viewport */}
      <div className="open-stage-canvas" ref={mountRef} />

      {/* Subtle Camera View Presets on Bottom Center */}
      <div className="open-stage-view-bar">
        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'all' ? 'active' : ''}`}
          onClick={() => setCamPreset('all')}
        >
          <Layers size={13} />
          <span>Full Campus</span>
        </button>

        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'vault' ? 'active' : ''}`}
          onClick={() => setCamPreset('vault')}
        >
          <Lock size={13} />
          <span>Central Rotunda</span>
        </button>

        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'merchants' ? 'active' : ''}`}
          onClick={() => setCamPreset('merchants')}
        >
          <Building2 size={13} />
          <span>Merchant Terminal</span>
        </button>

        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'branches' ? 'active' : ''}`}
          onClick={() => setCamPreset('branches')}
        >
          <Wallet size={13} />
          <span>Branch Pavilion</span>
        </button>

        <button
          type="button"
          className={`open-icon-btn ${isAutoRotate ? 'active' : ''}`}
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          title="Toggle Auto Orbit"
        >
          <RefreshCw size={13} className={isAutoRotate ? 'spin-anim' : ''} />
        </button>
      </div>

      <div className="open-stage-hint">
        <span>Curved Architectural Banking Campus · Drag 360° to Explore</span>
      </div>
    </div>
  );
};

export default ThreeVaultEnclave;
