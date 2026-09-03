import React from 'react';
import { Sparkles, Phone, ShieldCheck, Heart, Zap, Coffee } from 'lucide-react';
import { Persona } from '../types';
import { PERSONAS_DATA } from '../data/personas';

interface QuickStartBarProps {
  onQuickConnect: (persona: Persona) => void;
  onOpenQuiz: () => void;
  onOpenHelpline: () => void;
}

export const QuickStartBar: React.FC<QuickStartBarProps> = ({
  onQuickConnect,
  onOpenQuiz,
  onOpenHelpline,
}) => {
  // Top 4 distinct popular personas for instant 1-tap call
  const targetIds = ['kabir_upsc', 'rohan_techie', 'simran_cabin_crew', 'sunita_homemaker'];
  const featuredPersonas = targetIds
    .map((id) => PERSONAS_DATA.find((p) => p.id === id))
    .filter((p): p is Persona => p !== undefined);

  return (
    <div className="bg-gradient-to-r from-orange-950/40 via-slate-900/90 to-amber-950/40 border border-orange-500/30 rounded-3xl p-3.5 sm:p-5 mb-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Zap className="w-4 h-4 fill-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-display">1-Tap Instant Voice Vent</h3>
            <p className="text-[11px] text-slate-400">No login, no typing — tap a peer to start talking immediately</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            type="button"
            onClick={onOpenQuiz}
            className="flex-1 md:flex-initial min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Match Me in 5s</span>
          </button>
          <button
            type="button"
            onClick={onOpenHelpline}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
            title="Crisis SOS & Direct Helpline Numbers"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">SOS Help</span>
          </button>
        </div>
      </div>

      {/* 4 FAST DIAL CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {featuredPersonas.map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(30);
              onQuickConnect(persona);
            }}
            className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-orange-500/15 border border-slate-800 hover:border-orange-500/60 text-left transition-all group flex items-center justify-between min-h-[52px]"
          >
            <div className="min-w-0 pr-1.5">
              <div className="text-xs font-black text-white group-hover:text-orange-400 transition-colors truncate">
                {persona.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {persona.title}
              </div>
            </div>
            <div className="w-7 h-7 rounded-xl bg-orange-500/10 group-hover:bg-orange-500 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:text-slate-950 transition-all shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
