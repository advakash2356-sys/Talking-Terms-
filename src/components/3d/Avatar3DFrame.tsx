import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Avatar3DFrameProps {
  children: React.ReactNode;
  size?: number;
  glowColor?: string;
  isSpeaking?: boolean;
  isHovered?: boolean;
  avatarUrl?: string;
  tag?: string;
  interactive?: boolean;
}

export const Avatar3DFrame: React.FC<Avatar3DFrameProps> = ({
  children,
  size = 64,
  glowColor = '#FF6B00',
  isSpeaking = false,
  isHovered = false,
  tag,
  interactive = true,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const isHoveredRef = useRef(isHovered);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
    isHoveredRef.current = isHovered;
  }, [isSpeaking, isHovered]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    let isVisible = true;

    // WebGL Canvas size slightly larger than avatar for orbiting 3D particles & rings
    const canvasSize = size + 36;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 6.5;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        precision: 'mediump',
      });
      renderer.setSize(canvasSize, canvasSize);
      renderer.setPixelRatio(1);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL fallback enabled for 3D avatar frame:', e);
      return;
    }

    const primaryColor = new THREE.Color(glowColor);

    // 1. 3D HOLOGRAPHIC GYROSCOPE RINGS
    const ringGroup = new THREE.Group();

    // Outer orbiting neon ring
    const ring1Geo = new THREE.TorusGeometry(2.3, 0.04, 8, 24);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ringGroup.add(ring1);

    // Diagonal counter-rotating ring
    const ring2Geo = new THREE.TorusGeometry(2.45, 0.03, 8, 24);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Cyber cyan accent
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ringGroup.add(ring2);

    scene.add(ringGroup);

    // 2. 3D FLOATING SPARKS / ENERGY MOTES
    const particleCount = 14;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds: { radius: number; speed: number; angle: number; y: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.1 + Math.random() * 0.6;
      const y = (Math.random() - 0.5) * 1.5;

      pPositions[i * 3] = Math.cos(angle) * radius;
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = Math.sin(angle) * radius;

      pSpeeds.push({
        radius,
        speed: (0.02 + Math.random() * 0.03) * (i % 2 === 0 ? 1 : -1),
        angle,
        y,
      });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: primaryColor,
      size: 0.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 3. FLOATING 3D DIAMOND ORBS
    const diamondGroup = new THREE.Group();
    const dGeo = new THREE.OctahedronGeometry(0.18, 0);
    const dMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });

    const diamonds: THREE.Mesh[] = [];
    for (let i = 0; i < 2; i++) {
      const dMesh = new THREE.Mesh(dGeo, dMat);
      diamondGroup.add(dMesh);
      diamonds.push(dMesh);
    }
    scene.add(diamondGroup);

    // Visibility Observer to pause off-screen card animations
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && wrapperRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0]) {
          isVisible = entries[0].isIntersecting;
        }
      }, { threshold: 0.05 });
      observer.observe(wrapperRef.current);
    }

    // ANIMATION
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || !renderer) return;

      const time = clock.getElapsedTime();
      const speedMultiplier = isSpeakingRef.current ? 2.5 : isHoveredRef.current ? 1.8 : 1.0;

      // Rotate 3D Gyroscope Rings
      ring1.rotation.z = time * 0.8 * speedMultiplier;
      ring1.rotation.y = Math.sin(time * 0.5) * 0.4;

      ring2.rotation.z = -time * 0.6 * speedMultiplier;
      ring2.rotation.x = Math.PI / 3 + Math.cos(time * 0.4) * 0.3;

      // Pulse ring scale on speech / hover
      const targetScale = isSpeakingRef.current ? 1.12 + Math.sin(time * 8) * 0.05 : isHoveredRef.current ? 1.08 : 1.0;
      ringGroup.scale.set(targetScale, targetScale, targetScale);

      // Animate Orbiting Diamonds
      diamonds.forEach((d, idx) => {
        const dAngle = time * 1.2 * speedMultiplier + (idx * Math.PI);
        const dRadius = 2.4;
        d.position.set(
          Math.cos(dAngle) * dRadius,
          Math.sin(time * 2 + idx) * 0.4,
          Math.sin(dAngle) * dRadius
        );
        d.rotation.x += 0.03;
        d.rotation.y += 0.04;
      });

      // Animate particles
      const posArray = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const sp = pSpeeds[i];
        sp.angle += sp.speed * speedMultiplier;
        posArray[i * 3] = Math.cos(sp.angle) * sp.radius;
        posArray[i * 3 + 1] = sp.y + Math.sin(time * 2 + sp.angle) * 0.2;
        posArray[i * 3 + 2] = Math.sin(sp.angle) * sp.radius;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (observer) {
        observer.disconnect();
      }
      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      pGeo.dispose();
      pMat.dispose();
      dGeo.dispose();
      dMat.dispose();
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [size, glowColor]);

  return (
    <div
      ref={wrapperRef}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center select-none"
    >
      {/* 3D WEBGL ORBITING GYROSCOPE & PARTICLES LAYER */}
      <div
        ref={canvasContainerRef}
        className="absolute -inset-[18px] pointer-events-none z-10 flex items-center justify-center"
        style={{ width: size + 36, height: size + 36 }}
      />

      {/* 3D FLOATING AVATAR CORE WITH TACTILE DEPTH */}
      <div
        style={{
          width: size,
          height: size,
          transform: isHovered ? 'scale(1.08) translateZ(25px)' : 'scale(1) translateZ(10px)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        }}
        className="relative rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-2 border-orange-500/60 bg-slate-950 flex items-center justify-center z-20 group"
      >
        {children}

        {/* Dynamic Glowing 3D Glass Surface Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-white/20 pointer-events-none mix-blend-overlay" />
      </div>

      {/* 3D LIVE PULSE BADGE */}
      {isSpeaking && (
        <div className="absolute -bottom-1 -right-1 z-30 flex items-center justify-center">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950 shadow-md shadow-emerald-500/50" />
          </span>
        </div>
      )}
    </div>
  );
};
