import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AudioRibbon3DProps {
  isPlaying: boolean;
  audioLevel?: number;
  height?: number;
}

export const AudioRibbon3D: React.FC<AudioRibbon3DProps> = ({
  isPlaying,
  audioLevel = 0,
  height = 180,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  const audioLevelRef = useRef(audioLevel);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    audioLevelRef.current = audioLevel;
  }, [isPlaying, audioLevel]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 4, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. 3D DEFORMING CYLINDER / RIBBON MESH
    const segmentCount = 64;
    const geometry = new THREE.PlaneGeometry(16, 4, segmentCount, 16);
    const originalPositions = geometry.attributes.position.array.slice() as Float32Array;

    const material = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
      side: THREE.DoubleSide,
    });

    const ribbon = new THREE.Mesh(geometry, material);
    ribbon.rotation.x = -Math.PI / 3.5;
    scene.add(ribbon);

    // 2. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff6b00, 2, 20);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // RESIZE
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let smoothedLevel = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const target = isPlayingRef.current ? Math.max(audioLevelRef.current, 25) : 5;
      smoothedLevel += (target - smoothedLevel) * 0.15;
      const factor = smoothedLevel / 100;

      // Deform Ribbon Vertices with Traveling Sine Waves
      const posAttr = geometry.attributes.position;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const wave = Math.sin(ox * 0.8 + time * 4) * (0.3 + factor * 1.5);
        const wave2 = Math.cos(oy * 1.2 + time * 3) * (0.2 + factor * 0.8);

        posAttr.setXYZ(i, ox, oy + wave + wave2, oz + Math.sin(ox * 0.5 - time * 2) * factor);
      }

      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [height]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden pointer-events-none"
      style={{ height }}
    />
  );
};
