import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Coffee,
  Heart,
  Briefcase,
  Zap,
  Laugh,
  X,
  ArrowRight,
  Radio
} from 'lucide-react';
import { Persona } from '../types';

interface VibeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (personaId: string) => void;
}

export const VibeQuizModal: React.FC<VibeQuizModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);

  if (!isOpen) return null;

  const vibes = [
    {
      id: 'upsc_burnout',
      title: 'UPSC / Exam Panic 📚',
      desc: '12-hour library cubicle stress, mock score anxiety, PG loneliness.',
      personaId: 'kabir_upsc',
      personaName: 'Kabir',
      tag: 'Mukherjee Nagar Hero',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300',
    },
    {
      id: 'corporate_burnout',
      title: 'Manager / Sprint Burnout 💼',
      desc: 'Work chat pings on weekends, toxic reviews, golden handcuffs in Cyber Hub.',
      personaId: 'rohan_techie',
      personaName: 'Rohan',
      tag: 'Cyber City Pragmatist',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-300',
    },
    {
      id: 'maternal_hug',
      title: 'Need a Warm Hug & Healing ❤️',
      desc: 'Crying alone in your room, world feels too cruel, need unconditional love.',
      personaId: 'sunita_homemaker',
      personaName: 'Sunita Ji',
      tag: 'Maternal Warmth',
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/50 text-rose-300',
    },
    {
      id: 'college_heartbreak',
      title: 'DU Drama & Relationship Vent 💔',
      desc: 'Ghosted by a match, fest drama, peer pressure in North Campus.',
      personaId: 'aarav_du',
      personaName: 'Aarav',
      tag: 'DU North Campus Peer',
      color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50 text-yellow-300',
    },
    {
      id: 'lgbtq_safespace',
      title: 'Queer & Creative Safe Space 🌈',
      desc: 'Coming out anxiety, family masking fatigue, need 100% judgment-free ear.',
      personaId: 'alex_dei',
      personaName: 'Alex / Sasha',
      tag: 'Hauz Khas Safe Haven',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-300',
    },
    {
      id: 'career_negotiation',
      title: 'Career Crossroads & Appraisal 🎯',
      desc: 'Underpaid, imposter syndrome, need sharp executive perspective.',
      personaId: 'meera_hr',
      personaName: 'Meera',
      tag: 'Corporate HR Leader',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/50 text-purple-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in">
      <div className="bg-[#0b0f19] border border-orange-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden">
        
        {/* Ambient background blur */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-Second Vibe Matcher</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              What's heavy on your mind right now?
            </h2>
            <p className="text-xs text-slate-400">
              Pick your current headspace and we'll instantly connect you with the right peer voice.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Vibe Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {vibes.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                onSelectPersona(v.personaId);
                onClose();
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group hover:scale-[1.02] bg-gradient-to-br ${v.color}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    {v.tag}
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Talk</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  </span>
                </div>
                <h3 className="text-sm font-black text-white">{v.title}</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">{v.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>🔒 100% Anonymous • Zero Login</span>
          <button
            type="button"
            onClick={onClose}
            className="text-orange-400 hover:text-orange-300 font-bold"
          >
            Browse All 20 Personas →
          </button>
        </div>
      </div>
    </div>
  );
};
