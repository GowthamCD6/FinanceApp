import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * ThreeCollectionDemo: Interactive 3D visualization of the Fixed Daily vs Date-wise
 * collection models. Renders animated bars representing each collection day, with
 * smooth grow-in animation and auto-orbit camera.
 *
 * Props:
 *   mode  – 'FIXED' | 'DATEWISE'  (controls bar distribution)
 */
export const ThreeCollectionDemo = ({ mode = 'FIXED' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);
  const barsRef = useRef([]);
  const progressRef = useRef(0);

  /* ── colour palette ─────────────────────────────── */
  const COLORS = {
    platform: 0xf0f4ff,
    barFixed: 0x4f46e5,   // indigo
    barDatewise: 0x059669, // emerald
    barLump: 0x1d4ed8,    // royal blue (final bar)
    glow: 0x93c5fd,
    grid: 0xe2e8f0,
  };

  const DAY_COUNT = 25; // visual clarity – 25 bars represent 100-day cycle

  /* ── helpers ─────────────────────────────────────── */
  const barHeightForDay = useCallback((dayIdx, currentMode) => {
    if (currentMode === 'FIXED') {
      return 3.5; // all bars equal
    }
    // DATEWISE (LUMP_SUM_END): minimal bars for days 1..N-1, tall final bar
    if (dayIdx === DAY_COUNT - 1) return 8.5;
    // Small random "minimal" activity bars
    return 0.25 + Math.random() * 0.35;
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 420;

    /* ── scene ──────────────────────────────────────── */
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.012);

    /* ── camera ─────────────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 500);
    camera.position.set(18, 14, 22);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    /* ── renderer ───────────────────────────────────── */
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

    /* ── lighting ───────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(20, 30, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.0);
    fillLight.position.set(-20, 18, -16);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(COLORS.glow, 2.5, 30);
    accentLight.position.set(0, 5, 0);
    scene.add(accentLight);

    /* ── platform ───────────────────────────────────── */
    const platGeo = new THREE.CylinderGeometry(16, 16.5, 0.35, 64);
    const platMat = new THREE.MeshStandardMaterial({
      color: COLORS.platform,
      roughness: 0.45,
      metalness: 0.15,
    });
    const platform = new THREE.Mesh(platGeo, platMat);
    platform.position.y = -0.18;
    platform.receiveShadow = true;
    scene.add(platform);

    // edge ring
    const ringGeo = new THREE.TorusGeometry(16.25, 0.08, 16, 128);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xbfdbfe,
      roughness: 0.3,
      metalness: 0.6,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // grid lines on platform
    const gridGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const lineGeo = new THREE.PlaneGeometry(30, 0.02);
      const lineMat = new THREE.MeshBasicMaterial({ color: COLORS.grid, transparent: true, opacity: 0.35 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = (i / 12) * Math.PI;
      line.position.y = 0.02;
      gridGroup.add(line);
    }
    scene.add(gridGroup);

    /* ── collection bars ───────────────────────────── */
    const bars = [];
    const barGroup = new THREE.Group();
    const barWidth = 0.6;
    const gap = 0.18;
    const totalWidth = DAY_COUNT * (barWidth + gap);
    const startX = -totalWidth / 2 + barWidth / 2;

    for (let i = 0; i < DAY_COUNT; i++) {
      const targetH = barHeightForDay(i, mode);
      const barGeo = new THREE.BoxGeometry(barWidth, 0.01, barWidth); // start flat
      const isLast = i === DAY_COUNT - 1 && mode === 'DATEWISE';
      const barMat = new THREE.MeshStandardMaterial({
        color: isLast ? COLORS.barLump : (mode === 'FIXED' ? COLORS.barFixed : COLORS.barDatewise),
        roughness: 0.35,
        metalness: 0.25,
        emissive: isLast ? 0x1d4ed8 : (mode === 'FIXED' ? 0x4f46e5 : 0x059669),
        emissiveIntensity: isLast ? 0.35 : 0.1,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(startX + i * (barWidth + gap), 0, 0);
      bar.castShadow = true;
      bar.receiveShadow = true;
      barGroup.add(bar);

      bars.push({
        mesh: bar,
        targetHeight: targetH,
        currentHeight: 0.01,
        delay: i * 0.04, // stagger grow-in
        phase: 0,
      });
    }
    scene.add(barGroup);
    barsRef.current = bars;

    /* ── day number labels on platform ────────────── */
    const labelGroup = new THREE.Group();
    const labelPositions = [0, 4, 9, 14, 19, DAY_COUNT - 1];
    labelPositions.forEach((idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 128, 64);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const dayLabel = idx === DAY_COUNT - 1 ? 'D100' : `D${Math.round((idx / (DAY_COUNT - 1)) * 99) + 1}`;
      ctx.fillText(dayLabel, 64, 32);

      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.2, 0.6, 1);
      sprite.position.set(startX + idx * (barWidth + gap), -0.45, 1.2);
      labelGroup.add(sprite);
    });
    scene.add(labelGroup);

    /* ── center title billboard ────────────────────── */
    const titleCanvas = document.createElement('canvas');
    titleCanvas.width = 1024;
    titleCanvas.height = 280;
    const tCtx = titleCanvas.getContext('2d');
    tCtx.imageSmoothingEnabled = true;
    tCtx.imageSmoothingQuality = 'high';
    tCtx.fillStyle = 'rgba(255,255,255,0.92)';
    tCtx.beginPath();
    tCtx.roundRect(20, 20, 984, 240, 32);
    tCtx.fill();
    tCtx.strokeStyle = '#E2E8F0';
    tCtx.lineWidth = 3;
    tCtx.stroke();
    tCtx.fillStyle = '#080D2B';
    tCtx.font = '800 52px Inter, sans-serif';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(mode === 'FIXED' ? 'Fixed Daily Collection' : 'Date-wise Settlement', 512, 100);
    tCtx.fillStyle = '#1D4ED8';
    tCtx.font = '700 32px Inter, sans-serif';
    tCtx.fillText(mode === 'FIXED' ? '₹125 / day × 100 days = ₹12,500' : '₹0 / day × 99 days → ₹12,500 on Day 100', 512, 180);

    const titleTex = new THREE.CanvasTexture(titleCanvas);
    titleTex.generateMipmaps = false;
    titleTex.minFilter = THREE.LinearFilter;
    const titleMat = new THREE.SpriteMaterial({ map: titleTex, transparent: true });
    const titleSprite = new THREE.Sprite(titleMat);
    titleSprite.scale.set(12, 3.3, 1);
    titleSprite.position.set(0, 8.5, -5);
    scene.add(titleSprite);

    /* ── floating coins (particles) ───────────────── */
    const coinGroup = new THREE.Group();
    const coinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.25,
      metalness: 0.8,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25,
    });
    const coins = [];
    for (let i = 0; i < 18; i++) {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      const angle = (i / 18) * Math.PI * 2;
      const radius = 6 + Math.random() * 5;
      coin.position.set(Math.cos(angle) * radius, 3 + Math.random() * 4, Math.sin(angle) * radius);
      coin.rotation.x = Math.random() * Math.PI;
      coin.rotation.z = Math.random() * Math.PI;
      coinGroup.add(coin);
      coins.push({ mesh: coin, angle, radius, speed: 0.15 + Math.random() * 0.3, yBase: coin.position.y });
    }
    scene.add(coinGroup);

    /* ── animation loop ───────────────────────────── */
    let clock = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      clock += 0.016;

      // Grow bars with stagger
      bars.forEach((b) => {
        b.phase += 0.016;
        if (b.phase > b.delay) {
          const t = Math.min((b.phase - b.delay) / 0.8, 1);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          b.currentHeight = 0.01 + (b.targetHeight - 0.01) * eased;
          b.mesh.scale.y = b.currentHeight / 0.01;
          b.mesh.position.y = b.currentHeight / 2;
        }
      });

      // Coins float & orbit
      coins.forEach((c) => {
        c.angle += c.speed * 0.005;
        c.mesh.position.x = Math.cos(c.angle) * c.radius;
        c.mesh.position.z = Math.sin(c.angle) * c.radius;
        c.mesh.position.y = c.yBase + Math.sin(clock * c.speed * 3) * 0.6;
        c.mesh.rotation.y += 0.02;
      });

      // Camera auto-orbit
      const camAngle = clock * 0.12;
      const camR = 28;
      camera.position.x = Math.sin(camAngle) * camR;
      camera.position.z = Math.cos(camAngle) * camR;
      camera.position.y = 12 + Math.sin(clock * 0.08) * 2;
      camera.lookAt(0, 2.5, 0);

      // Ring pulse
      ring.material.emissiveIntensity = 0.2 + Math.sin(clock * 2) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    /* ── resize handler ───────────────────────────── */
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

    return () => {
      window.removeEventListener('resize', onResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
    };
  }, [mode, barHeightForDay]);

  return (
    <div className="collection-demo-3d-wrapper">
      <div ref={mountRef} className="collection-demo-canvas" />
    </div>
  );
};

export default ThreeCollectionDemo;
