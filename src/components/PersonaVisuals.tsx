import React, { useState, useEffect, useRef } from 'react';
import { Persona, PersonaEmotion } from '../types';
import { getPersonaExpressions, preloadPersonaExpressions } from '../utils/personaSprites';
import { Sparkles, Heart, Compass } from 'lucide-react';

export interface PersonaVisualsProps {
  activePersona: Persona;
  currentEmotion?: PersonaEmotion | 'empathetic' | 'reassuring' | 'neutral' | 'serious' | 'joyful' | string;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  isThinking?: boolean;
  audioLevel?: number;
  size?: number;
  showEmotionBadge?: boolean;
  className?: string;
}

/**
 * PersonaVisuals: Multi-state Discrete Expression Sprite System
 * Supports (Neutral, Empathetic / Serious, Reassuring / Joyful) states
 * with 300ms CSS cross-fades and a 4-second hysteresis stabilization buffer.
 */
export const PersonaVisuals: React.FC<PersonaVisualsProps> = ({
  activePersona,
  currentEmotion = 'neutral',
  isSpeaking,
  isUserSpeaking,
  isThinking = false,
  audioLevel = 0,
  size = 250,
  showEmotionBadge = true,
  className = '',
}) => {
  // Normalize incoming emotion strings (e.g., 'empathetic' -> 'serious', 'reassuring' -> 'joyful')
  const normalizeEmotion = (em?: string): 'neutral' | 'serious' | 'joyful' => {
    if (!em) return 'neutral';
    const lower = em.toLowerCase();
    if (lower === 'empathetic' || lower === 'serious') return 'serious';
    if (lower === 'reassuring' || lower === 'joyful' || lower === 'warm') return 'joyful';
    return 'neutral';
  };

  const targetEmotion = normalizeEmotion(currentEmotion);
  const [displayedEmotion, setDisplayedEmotion] = useState<'neutral' | 'serious' | 'joyful'>('neutral');
  
  // 4-Second (4000ms) Hysteresis Buffer Tracking
  const lastEmotionChangeTimeRef = useRef<number>(Date.now());
  const pendingEmotionRef = useRef<'neutral' | 'serious' | 'joyful' | null>(null);
  const hysteresisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload persona expressions into DOM image memory on mount / persona swap
  useEffect(() => {
    if (activePersona?.id && activePersona?.name) {
      preloadPersonaExpressions(activePersona.id, activePersona.name);
    }
  }, [activePersona?.id, activePersona?.name]);

  // Hysteresis Stabilization Buffer logic: minimum 4000ms hold per emotion state
  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastEmotionChangeTimeRef.current;
    const HYSTERESIS_MIN_HOLD_MS = 4000;

    if (targetEmotion === displayedEmotion) {
      pendingEmotionRef.current = null;
      if (hysteresisTimeoutRef.current) {
        clearTimeout(hysteresisTimeoutRef.current);
      }
      return;
    }

    if (elapsed >= HYSTERESIS_MIN_HOLD_MS) {
      // Minimum hold satisfied: apply transition immediately
      setDisplayedEmotion(targetEmotion);
      lastEmotionChangeTimeRef.current = now;
      pendingEmotionRef.current = null;
      if (hysteresisTimeoutRef.current) {
        clearTimeout(hysteresisTimeoutRef.current);
      }
    } else {
      // Buffer active: queue target emotion until 4-second hold timer expires
      pendingEmotionRef.current = targetEmotion;
      if (hysteresisTimeoutRef.current) {
        clearTimeout(hysteresisTimeoutRef.current);
      }
      const remainingTime = HYSTERESIS_MIN_HOLD_MS - elapsed;
      hysteresisTimeoutRef.current = setTimeout(() => {
        if (pendingEmotionRef.current) {
          setDisplayedEmotion(pendingEmotionRef.current);
          lastEmotionChangeTimeRef.current = Date.now();
          pendingEmotionRef.current = null;
        }
      }, remainingTime);
    }

    return () => {
      if (hysteresisTimeoutRef.current) {
        clearTimeout(hysteresisTimeoutRef.current);
      }
    };
  }, [targetEmotion, displayedEmotion]);

  const expressions = activePersona.expressions || getPersonaExpressions(activePersona.id, activePersona.name);

  // Visual Metadata for Emotion States
  const getEmotionMetadata = (em: 'neutral' | 'serious' | 'joyful') => {
    switch (em) {
      case 'serious':
        return {
          label: 'Empathetic Attentiveness',
          shortLabel: 'Empathetic',
          cue: 'Softened eyes, attentive posture',
          icon: Heart,
          badgeColor: 'bg-purple-950/85 text-purple-300 border-purple-500/40 shadow-purple-950/50',
          glowRing: 'ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/15',
          glowColor: 'rgba(168, 85, 247, 0.25)',
        };
      case 'joyful':
        return {
          label: 'Reassuring & Warm',
          shortLabel: 'Reassuring',
          cue: 'Warm smile, comforting uplift',
          icon: Sparkles,
          badgeColor: 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50',
          glowRing: 'ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/15',
          glowColor: 'rgba(52, 211, 153, 0.25)',
        };
      case 'neutral':
      default:
        return {
          label: 'Grounded & Listening',
          shortLabel: 'Neutral',
          cue: 'Attentive, steady focus',
          icon: Compass,
          badgeColor: 'bg-amber-950/85 text-amber-300 border-amber-500/40 shadow-amber-950/50',
          glowRing: 'ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/15',
          glowColor: 'rgba(245, 158, 11, 0.2)',
        };
    }
  };

  const meta = getEmotionMetadata(displayedEmotion);
  const IconComponent = meta.icon;

  // Audio-reactive scale feedback during speech
  const scaleMultiplier = isSpeaking ? 1 + Math.min(0.08, (audioLevel / 100) * 0.08) : 1;

  return (
    <div
      style={{ perspective: 1000 }}
      className={`flex flex-col items-center justify-center select-none relative group ${className}`}
      id="persona-visuals-container"
    >
      {/* 3D FLOATING HOLOGRAPHIC HALO & ORBITS */}
      <div
        className={`relative rounded-3xl transition-all duration-300 ease-out flex items-center justify-center ${meta.glowRing}`}
        style={{
          width: size + 24,
          height: size + 24,
          transform: `scale(${scaleMultiplier}) translateZ(20px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Animated 3D Ripple Torus for Persona Voice Activity */}
        {isSpeaking && (
          <div
            className="absolute inset-0 rounded-3xl animate-ping opacity-30 pointer-events-none"
            style={{ backgroundColor: meta.glowColor }}
          />
        )}

        {/* 3D Ambient Ring for Caller/User Speech VAD */}
        {isUserSpeaking && (
          <div className="absolute -inset-3 rounded-3xl border-2 border-emerald-400/80 animate-pulse pointer-events-none shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
        )}

        {/* Dynamic 3D Thinking Spinner Ring */}
        {isThinking && (
          <div className="absolute -inset-4 rounded-3xl border-2 border-dashed border-cyan-400 animate-spin pointer-events-none duration-1000 shadow-[0_0_25px_rgba(56,189,248,0.5)]" />
        )}

        {/* 3D Portrait Sprite Container with Glass Bevel */}
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-orange-500/60 bg-[#0B0F19] shadow-[0_20px_50px_rgba(0,0,0,0.9)] transform hover:scale-105 transition-transform duration-300"
          style={{ width: size, height: size, transform: 'translateZ(30px)' }}
          id="persona-visuals-sprite-layer"
        >
          {/* Multi-State Discrete Expression Sprite Layers with 300ms CSS Cross-Fade */}
          {(['neutral', 'serious', 'joyful'] as const).map((emotionKey) => {
            const isCurrent = displayedEmotion === emotionKey;
            const src = expressions[emotionKey];
            return (
              <img
                key={emotionKey}
                src={src}
                alt={`${activePersona.name} (${emotionKey} expression)`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out pointer-events-none will-change-[opacity] ${
                  isCurrent ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95'
                }`}
                referrerPolicy="no-referrer"
                loading="eager"
              />
            );
          })}

          {/* Dynamic 3D Glass Specular Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-white/25 pointer-events-none mix-blend-overlay z-20" />

          {/* Initial Avatar Fallback */}
          <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl text-white/20 -z-10">
            {activePersona.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Dynamic 3D Emotion Badge with Hysteresis Stability */}
      {showEmotionBadge && (
        <div
          style={{ transform: 'translateZ(40px)' }}
          className="mt-4 animate-in fade-in duration-300"
          id="persona-visuals-badge"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono shadow-xl transition-all duration-300 ${meta.badgeColor}`}
          >
            <IconComponent className="w-4 h-4 animate-pulse" />
            <span className="font-bold tracking-wide">{meta.label}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaVisuals;
