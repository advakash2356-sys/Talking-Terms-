import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VoiceOrb3DProps {
  isUserSpeaking: boolean;
  isPersonaSpeaking: boolean;
  isThinking?: boolean;
  audioLevel: number; // 0 to 100
  colorScheme?: 'amber' | 'blue' | 'rose' | 'purple' | 'cyan' | 'emerald' | string;
  size?: number;
}

export const VoiceOrb3D: React.FC<VoiceOrb3DProps> = ({
  isUserSpeaking,
  isPersonaSpeaking,
  isThinking = false,
  audioLevel,
  colorScheme = 'amber',
  size = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioLevelRef = useRef(audioLevel);
  const isSpeakingRef = useRef(isUserSpeaking || isPersonaSpeaking);
  const isThinkingRef = useRef(isThinking);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
    isSpeakingRef.current = isUserSpeaking || isPersonaSpeaking;
    isThinkingRef.current = isThinking;
  }, [audioLevel, isUserSpeaking, isPersonaSpeaking, isThinking]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // COLOR SCHEME SELECTION
    const getColors = () => {
      switch (colorScheme) {
        case 'blue':
        case 'cyan':
          return {
            primary: new THREE.Color('#38BDF8'),
            secondary: new THREE.Color('#0284C7'),
            accent: new THREE.Color('#7DD3FC'),
          };
        case 'rose':
        case 'pink':
          return {
            primary: new THREE.Color('#FB7185'),
            secondary: new THREE.Color('#E11D48'),
            accent: new THREE.Color('#FDA4AF'),
          };
        case 'purple':
          return {
            primary: new THREE.Color('#C084FC'),
            secondary: new THREE.Color('#7E22CE'),
            accent: new THREE.Color('#E9D5FF'),
          };
        case 'emerald':
        case 'green':
          return {
            primary: new THREE.Color('#34D399'),
            secondary: new THREE.Color('#059669'),
            accent: new THREE.Color('#A7F3D0'),
          };
        case 'amber':
        case 'orange':
        default:
          return {
            primary: new THREE.Color('#FF6B00'),
            secondary: new THREE.Color('#F59E0B'),
            accent: new THREE.Color('#FDE68A'),
          };
      }
    };

    const colors = getColors();

    // 1. CORE DEFORMED 3D SPHERE (Icosahedron with high detail)
    const baseRadius = 2.4;
    const geometry = new THREE.IcosahedronGeometry(baseRadius, 5);
    const originalPositions = geometry.attributes.position.array.slice() as Float32Array;

    // Glowing Material
    const material = new THREE.MeshPhysicalMaterial({
      color: colors.primary,
      emissive: colors.secondary,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transmission: 0.4,
      transparent: true,
      opacity: 0.92,
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // 2. 3D WIREFRAME HOLOGRAPHIC CAGE
    const wireGeo = new THREE.IcosahedronGeometry(baseRadius * 1.18, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: colors.accent,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframeMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframeMesh);

    // 3. 3D GYROSCOPIC ORBITAL RINGS
    const ringGroup = new THREE.Group();

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: colors.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.04, 16, 64), ringMat1);
    ringGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: colors.secondary,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.03, 16, 64), ringMat2);
    ring2.rotation.x = Math.PI / 2.8;
    ringGroup.add(ring2);

    scene.add(ringGroup);

    // 4. 3D FLOATING SPARKS PARTICLES
    const particleCount = 70;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVelocities: { angle: number; radius: number; speed: number; y: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = baseRadius * 1.2 + Math.random() * 2.2;
      const y = (Math.random() - 0.5) * 3;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = y;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;

      pVelocities.push({
        angle,
        radius,
        speed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
        y,
      });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: colors.accent,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // 5. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(colors.primary, 3, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(colors.secondary, 2, 20);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    // INTERACTIVE POINTER ROTATION
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      orb.rotation.y += deltaX * 0.01;
      orb.rotation.x += deltaY * 0.01;
      ringGroup.rotation.y += deltaX * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ANIMATION & FREQUENCY DEFORMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let smoothedAudio = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth audio modulation
      const targetAudio = isSpeakingRef.current ? Math.max(audioLevelRef.current, 20) : 0;
      smoothedAudio += (targetAudio - smoothedAudio) * 0.18;
      const audioFactor = smoothedAudio / 100;

      // Rotate meshes
      if (!isDragging) {
        orb.rotation.y = time * 0.35;
        orb.rotation.x = Math.sin(time * 0.5) * 0.15;
      }
      wireframeMesh.rotation.y = -time * 0.25;
      wireframeMesh.rotation.z = time * 0.18;

      ring1.rotation.z = time * 0.4;
      ring2.rotation.y = time * 0.3;

      // Dynamic Vertex Displacement on Sphere
      const positionAttr = geometry.attributes.position;
      const count = positionAttr.count;

      for (let i = 0; i < count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // 3D Harmonic Noise Calculation
        const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const u = ox / dist;
        const v = oy / dist;
        const w = oz / dist;

        const wave1 = Math.sin(u * 4 + time * 3) * (0.08 + audioFactor * 0.45);
        const wave2 = Math.cos(v * 6 + time * 2.5) * (0.05 + audioFactor * 0.35);
        const wave3 = Math.sin(w * 5 - time * 2) * (0.06 + (isThinkingRef.current ? 0.25 : 0));

        const displacement = 1 + wave1 + wave2 + wave3;

        positionAttr.setXYZ(i, ox * displacement, oy * displacement, oz * displacement);
      }

      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      // Update Floating Particle Positions
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const vel = pVelocities[i];
        vel.angle += vel.speed * (1 + audioFactor * 2);
        const currentR = vel.radius * (1 + audioFactor * 0.2 + Math.sin(time * 2 + vel.angle) * 0.08);

        positions[i * 3] = Math.cos(vel.angle) * currentR;
        positions[i * 3 + 1] = vel.y + Math.sin(time * 1.5 + vel.angle) * 0.4;
        positions[i * 3 + 2] = Math.sin(vel.angle) * currentR;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Pulse emissive glow on speech
      material.emissiveIntensity = 0.5 + audioFactor * 1.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, [colorScheme, size]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ width: size, height: size }}
      title="3D Spatial Audio Orb: Drag to rotate in 3D Space"
    />
  );
};
