import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, Sparkles, MapPin, Radio, Users } from 'lucide-react';
import { ambientSoundEngine } from '../../utils/ambientSynth';

interface LocationBeacon {
  id: string;
  name: string;
  hindiName: string;
  coords: [number, number, number];
  color: number;
  aspirantsOnline: number;
  vibe: string;
  soundPreset: 'chai_rain' | 'metro_lofi' | 'theta_432' | 'late_night_cp';
}

const BEACONS: LocationBeacon[] = [
  {
    id: 'chai_tapri',
    name: 'Batra Chai Tapri & Paranthe',
    hindiName: 'बत्रा चाय टपरी',
    coords: [-4, 0, 2],
    color: 0xff6b00,
    aspirantsOnline: 1420,
    vibe: 'Late night discussion, cutting chai, paper leaks debate',
    soundPreset: 'chai_rain',
  },
  {
    id: 'study_library',
    name: 'Karol Bagh 24/7 Silent Reading Room',
    hindiName: '24 घंटे साइलेंट लाइब्रेरी',
    coords: [3, 0, -3],
    color: 0x10b981,
    aspirantsOnline: 2180,
    vibe: 'Heavy air cooler hum, page turning, intense focus',
    soundPreset: 'late_night_cp',
  },
  {
    id: 'metro_station',
    name: 'GTB Nagar Yellow Line Metro Gate 2',
    hindiName: 'जीटीबी नगर मेट्रो गेट 2',
    coords: [-2, 0, -4],
    color: 0xfacc15,
    aspirantsOnline: 940,
    vibe: 'Announcements, auto rickshaw horns, rushing crowds',
    soundPreset: 'metro_lofi',
  },
  {
    id: 'north_campus',
    name: 'North Campus Arts Faculty Lawns',
    hindiName: 'आर्ट्स फैकल्टी लॉन',
    coords: [4, 0, 3],
    color: 0x38bdf8,
    aspirantsOnline: 670,
    vibe: 'Winter sun, group notes exchange, gentle wind',
    soundPreset: 'theta_432',
  },
];

export const SpatialCityMap3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBeacon, setSelectedBeacon] = useState<LocationBeacon>(BEACONS[0]);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const handleSelectBeacon = (beacon: LocationBeacon) => {
    setSelectedBeacon(beacon);
    if (navigator.vibrate) navigator.vibrate(30);
    ambientSoundEngine.play(beacon.soundPreset);
    setIsPlayingSound(true);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE & ISOMETRIC ORTHOGRAPHIC / PERSPECTIVE HYBRID
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = 360;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(16, 18, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 1. 3D ISOMETRIC GRID & BASE GROUND
    const gridHelper = new THREE.GridHelper(24, 24, 0xff6b00, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 2. PROCEDURAL 3D CITY BLOCKS (Mukherjee Nagar Buildings)
    const buildingGroup = new THREE.Group();
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    
    // Low-poly modern dark buildings with glowing edges
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.6,
    });

    for (let x = -8; x <= 8; x += 2.5) {
      for (let z = -8; z <= 8; z += 2.5) {
        // Skip some spots for road grid & beacons
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
        if (Math.random() > 0.4) {
          const bHeight = Math.random() * 3.5 + 1.2;
          const building = new THREE.Mesh(buildingGeo, buildingMat);
          building.scale.set(1.8, bHeight, 1.8);
          building.position.set(x + (Math.random() - 0.5) * 0.4, bHeight / 2, z + (Math.random() - 0.5) * 0.4);
          building.castShadow = true;
          building.receiveShadow = true;

          // Wireframe edges
          const edges = new THREE.EdgesGeometry(buildingGeo);
          const line = new THREE.LineSegments(edges, edgeMat);
          line.scale.set(1.8, bHeight, 1.8);
          line.position.copy(building.position);

          buildingGroup.add(building);
          buildingGroup.add(line);
        }
      }
    }
    scene.add(buildingGroup);

    // 3. 3D INTERACTIVE AUDIO BEACONS WITH PULSING SONAR RINGS
    const beaconGroup = new THREE.Group();
    const beaconMeshes: { mesh: THREE.Mesh; ring: THREE.Mesh; beacon: LocationBeacon }[] = [];

    BEACONS.forEach((b) => {
      // 3D Diamond / Octahedron Floating Pin
      const pinGeo = new THREE.OctahedronGeometry(0.65, 0);
      const pinMat = new THREE.MeshStandardMaterial({
        color: b.color,
        emissive: b.color,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(b.coords[0], 2.8, b.coords[2]);
      beaconGroup.add(pinMesh);

      // Light beam vertical cylinder
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.4,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(b.coords[0], 1.4, b.coords[2]);
      beaconGroup.add(beam);

      // Ground Sonar Wave Ring
      const ringGeo = new THREE.RingGeometry(0.2, 0.35, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(b.coords[0], 0.02, b.coords[2]);
      beaconGroup.add(ringMesh);

      beaconMeshes.push({ mesh: pinMesh, ring: ringMesh, beacon: b });
    });

    scene.add(beaconGroup);

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff6b00, 1.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    cyanLight.position.set(-15, 10, -10);
    scene.add(cyanLight);

    // 5. MOUSE INTERACTION & RAYCASTING FOR BEACONS
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beaconMeshes.map((bm) => bm.mesh));

      if (intersects.length > 0) {
        const hit = beaconMeshes.find((bm) => bm.mesh === intersects[0].object);
        if (hit) {
          handleSelectBeacon(hit.beacon);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // RESIZE
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 600;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Gentle Orbit Rotation
      scene.rotation.y = Math.sin(time * 0.15) * 0.12;

      // Animate Beacons & Sonar Expanding Rings
      beaconMeshes.forEach((bm, i) => {
        bm.mesh.rotation.y = time * 1.5;
        bm.mesh.rotation.x = Math.sin(time * 2 + i) * 0.2;
        bm.mesh.position.y = 2.8 + Math.sin(time * 2.5 + i) * 0.25;

        // Sonar ring scale & fade
        const scale = ((time * 1.5 + i * 0.8) % 2) + 0.3;
        bm.ring.scale.set(scale * 3, scale * 3, 1);
        (bm.ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - scale / 2.2);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0e1322] to-[#07090e] border border-orange-500/30 shadow-2xl p-4 sm:p-6 space-y-4">
      
      {/* 3D HEADER & STATUS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-mono font-bold uppercase">
              <Sparkles className="w-3 h-3" />
              <span>3D Spatial Soundscape Matrix</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight font-display">
              Delhi NCR Live Audio Beacons
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-2xl border border-emerald-500/40">
          <Users className="w-3.5 h-3.5 animate-bounce" />
          <span>3,840+ Aspirants Listening Live</span>
        </div>
      </div>

      {/* 3D THREE.JS CANVAS CONTAINER */}
      <div
        ref={containerRef}
        className="w-full h-[360px] rounded-2xl overflow-hidden relative cursor-pointer border border-slate-800/80 bg-[#07090e]/60"
        title="Click on any glowing 3D beacon to tune into that location's ambient audio"
      >
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-slate-300 pointer-events-none">
          ✦ Click any 3D beacon to tune in
        </div>
      </div>

      {/* BEACON DETAILS & PLAYBACK CARD */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-orange-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <h4 className="text-base font-black text-white font-display">
              {selectedBeacon.name} <span className="text-xs text-orange-400/80 font-normal">({selectedBeacon.hindiName})</span>
            </h4>
          </div>
          <p className="text-xs text-slate-300">{selectedBeacon.vibe}</p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
            <span className="text-emerald-400 font-bold">● {selectedBeacon.aspirantsOnline} in this node</span>
            <span>• Procedural Web Audio 48kHz</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSelectBeacon(selectedBeacon)}
          className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
            isPlayingSound
              ? 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingSound ? 'Tuned In Live ✓' : 'Tune Into Soundscape'}</span>
        </button>
      </div>

    </div>
  );
};
