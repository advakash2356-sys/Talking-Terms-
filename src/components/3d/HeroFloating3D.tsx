import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroFloating3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 220;

    let renderer: THREE.WebGLRenderer | null = null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1, 9);
    camera.lookAt(0, 0, 0);

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('HeroFloating3D WebGL init error:', err);
      return;
    }

    // 1. 3D FLOATING UPSC BOOK / NOTEBOOK
    const bookGroup = new THREE.Group();
    const bookCoverGeo = new THREE.BoxGeometry(1.6, 2.2, 0.3);
    const bookMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0x9a3412,
      emissiveIntensity: 0.3,
    });
    const bookMesh = new THREE.Mesh(bookCoverGeo, bookMat);
    bookGroup.add(bookMesh);

    // Gold spine / embossed lines
    const spineGeo = new THREE.BoxGeometry(0.1, 2.0, 0.34);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.1,
    });
    const spine = new THREE.Mesh(spineGeo, goldMat);
    spine.position.x = -0.78;
    bookGroup.add(spine);

    bookGroup.position.set(-2.4, 0.2, 0);
    bookGroup.rotation.y = 0.5;
    bookGroup.rotation.z = -0.2;
    scene.add(bookGroup);

    // 2. 3D CHAI GLASS / KULLHAD
    const chaiGroup = new THREE.Group();
    const cupGeo = new THREE.CylinderGeometry(0.7, 0.45, 1.4, 16);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706, // Hot cutting chai amber
      transmission: 0.6,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1,
    });
    const cup = new THREE.Mesh(cupGeo, glassMat);
    chaiGroup.add(cup);

    // Chai Steam Particles
    const steamGeo = new THREE.BufferGeometry();
    const steamCount = 18;
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount; i++) {
      steamPos[i * 3] = (Math.random() - 0.5) * 0.4;
      steamPos[i * 3 + 1] = 0.8 + Math.random() * 1.2;
      steamPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const steam = new THREE.Points(steamGeo, steamMat);
    chaiGroup.add(steam);

    chaiGroup.position.set(2.4, -0.2, 0.5);
    chaiGroup.rotation.z = 0.15;
    scene.add(chaiGroup);

    // 3. 3D NEURAL HEADSET / TORUS RING
    const headsetGroup = new THREE.Group();
    const bandGeo = new THREE.TorusGeometry(1.5, 0.12, 16, 32, Math.PI);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const band = new THREE.Mesh(bandGeo, darkMetalMat);
    band.rotation.z = -Math.PI / 2;
    headsetGroup.add(band);

    const earGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const earMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.4,
      metalness: 0.7,
    });
    const ear1 = new THREE.Mesh(earGeo, earMat);
    ear1.position.set(-1.5, 0, 0);
    ear1.rotation.z = Math.PI / 2;
    headsetGroup.add(ear1);

    const ear2 = new THREE.Mesh(earGeo, earMat);
    ear2.position.set(1.5, 0, 0);
    ear2.rotation.z = Math.PI / 2;
    headsetGroup.add(ear2);

    headsetGroup.position.set(0, 0.3, 1.2);
    scene.add(headsetGroup);

    // 4. LIGHTS
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const pLight1 = new THREE.PointLight(0xff6b00, 3, 20);
    pLight1.position.set(3, 4, 5);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x38bdf8, 2.5, 20);
    pLight2.position.set(-3, -2, 4);
    scene.add(pLight2);

    // MOUSE INTERACTIVE PARALLAX
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseX = x * 0.8;
      mouseY = y * 0.6;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // RESIZE
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 380;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse follow
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (1 + mouseY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Book float & flip
      bookGroup.rotation.y = 0.5 + Math.sin(time * 1.2) * 0.25;
      bookGroup.position.y = 0.2 + Math.sin(time * 2) * 0.18;

      // Chai cup wobble & steam
      chaiGroup.rotation.y = time * 0.8;
      chaiGroup.position.y = -0.2 + Math.cos(time * 2.2) * 0.15;
      const steamArr = steam.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < steamCount; i++) {
        steamArr[i * 3 + 1] += 0.015;
        if (steamArr[i * 3 + 1] > 2.2) {
          steamArr[i * 3 + 1] = 0.8;
        }
      }
      steam.geometry.attributes.position.needsUpdate = true;

      // Headset gentle nod
      headsetGroup.rotation.x = Math.sin(time * 1.5) * 0.15;
      headsetGroup.rotation.y = Math.sin(time * 0.8) * 0.3;
      headsetGroup.position.y = 0.3 + Math.sin(time * 1.8) * 0.12;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[220px] rounded-3xl overflow-hidden pointer-events-none relative"
      title="3D Spatial Artifacts: Delhi Aspirant Elements in Real-Time WebGL"
    />
  );
};
