import React, { useEffect, useRef } from 'react';

interface AmbientOrbProps {
  isUserSpeaking: boolean;
  isPersonaSpeaking: boolean;
  isThinking?: boolean;
  audioLevel: number; // 0 to 100
  colorScheme?: 'amber' | 'blue' | 'rose' | 'purple' | 'cyan' | 'emerald' | string;
  size?: number;
}

export const AmbientOrb: React.FC<AmbientOrbProps> = ({
  isUserSpeaking,
  isPersonaSpeaking,
  isThinking = false,
  audioLevel,
  colorScheme = 'amber',
  size = 320,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedAudioRef = useRef(0);
  const phaseRef = useRef(0);

  // Derive palette based on colorScheme or avatar
  const getThemePalette = () => {
    switch (colorScheme) {
      case 'blue':
      case 'cyan':
        return {
          core: 'rgba(56, 189, 248, 0.95)',
          mid: 'rgba(14, 165, 233, 0.5)',
          outer: 'rgba(2, 132, 199, 0.15)',
          particle: 'rgba(186, 230, 253, 0.8)',
          accentGlow: 'rgba(56, 189, 248, 0.4)',
        };
      case 'rose':
      case 'pink':
        return {
          core: 'rgba(244, 63, 94, 0.95)',
          mid: 'rgba(225, 29, 72, 0.5)',
          outer: 'rgba(190, 18, 60, 0.15)',
          particle: 'rgba(254, 205, 211, 0.8)',
          accentGlow: 'rgba(244, 63, 94, 0.4)',
        };
      case 'purple':
        return {
          core: 'rgba(168, 85, 247, 0.95)',
          mid: 'rgba(147, 51, 234, 0.5)',
          outer: 'rgba(126, 34, 206, 0.15)',
          particle: 'rgba(233, 213, 255, 0.8)',
          accentGlow: 'rgba(168, 85, 247, 0.4)',
        };
      case 'emerald':
      case 'green':
        return {
          core: 'rgba(52, 211, 153, 0.95)',
          mid: 'rgba(16, 185, 129, 0.5)',
          outer: 'rgba(5, 150, 105, 0.15)',
          particle: 'rgba(167, 243, 208, 0.8)',
          accentGlow: 'rgba(52, 211, 153, 0.4)',
        };
      case 'amber':
      case 'orange':
      default:
        return {
          core: 'rgba(245, 158, 11, 0.95)',
          mid: 'rgba(217, 119, 6, 0.5)',
          outer: 'rgba(180, 83, 9, 0.15)',
          particle: 'rgba(254, 243, 199, 0.8)',
          accentGlow: 'rgba(245, 158, 11, 0.4)',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Particles system inside orb
    const particleCount = 45;
    const particles: Array<{
      angle: number;
      distance: number;
      speed: number;
      size: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * (size * 0.42),
        speed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Smooth audio response with lerp
      const targetAudio = isUserSpeaking || isPersonaSpeaking ? Math.max(audioLevel, 25) : 0;
      smoothedAudioRef.current += (targetAudio - smoothedAudioRef.current) * 0.15;
      const audioMultiplier = smoothedAudioRef.current / 100;

      phaseRef.current += 0.03 + (isPersonaSpeaking || isUserSpeaking ? 0.04 : 0);
      const phase = phaseRef.current;

      const palette = getThemePalette();

      // 1. Ambient Background Halo
      const haloRadius = (size * 0.45) * (1 + audioMultiplier * 0.35 + Math.sin(phase * 0.8) * 0.05);
      const haloGrad = ctx.createRadialGradient(centerX, centerY, size * 0.1, centerX, centerY, haloRadius);
      haloGrad.addColorStop(0, palette.mid);
      haloGrad.addColorStop(0.6, palette.outer);
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Harmonic Fluid Wave Mesh Rings
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const baseRadius = (size * 0.28) + (r * 18);
        const points = 60;
        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const harmonic1 = Math.sin(angle * 4 + phase + r) * (8 + audioMultiplier * 24);
          const harmonic2 = Math.cos(angle * 6 - phase * 1.5) * (4 + audioMultiplier * 16);
          const harmonic3 = Math.sin(angle * 2 + phase * 0.5) * (6 + (isThinking ? 12 : 0));
          
          const currentRadius = baseRadius + harmonic1 + harmonic2 + harmonic3;
          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = r === 0 ? palette.core : r === 1 ? palette.mid : palette.outer;
        ctx.lineWidth = r === 0 ? 2.5 : 1.5;
        ctx.shadowColor = palette.accentGlow;
        ctx.shadowBlur = 15;
        ctx.stroke();
      }

      // Reset shadow for inner elements
      ctx.shadowBlur = 0;

      // 3. Floating Organic Particles
      particles.forEach((p) => {
        p.angle += p.speed * (1 + audioMultiplier * 1.5);
        const currentDist = p.distance * (1 + audioMultiplier * 0.4 + Math.sin(phase + p.angle) * 0.1);
        const px = centerX + Math.cos(p.angle) * currentDist;
        const py = centerY + Math.sin(p.angle) * currentDist;

        ctx.fillStyle = palette.particle;
        ctx.globalAlpha = p.opacity * (0.6 + audioMultiplier * 0.4);
        ctx.beginPath();
        ctx.arc(px, py, p.size * (1 + audioMultiplier * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 4. Central Glowing Core (Nucleus)
      const coreRadius = (size * 0.18) * (1 + audioMultiplier * 0.4 + Math.sin(phase * 1.2) * 0.06);
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.3, palette.core);
      coreGrad.addColorStop(0.8, palette.mid);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Active Ripple Shockwaves on Voice Spikes
      if (audioMultiplier > 0.4) {
        const shockRadius = (size * 0.48) * (audioMultiplier);
        ctx.strokeStyle = palette.particle;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5 - audioMultiplier * 0.3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isUserSpeaking, isPersonaSpeaking, isThinking, audioLevel, colorScheme, size]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{ width: size, height: size }}
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
};
