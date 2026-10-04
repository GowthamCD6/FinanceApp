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
 * ThreeVaultEnclave: Radiant 3D Financial Treasury & Flow Engine
 * Clean, high-brightness studio stage matching the Home Screen aesthetic.
 * Focuses strictly on architecture, central banking vaults, branch safes,
 * and cash pipelines with zero personal or sensitive monetary data.
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
  const targetCamPosRef = useRef(new THREE.Vector3(0, 18, 46));

  // Interactive controls
  const [activeCamPreset, setActiveCamPreset] = useState('all'); // 'all', 'vault', 'merchants', 'branches'
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Sharp text canvas generator for 3D signage (Architecture labels only, zero personal data)
  const makeTextTexture = (title, subtitle = '') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    // Clean white card background with soft border
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(8, 8, 496, 224, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    // Title
    ctx.fillStyle = '#080D2B';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, subtitle ? 95 : 120);

    // Subtitle
    if (subtitle) {
      ctx.fillStyle = '#1D4ED8';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(subtitle, 256, 155);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 520;

    // 1. Scene setup: High-brightness radiant white studio
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 18, 46);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
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

    // 4. Radiant High-Brightness Studio Lighting Rig
    // 4a. Ambient light - High illumination for clear visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.85);
    scene.add(ambientLight);

    // 4b. Primary Daylight Sun Key Light (Direct, bright, warm-white)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(26, 42, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 4c. Secondary Sky Fill Light (Eliminates harsh shadows)
    const skyFillLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    skyFillLight.position.set(-26, 24, -20);
    scene.add(skyFillLight);

    // 4d. Top Overhead Downlight (Direct beam on central vault)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 45, 0);
    scene.add(topLight);

    // 4e. Luminous Cyan Accent Point Light inside Safe
    const safeGlow = new THREE.PointLight(0x38bdf8, 2.8, 36);
    safeGlow.position.set(0, 6.5, 0);
    scene.add(safeGlow);

    // 5. Floor Studio Pedestal: Luminous clean white with soft reflections
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

    // Floor architectural rings
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
    // 6. CENTRAL OBJECT: GLEAMING SILVER & 24K GOLD BANK VAULT SAFE
    // ================================================================
    const vaultGroup = new THREE.Group();
    vaultSafeGroupRef.current = vaultGroup;
    scene.add(vaultGroup);

    // 6a. Safe Marble Base Pedestal (Pure Bright White)
    const baseGeo = new THREE.CylinderGeometry(8.5, 9.2, 1.4, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.25,
      metalness: 0.35,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.7;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    vaultGroup.add(baseMesh);

    // 6b. Silver Titanium Vault Body (Reflective & Bright)
    const vaultBodyGeo = new THREE.CylinderGeometry(6.2, 6.2, 4.2, 36);
    const vaultBodyMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.16,
      metalness: 0.88,
    });
    const vaultBody = new THREE.Mesh(vaultBodyGeo, vaultBodyMat);
    vaultBody.position.y = 3.5;
    vaultBody.castShadow = true;
    vaultGroup.add(vaultBody);

    // 6c. Heavy Chrome Vault Rim
    const rimGeo = new THREE.TorusGeometry(5.8, 0.42, 16, 36);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8e3,
      roughness: 0.1,
      metalness: 0.95,
    });
    const vaultRim = new THREE.Mesh(rimGeo, rimMat);
    vaultRim.rotation.x = Math.PI / 2;
    vaultRim.position.y = 5.6;
    vaultGroup.add(vaultRim);

    // Chrome locking perimeter bolts
    const boltCount = 12;
    for (let b = 0; b < boltCount; b++) {
      const angle = (b / boltCount) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 12);
      const boltMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.08 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(Math.cos(angle) * 5.8, 5.8, Math.sin(angle) * 5.8);
      vaultGroup.add(bolt);
    }

    // 6d. Precision Gleaming Gold Combination Wheel
    const wheelGroup = new THREE.Group();
    vaultWheelRef.current = wheelGroup;
    wheelGroup.position.set(0, 5.7, 0);
    vaultGroup.add(wheelGroup);

    const wheelRimGeo = new THREE.TorusGeometry(3.0, 0.28, 16, 32);
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

    // Wheel spokes
    for (let s = 0; s < 4; s++) {
      const spokeGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.6, 8);
      const spoke = new THREE.Mesh(spokeGeo, goldMat);
      spoke.rotation.z = Math.PI / 2;
      spoke.rotation.y = (s * Math.PI) / 4;
      wheelGroup.add(spoke);
    }

    // Center Spindle with Luminous Emerald LED
    const spindleGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.6, 24);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.y = 0.2;
    wheelGroup.add(spindle);

    const ledGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const statusLed = new THREE.Mesh(ledGeo, ledMat);
    statusLed.position.y = 0.55;
    wheelGroup.add(statusLed);

    // 6e. Gleaming 24K Gold Bullion Ingot Stacks
    const ingotGeo = new THREE.BoxGeometry(1.8, 0.55, 0.85);
    const ingotPositions = [
      { x: -3.8, y: 1.6, z: 2.2, r: 0.2 },
      { x: -3.8, y: 2.15, z: 2.2, r: 0.2 },
      { x: -3.2, y: 1.6, z: 3.2, r: -0.4 },
      { x: 3.5, y: 1.6, z: 2.5, r: 0.5 },
      { x: 3.5, y: 2.15, z: 2.5, r: 0.5 },
    ];
    ingotPositions.forEach((pos) => {
      const ingot = new THREE.Mesh(ingotGeo, goldMat);
      ingot.position.set(pos.x, pos.y, pos.z);
      ingot.rotation.y = pos.r;
      ingot.castShadow = true;
      vaultGroup.add(ingot);
    });

    // Vault Signage
    const vaultLabelTex = makeTextTexture('CENTRAL VAULT SAFE', 'Double-Entry Verified');
    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 3.0),
      new THREE.MeshBasicMaterial({ map: vaultLabelTex, transparent: true, side: THREE.DoubleSide })
    );
    labelMesh.position.set(0, 9.2, 0);
    vaultGroup.add(labelMesh);

    // ================================================================
    // 7. FINANCIAL OPERATION STATIONS & PIPELINES (Proper Architecture)
    // ================================================================
    const pipelines = [];

    const stationConfigs = [
      {
        name: 'Daily 100-Day Route',
        sub: 'Automated Merchant Sweep',
        pos: new THREE.Vector3(-24, 0, 10),
        type: 'route',
      },
      {
        name: 'Branch Cash Safes',
        sub: 'Counter Reconciliation',
        pos: new THREE.Vector3(24, 0, 10),
        type: 'branch',
      },
      {
        name: 'Weekly Chit Syndicate',
        sub: 'Syndicate Liquidity Pool',
        pos: new THREE.Vector3(0, 0, -22),
        type: 'chit',
      },
    ];

    stationConfigs.forEach((st) => {
      const sGroup = new THREE.Group();
      sGroup.position.copy(st.pos);

      // Station Base Platform
      const pGeo = new THREE.CylinderGeometry(5.2, 5.6, 1.0, 28);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.35 });
      const platform = new THREE.Mesh(pGeo, pMat);
      platform.position.y = 0.5;
      platform.castShadow = true;
      platform.receiveShadow = true;
      sGroup.add(platform);

      if (st.type === 'route') {
        // Merchant Terminal Box
        const tGeo = new THREE.BoxGeometry(3.4, 2.2, 2.8);
        const tMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.25, metalness: 0.7 });
        const terminal = new THREE.Mesh(tGeo, tMat);
        terminal.position.y = 2.1;
        sGroup.add(terminal);

        // Orbiting route points
        for (let m = 0; m < 4; m++) {
          const mGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
          const mMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.2 });
          const mMesh = new THREE.Mesh(mGeo, mMat);
          const a = (m / 4) * Math.PI * 2;
          mMesh.position.set(Math.cos(a) * 4.2, 1.8, Math.sin(a) * 4.2);
          sGroup.add(mMesh);
        }
      } else if (st.type === 'branch') {
        // Branch Cash Drawers
        for (let b = 0; b < 3; b++) {
          const dGeo = new THREE.BoxGeometry(3.6, 0.8, 2.6);
          const dMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.25, metalness: 0.75 });
          const drawer = new THREE.Mesh(dGeo, dMat);
          drawer.position.set(0, 1.4 + b * 0.95, 0);
          sGroup.add(drawer);
        }
      } else {
        // Chit Syndicate Pod
        const podGeo = new THREE.CylinderGeometry(2.4, 2.8, 3.0, 16);
        const podMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.7 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.y = 2.4;
        sGroup.add(pod);
      }

      // Station Signboard
      const signTex = makeTextTexture(st.name, st.sub);
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 3.0),
        new THREE.MeshBasicMaterial({ map: signTex, transparent: true, side: THREE.DoubleSide })
      );
      signMesh.position.set(0, 6.2, 0);
      sGroup.add(signMesh);

      scene.add(sGroup);

      // Connecting conduit
      const midPoint = new THREE.Vector3(st.pos.x * 0.5, 3.8, st.pos.z * 0.5);
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 2.5, 0),
        midPoint,
        new THREE.Vector3(st.pos.x, 1.2, st.pos.z)
      );
      pipelines.push(curve);

      const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.16, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0xa0aec0, roughness: 0.25, metalness: 0.7 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    });

    // ================================================================
    // 8. FLOWING CASH PACKETS (Blue Disbursals & Green Recoveries)
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
          dir: 1, // Vault -> Station
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
          dir: -1, // Station -> Vault
        });
      }
    });

    cashPacketsRef.current = cashPackets;

    // ================================================================
    // 9. DYNAMIC 3D AMORTIZATION COLUMNS
    // ================================================================
    const yieldGroup = new THREE.Group();
    yieldGroup.position.set(-18, 0, -18);
    scene.add(yieldGroup);

    const yPodium = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.6, 0.8, 24),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
    );
    yPodium.position.y = 0.4;
    yieldGroup.add(yPodium);

    const yLabelTex = makeTextTexture('AMORTIZATION ENGINE', 'Mathematical Yield Model');
    const yLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 2.5),
      new THREE.MeshBasicMaterial({ map: yLabelTex, transparent: true, side: THREE.DoubleSide })
    );
    yLabelMesh.position.set(0, 6.2, 0);
    yieldGroup.add(yLabelMesh);

    // Principal Column
    const b1Geo = new THREE.CylinderGeometry(0.8, 0.8, 4.0, 16);
    const b1Mat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.7, roughness: 0.2 });
    const b1Mesh = new THREE.Mesh(b1Geo, b1Mat);
    b1Mesh.position.set(-1.8, 2.4, 0);
    yieldGroup.add(b1Mesh);

    // Interest Fee Column
    const b2Geo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 16);
    const b2Mat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.15 });
    const b2Mesh = new THREE.Mesh(b2Geo, b2Mat);
    b2Mesh.position.set(1.8, 1.5, 0);
    yieldGroup.add(b2Mesh);

    yieldBarsRef.current = { principal: b1Mesh, yield: b2Mesh };

    // ================================================================
    // 10. MOUSE INTERACTION & DRAG
    // ================================================================
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0.35, phi: Math.PI / 2.65, radius: 50 };

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
    // 11. MAIN ANIMATION LOOP
    // ================================================================
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      camera.position.lerp(targetCamPosRef.current, 0.06);
      camera.lookAt(0, 3, 0);

      if (vaultWheelRef.current) {
        vaultWheelRef.current.rotation.y += delta * 0.45;
      }

      if (isAutoRotate && !isDragging && activeCamPreset === 'all') {
        spherical.theta += delta * 0.07;
        targetCamPosRef.current.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        targetCamPosRef.current.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      }

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
      targetCamPosRef.current.set(0, 18, 46);
    } else if (preset === 'vault') {
      targetCamPosRef.current.set(0, 10, 18);
    } else if (preset === 'merchants') {
      targetCamPosRef.current.set(-24, 12, 28);
    } else if (preset === 'branches') {
      targetCamPosRef.current.set(24, 12, 28);
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
          <span>Full Flow</span>
        </button>

        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'vault' ? 'active' : ''}`}
          onClick={() => setCamPreset('vault')}
        >
          <Lock size={13} />
          <span>Central Safe</span>
        </button>

        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'merchants' ? 'active' : ''}`}
          onClick={() => setCamPreset('merchants')}
        >
          <Building2 size={13} />
          <span>100-Day Route</span>
        </button>

        <button
          type="button"
          className={`open-view-btn ${activeCamPreset === 'branches' ? 'active' : ''}`}
          onClick={() => setCamPreset('branches')}
        >
          <Wallet size={13} />
          <span>Branch Safes</span>
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
        <span>Drag 360° to inspect cash routes & vault mechanisms</span>
      </div>
    </div>
  );
};

export default ThreeVaultEnclave;
