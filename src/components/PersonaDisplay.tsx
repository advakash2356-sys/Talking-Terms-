import React, { useState, useEffect, useRef } from 'react';
import { Persona, PersonaEmotion } from '../types';
import { getPersonaExpressions, preloadPersonaExpressions } from '../utils/personaSprites';
import { Sparkles, Heart, Compass } from 'lucide-react';

interface PersonaDisplayProps {
  activePersona: Persona;
  currentEmotion?: PersonaEmotion;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  isThinking?: boolean;
  audioLevel?: number;
  size?: number;
  showEmotionBadge?: boolean;
}

export const PersonaDisplay: React.FC<PersonaDisplayProps> = ({
  activePersona,
  currentEmotion = 'neutral',
  isSpeaking,
  isUserSpeaking,
  isThinking = false,
  audioLevel = 0,
  size = 240,
  showEmotionBadge = true,
}) => {
  const [displayedEmotion, setDisplayedEmotion] = useState<PersonaEmotion>('neutral');
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  // Hysteresis buffer tracking: enforce minimum 4000ms hold on any emotion change
  const lastEmotionChangeTimeRef = useRef<number>(Date.now());
  const pendingEmotionRef = useRef<PersonaEmotion | null>(null);
  const hysteresisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload expressions on mount or when active persona changes
  useEffect(() => {
    preloadPersonaExpressions(activePersona.id, activePersona.name);
  }, [activePersona.id, activePersona.name]);

  // Hysteresis buffer logic: min 4-second hold
  useEffect(() => {
    if (!currentEmotion) return;

    const now = Date.now();
    const elapsedSinceLastChange = now - lastEmotionChangeTimeRef.current;
    const HYSTERESIS_MIN_HOLD_MS = 4000;

    if (currentEmotion === displayedEmotion) {
      pendingEmotionRef.current = null;
      if (hysteresisTimeoutRef.current) {
        clearTimeout(hysteresisTimeoutRef.current);
      }
      return;
    }

    if (elapsedSinceLastChange >= HYSTERESIS_MIN_HOLD_MS) {
      // Hold duration satisfied, transition immediately
      setDisplayedEmotion(currentEmotion);
      lastEmotionChangeTimeRef.current = now;
      pendingEmotionRef.current = null;
    } else {
      // Store pending emotion and schedule transition when 4s hold expires
      pendingEmotionRef.current = currentEmotion;
      if (hysteresisTimeoutRef.current) {
        clearTimeout(hysteresisTimeoutRef.current);
      }
      const remainingTime = HYSTERESIS_MIN_HOLD_MS - elapsedSinceLastChange;
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
  }, [currentEmotion, displayedEmotion]);

  const expressions = activePersona.expressions || getPersonaExpressions(activePersona.id, activePersona.name);

  const getEmotionMetadata = (em: PersonaEmotion) => {
    switch (em) {
      case 'serious':
        return {
          label: 'Empathetic Attentiveness',
          shortLabel: 'Deep Empathy',
          cue: 'Softened eyes, attentive tilt',
          icon: Heart,
          badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
          glowRing: 'ring-purple-500/40 shadow-purple-500/20',
          textColor: 'text-purple-400',
        };
      case 'joyful':
        return {
          label: 'Reassuring & Warm',
          shortLabel: 'Warm Smile',
          cue: 'Warm smile, relaxed gaze',
          icon: Sparkles,
          badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          glowRing: 'ring-emerald-500/40 shadow-emerald-500/20',
          textColor: 'text-emerald-400',
        };
      case 'neutral':
      default:
        return {
          label: 'Grounded & Listening',
          shortLabel: 'Active Listening',
          cue: 'Calm, focused presence',
          icon: Compass,
          badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          glowRing: 'ring-amber-500/40 shadow-amber-500/20',
          textColor: 'text-amber-400',
        };
    }
  };

  const meta = getEmotionMetadata(displayedEmotion);
  const IconComponent = meta.icon;

  // Visual pulse / dynamic scale based on voice audio level
  const scaleMultiplier = isSpeaking ? 1 + (audioLevel / 100) * 0.05 : 1;

  return (
    <div className="flex flex-col items-center justify-center select-none relative group">
      {/* Outer Halo Glow based on voice activity & emotion */}
      <div
        className={`relative rounded-full transition-all duration-300 ease-out flex items-center justify-center ${meta.glowRing}`}
        style={{
          width: size + 16,
          height: size + 16,
          transform: `scale(${scaleMultiplier})`,
        }}
      >
        {/* Active Speech Ripple Rings */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-amber-400 pointer-events-none" />
        )}
        {isUserSpeaking && (
          <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/50 animate-pulse pointer-events-none" />
        )}
        {isThinking && (
          <div className="absolute -inset-3 rounded-full border border-dashed border-cyan-400/60 animate-spin pointer-events-none duration-1000" />
        )}

        {/* Inner Portrait Container */}
        <div
          className="relative rounded-full overflow-hidden border-2 border-slate-700/80 bg-[#0B0F19] shadow-2xl"
          style={{ width: size, height: size }}
        >
          {/* Multi-State Discrete Expression Sprite Layer with 300ms CSS Cross-Fade */}
          {Object.entries(expressions).map(([key, src]) => {
            const isCurrent = displayedEmotion === key;
            return (
              <img
                key={key}
                src={src}
                alt={`${activePersona.name} (${key} expression)`}
                onLoad={() => setLoadedImages((prev) => ({ ...prev, [key]: true }))}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out pointer-events-none ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                referrerPolicy="no-referrer"
              />
            );
          })}

          {/* Fallback avatar initial while SVG data parses */}
          <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl text-white/30 -z-10">
            {activePersona.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Dynamic Emotion Badge with Hysteresis Stability */}
      {showEmotionBadge && (
        <div className="mt-3 animate-in fade-in duration-300">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono shadow-lg transition-colors duration-300 ${meta.badgeColor}`}
          >
            <IconComponent className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-semibold">{meta.label}</span>
          </div>
        </div>
      )}
    </div>
  );
};
