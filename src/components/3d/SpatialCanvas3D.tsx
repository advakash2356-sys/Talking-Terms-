import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, Sliders } from 'lucide-react';

interface SpatialCanvas3DProps {
  interactive?: boolean;
  engineState: 'idle' | 'listening' | 'thinking' | 'speaking';
}

type BackgroundTheme = 'delhi_cyber' | 'saffron_flame' | 'emerald_matrix' | 'cosmic_violet';

export const SpatialCanvas3D: React.FC<SpatialCanvas3DProps> = ({ interactive = true, engineState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<BackgroundTheme>('delhi_cyber');
  const [showControls, setShowControls] = useState(false);
  const [intensity, setIntensity] = useState(1);

  // Update intensity based on state
  useEffect(() => {
    switch (engineState) {
      case 'listening':
        setIntensity(2.5); // More active
        break;
      case 'thinking':
        setIntensity(1.5); // Pulse
        break;
      case 'speaking':
        setIntensity(3.0); // High activity
        break;
      case 'idle':
      default:
        setIntensity(1.0); // Baseline
        break;
    }
  }, [engineState]);

  const themeRef = useRef(theme);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'default',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Full transparency for background layer
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.background = 'transparent';
    container.appendChild(renderer.domElement);

    // 2. CREATE GLOWING CIRCULAR PARTICLE TEXTURE
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 180, 100, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 107, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    // 3. DYNAMIC 3D PARTICLES / STARS
    const maxParticles = 480;
    const particlePositions = new Float32Array(maxParticles * 3);
    const particleColors = new Float32Array(maxParticles * 3);
    const particleVelocities: { x: number; y: number; z: number; ox: number; oy: number; oz: number }[] = [];

    const getThemeColors = (t: BackgroundTheme) => {
      switch (t) {
        case 'saffron_flame':
          return [new THREE.Color('#FF4500'), new THREE.Color('#FF8C00'), new THREE.Color('#FFD700')];
        case 'emerald_matrix':
          return [new THREE.Color('#10B981'), new THREE.Color('#059669'), new THREE.Color('#34D399')];
        case 'cosmic_violet':
          return [new THREE.Color('#A855F7'), new THREE.Color('#6366F1'), new THREE.Color('#EC4899')];
        case 'delhi_cyber':
        default:
          return [
            new THREE.Color('#FF6B00'), // Saffron
            new THREE.Color('#38BDF8'), // Cyber Cyan
            new THREE.Color('#F59E0B'), // Amber
            new THREE.Color('#10B981'), // Emerald
          ];
      }
    };

    const initialColors = getThemeColors(themeRef.current);

    for (let i = 0; i < maxParticles; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 55;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 35;

      particlePositions[i3] = x;
      particlePositions[i3 + 1] = y;
      particlePositions[i3 + 2] = z;

      const chosenColor = initialColors[i % initialColors.length];
      particleColors[i3] = chosenColor.r;
      particleColors[i3 + 1] = chosenColor.g;
      particleColors[i3 + 2] = chosenColor.b;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
        ox: x,
        oy: y,
        oz: z,
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.85,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 4. DYNAMIC CONSTELLATION PROXIMITY LINES
    const maxLineConnections = 240;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // 5. UNDULATING 3D CYBER HORIZON WAVE GRID
    const gridSegments = 28;
    const gridGeo = new THREE.PlaneGeometry(60, 60, gridSegments, gridSegments);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2.2;
    gridMesh.position.y = -10;
    gridMesh.position.z = -5;
    scene.add(gridMesh);

    // 6. DUAL ROTATING NEON HOLOGRAPHIC RINGS
    const ringGroup = new THREE.Group();

    // Outer Ring
    const torus1Geo = new THREE.TorusGeometry(9, 0.15, 16, 64);
    const torus1Mat = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const torus1 = new THREE.Mesh(torus1Geo, torus1Mat);
    torus1.rotation.x = Math.PI / 3;
    ringGroup.add(torus1);

    // Inner Counter-Rotating Ring
    const torus2Geo = new THREE.TorusGeometry(6.5, 0.12, 16, 48);
    const torus2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2.rotation.y = Math.PI / 4;
    ringGroup.add(torus2);

    scene.add(ringGroup);

    // 7. FLOATING 3D POLYHEDRONS (Octahedrons, Icosahedrons)
    const polyGroup = new THREE.Group();
    const polyNodes: { mesh: THREE.Mesh; speedX: number; speedY: number; speedZ: number; angle: number; radius: number; yBase: number }[] = [];

    const octaGeo = new THREE.OctahedronGeometry(1.0, 0);
    const icosaGeo = new THREE.IcosahedronGeometry(0.9, 0);

    const polyColors = [0xff6b00, 0x38bdf8, 0x10b981, 0xf59e0b];

    for (let i = 0; i < 6; i++) {
      const geo = i % 2 === 0 ? octaGeo : icosaGeo;
      const mat = new THREE.MeshBasicMaterial({
        color: polyColors[i % polyColors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const radius = 11 + (i % 3) * 3;
      const angle = (i / 6) * Math.PI * 2;
      const yBase = (Math.random() - 0.5) * 12;

      mesh.position.set(Math.cos(angle) * radius, yBase, Math.sin(angle) * radius);
      polyGroup.add(mesh);
      polyNodes.push({
        mesh,
        speedX: 0.01 + Math.random() * 0.015,
        speedY: 0.015 + Math.random() * 0.01,
        speedZ: 0.01,
        angle,
        radius,
        yBase,
      });
    }

    scene.add(polyGroup);

    // 8. INTERACTIVE LIGHTING
    const pointLight = new THREE.PointLight(0xff6b00, 3, 50);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    const cursorLight = new THREE.PointLight(0x38bdf8, 2.5, 40);
    cursorLight.position.set(0, 0, 10);
    scene.add(cursorLight);

    // 9. MOUSE TRACKING & PARALLAX
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = -(e.clientY / window.innerHeight) * 2 + 1;

      targetX = normalizedX * 4.0;
      targetY = normalizedY * 3.0;

      // Position dynamic cursor light in 3D world
      cursorLight.position.x = normalizedX * 16;
      cursorLight.position.y = normalizedY * 12;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!interactive || !e.touches[0]) return;
      const t = e.touches[0];
      const normalizedX = (t.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = -(t.clientY / window.innerHeight) * 2 + 1;
      targetX = normalizedX * 3.5;
      targetY = normalizedY * 2.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 10. RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 11. MAIN ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentIntensity = intensityRef.current;

      // Smooth camera interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 0, 0);

      // Rotate and update particles
      const posArray = particleGeometry.attributes.position.array as Float32Array;
      const colArray = particleGeometry.attributes.color.array as Float32Array;

      // Update particle drift and boundary wrap
      for (let i = 0; i < maxParticles; i++) {
        const i3 = i * 3;
        posArray[i3] += particleVelocities[i].x * currentIntensity;
        posArray[i3 + 1] += particleVelocities[i].y * currentIntensity;
        posArray[i3 + 2] += particleVelocities[i].z * currentIntensity;

        // Wrap around bounds
        if (posArray[i3] > 28) posArray[i3] = -28;
        if (posArray[i3] < -28) posArray[i3] = 28;
        if (posArray[i3 + 1] > 22) posArray[i3 + 1] = -22;
        if (posArray[i3 + 1] < -22) posArray[i3 + 1] = 22;
        if (posArray[i3 + 2] > 18) posArray[i3 + 2] = -18;
        if (posArray[i3 + 2] < -18) posArray[i3 + 2] = 18;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Particle system subtle rotation
      particleSystem.rotation.y = elapsedTime * 0.02 * currentIntensity;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.03;

      // Update Constellation Lines (connect nearby particles)
      let lineIndex = 0;
      const linePos = lineGeometry.attributes.position.array as Float32Array;
      const lineCol = lineGeometry.attributes.color.array as Float32Array;

      // Sample a subset for performance
      const step = 4;
      const connectionDistSq = 36; // radius of 6 units

      for (let i = 0; i < maxParticles && lineIndex < maxLineConnections; i += step) {
        const i3 = i * 3;
        const x1 = posArray[i3];
        const y1 = posArray[i3 + 1];
        const z1 = posArray[i3 + 2];

        for (let j = i + step; j < maxParticles && lineIndex < maxLineConnections; j += step) {
          const j3 = j * 3;
          const x2 = posArray[j3];
          const y2 = posArray[j3 + 1];
          const z2 = posArray[j3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < connectionDistSq) {
            const lineOffset = lineIndex * 6;
            linePos[lineOffset] = x1;
            linePos[lineOffset + 1] = y1;
            linePos[lineOffset + 2] = z1;

            linePos[lineOffset + 3] = x2;
            linePos[lineOffset + 4] = y2;
            linePos[lineOffset + 5] = z2;

            // Line colors
            lineCol[lineOffset] = colArray[i3];
            lineCol[lineOffset + 1] = colArray[i3 + 1];
            lineCol[lineOffset + 2] = colArray[i3 + 2];

            lineCol[lineOffset + 3] = colArray[j3];
            lineCol[lineOffset + 4] = colArray[j3 + 1];
            lineCol[lineOffset + 5] = colArray[j3 + 2];

            lineIndex++;
          }
        }
      }

      // Zero out unused line segments
      for (let k = lineIndex * 6; k < maxLineConnections * 6; k++) {
        linePos[k] = 0;
      }
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Undulate Cyber Grid with organic breathing wave rhythm
      const gridPos = gridMesh.geometry.attributes.position.array as Float32Array;
      const waveBreath = 1.3 + Math.sin(elapsedTime * 0.4) * 0.3;
      for (let i = 0; i < gridPos.length; i += 3) {
        const gx = gridPos[i];
        const gy = gridPos[i + 1];
        gridPos[i + 2] = Math.sin(gx * 0.14 + elapsedTime * 1.2) * Math.cos(gy * 0.14 + elapsedTime * 1.0) * waveBreath;
      }
      gridMesh.geometry.attributes.position.needsUpdate = true;

      // Slow Breathing Rotation & Pulsation for Neon Holographic Rings
      const ringBreathScale = 1 + Math.sin(elapsedTime * 0.45) * 0.08;
      ringGroup.scale.set(ringBreathScale, ringBreathScale, ringBreathScale);
      ringGroup.rotation.y = elapsedTime * 0.03 * currentIntensity;
      ringGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15;
      ringGroup.rotation.z = Math.cos(elapsedTime * 0.15) * 0.12;

      // Torus 1 (Outer) - Harmonic precession
      torus1.rotation.z = elapsedTime * 0.045 * currentIntensity;
      torus1.rotation.y = Math.sin(elapsedTime * 0.22) * 0.35;
      torus1.rotation.x = (Math.PI / 3) + Math.cos(elapsedTime * 0.28) * 0.18;

      // Torus 2 (Inner) - Counter-harmonic precession
      torus2.rotation.z = -elapsedTime * 0.04 * currentIntensity;
      torus2.rotation.x = (Math.PI / 4) + Math.sin(elapsedTime * 0.25) * 0.2;
      torus2.rotation.y = Math.cos(elapsedTime * 0.2) * 0.3;

      // Slow Breathing Rotation & Orbital Expansion for Polyhedrons
      const polyBreathScale = 1 + Math.cos(elapsedTime * 0.4) * 0.06;
      polyGroup.scale.set(polyBreathScale, polyBreathScale, polyBreathScale);
      polyGroup.rotation.y = elapsedTime * 0.015 * currentIntensity;
      polyGroup.rotation.x = Math.sin(elapsedTime * 0.18) * 0.08;

      polyNodes.forEach((node, idx) => {
        node.angle += 0.005 * currentIntensity;
        // Breathing orbital expansion
        const dynamicRadius = node.radius * (1 + Math.sin(elapsedTime * 0.35 + idx) * 0.06);
        node.mesh.position.x = Math.cos(node.angle) * dynamicRadius;
        node.mesh.position.z = Math.sin(node.angle) * dynamicRadius;
        node.mesh.position.y = node.yBase + Math.sin(elapsedTime * 0.7 + idx) * 1.6;

        // Individual geometry breathing scale pulsation & slow multi-axis rotation
        const nodeScale = 1 + Math.sin(elapsedTime * 0.6 + idx * 1.2) * 0.14;
        node.mesh.scale.setScalar(nodeScale);
        node.mesh.rotation.x += node.speedX * 0.5;
        node.mesh.rotation.y += node.speedY * 0.5;
        node.mesh.rotation.z += Math.sin(elapsedTime * 0.4 + idx) * 0.008;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 12. CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      torus1Geo.dispose();
      torus1Mat.dispose();
      torus2Geo.dispose();
      torus2Mat.dispose();
      octaGeo.dispose();
      icosaGeo.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <>
      {/* 3D WEBGL FULL-SCREEN CANVAS */}
      <div
        ref={containerRef}
        id="talking-terms-3d-spatial-canvas"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-95 transition-opacity duration-700"
        style={{ perspective: 1200 }}
      />

      {/* FLOATING 3D BACKGROUND STATUS & INTENSITY CONTROL PILL */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowControls(!showControls)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-orange-500/40 text-[11px] font-mono text-orange-300 shadow-xl backdrop-blur-md transition-all active:scale-95 group"
          title="3D Spatial Visuals Active • Click to Configure"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
          <span className="font-bold">3D Spatial BG</span>
          <Sliders className="w-3 h-3 text-slate-400 group-hover:text-white" />
        </button>

        {/* EXPANDABLE THEME & INTENSITY POPUP */}
        {showControls && (
          <div className="absolute bottom-10 right-0 w-64 bg-slate-950/95 border border-orange-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                <Eye className="w-3.5 h-3.5 text-orange-400" />
                3D Atmosphere Visuals
              </span>
              <span className="text-[10px] font-mono text-orange-400">
                480 nodes
              </span>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-slate-400 font-mono mb-1">Color Atmosphere</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme('delhi_cyber')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border text-left transition-colors ${
                      theme === 'delhi_cyber'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🔥 Delhi Cyber
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('saffron_flame')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border text-left transition-colors ${
                      theme === 'saffron_flame'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ⚡ Saffron Flame
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('emerald_matrix')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border text-left transition-colors ${
                      theme === 'emerald_matrix'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🌲 Mukherjee Zen
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('cosmic_violet')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border text-left transition-colors ${
                      theme === 'cosmic_violet'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🔮 Late Night
                  </button>
                </div>
              </div>

              {/* Speed / Intensity Slider */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Orbit Speed</span>
                  <span className="text-orange-400">{Math.round(intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
