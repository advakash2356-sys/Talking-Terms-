import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Phone, MapPin, Sparkles, Smile, Radio, Flame, CheckCircle2 } from 'lucide-react';
import { Persona, PersonaEmotion } from '../types';
import { getPersonaExpressions } from '../utils/personaSprites';
import { Avatar3DFrame } from './3d/Avatar3DFrame';

interface PersonaCardProps {
  persona: Persona;
  isPlayingPreview: boolean;
  onPlayPreview: (persona: Persona) => void;
  onConnectCall: (persona: Persona) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  isPlayingPreview,
  onPlayPreview,
  onConnectCall,
}) => {
  const [hoverEmotion, setHoverEmotion] = useState<PersonaEmotion>('neutral');
  const [isCardHovered, setIsCardHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    }
  }, []);

  const expressions = persona.expressions || getPersonaExpressions(persona.id, persona.name);
  const isHighDemand = persona.id === 'kabir_upsc' || persona.id === 'rohan_techie' || persona.id === 'sunita_homemaker';

  // 3D Parallax Tilt Handler (active on desktop mouse pointer, disabled on touch/mobile)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.3,
    });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsCardHovered(true);
  };

  const handleMouseLeave = () => {
    setIsCardHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'male':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/20';
      case 'female':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20';
      case 'lgbtq':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20';
    }
  };

  const getPersonaThemeColor = () => {
    switch (persona.cat) {
      case 'male':
        return '#38bdf8';
      case 'female':
        return '#f43f5e';
      case 'lgbtq':
        return '#c084fc';
      default:
        return '#ff6b00';
    }
  };

  return (
    <div
      style={{ perspective: isTouchDevice ? 'none' : 1200 }}
      className="w-full h-full select-none"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isTouchDevice
            ? 'none'
            : `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isCardHovered ? 15 : 0}px)`,
          transformStyle: isTouchDevice ? 'flat' : 'preserve-3d',
          transition: 'transform 0.15s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease',
        }}
        className="bg-gradient-to-b from-[#0f172a]/95 via-[#0b0f19]/95 to-[#07090e]/95 border-2 border-slate-800 hover:border-orange-500/80 rounded-3xl p-4 sm:p-6 flex flex-col justify-between group hover:shadow-[0_20px_50px_rgba(255,107,0,0.2)] backdrop-blur-2xl relative overflow-hidden h-full transition-all"
      >
        
        {/* Dynamic 3D Glare Sheen Reflection (Desktop Only) */}
        {!isTouchDevice && (
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300 -z-0"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 107, 0, ${glarePos.opacity}), transparent 60%)`,
            }}
          />
        )}

        {/* Content Container */}
        <div>
          
          {/* AVATAR + HEADER */}
          <div className="flex justify-between items-start mb-3.5 gap-2.5">
            <div className="flex items-center gap-3">
              
              {/* Avatar Frame with Emotion Sprites */}
              <div
                onMouseEnter={() => setHoverEmotion('joyful')}
                onMouseLeave={() => setHoverEmotion('neutral')}
                title={`${persona.name} • Expressive dynamic avatar`}
                className="cursor-pointer shrink-0"
              >
                <Avatar3DFrame
                  size={56}
                  glowColor={getPersonaThemeColor()}
                  isSpeaking={isPlayingPreview}
                  isHovered={isCardHovered}
                >
                  {Object.entries(expressions).map(([emKey, src]) => (
                    <img
                      key={emKey}
                      src={src}
                      alt={`${persona.name} (${emKey})`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        hoverEmotion === emKey ? 'opacity-100' : 'opacity-0'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </Avatar3DFrame>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-orange-400 transition-colors font-display tracking-wide truncate">
                    {persona.name}
                  </h3>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border shadow-sm ${getCategoryBadge(persona.cat)} font-mono`}>
                    {persona.cat}
                  </span>
                </div>
                <p className="text-xs text-orange-400/90 font-medium flex items-center gap-1 font-mono truncate">
                  <span>{persona.title}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-semibold">Age {persona.age}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onPlayPreview(persona)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all shrink-0 shadow-lg active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isPlayingPreview
                  ? 'bg-orange-500 text-slate-950 border-orange-400 animate-pulse shadow-orange-500/50'
                  : 'bg-slate-950 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 border-slate-800 hover:border-orange-500/50'
              }`}
              title="Listen to 3-second Sample Voice Greeting"
              aria-label={`Preview voice of ${persona.name}`}
            >
              <Volume2 className={`w-4 h-4 ${isPlayingPreview ? 'animate-bounce fill-slate-950' : ''}`} />
            </button>
          </div>

          {/* PRESENCE & LOCATION BAR */}
          <div className="flex items-center justify-between text-[11px] mb-3 font-mono">
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/70 px-2.5 py-1 rounded-xl border border-slate-800/80">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate max-w-[120px] font-semibold">{persona.location}</span>
            </div>

            {isHighDemand ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-xl border border-amber-500/40 shadow-sm font-bold">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-bounce" />
                <span>Trending Peer</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-xl border border-emerald-500/40 shadow-sm font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Free to Talk</span>
              </span>
            )}
          </div>

          {/* VIBE DESCRIPTION */}
          <div className="p-3 rounded-2xl bg-[#070a12]/80 border border-slate-800/80 mb-3 group-hover:border-orange-500/30 transition-colors">
            <p className="text-slate-200 text-xs leading-relaxed line-clamp-2 italic font-sans">
              "{persona.vibe}"
            </p>
          </div>

          {/* TAGS */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {persona.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-slate-950 text-slate-200 hover:text-orange-300 text-[10px] px-2 py-0.5 rounded-xl border border-slate-800 hover:border-orange-500/50 font-medium font-mono transition-all"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* CALL TRIGGER BUTTON */}
        <div>
          <button
            type="button"
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(35);
              onConnectCall(persona);
            }}
            className="w-full min-h-[46px] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(255,107,0,0.3)] hover:shadow-[0_15px_35px_rgba(255,107,0,0.45)] transition-all active:scale-[0.96] text-xs uppercase tracking-wider font-display"
          >
            <Phone className="w-4 h-4 fill-slate-950 shrink-0" />
            <span>Start Live Voice Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};



