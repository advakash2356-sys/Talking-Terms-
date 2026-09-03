import React, { useState } from 'react';
import { Search, Flame, Shield, Filter, Volume2, Sparkles, Zap, Radio, Headphones, Coffee, BookOpen, Heart, LifeBuoy } from 'lucide-react';
import { Persona, PersonaCategory } from '../types';
import { PERSONAS_DATA } from '../data/personas';
import { PersonaCard } from './PersonaCard';
import { VibeQuizModal } from './VibeQuizModal';
import { QuickStartBar } from './QuickStartBar';
import { CrisisHelplineModal } from './CrisisHelplineModal';
import { HeroFloating3D } from './3d/HeroFloating3D';

interface PersonaGridProps {
  onConnectCall: (persona: Persona) => void;
}

export const PersonaGrid: React.FC<PersonaGridProps> = ({ onConnectCall }) => {
  const [filter, setFilter] = useState<PersonaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);
  const [showVibeQuiz, setShowVibeQuiz] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  // Audio Preview handler using Browser Web Speech Synthesis
  const playPreview = (persona: Persona) => {
    setPlayingPreviewId(persona.id);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(persona.greetingMessage);
      utterance.rate = 0.95;
      utterance.pitch = persona.cat === 'female' ? 1.1 : persona.cat === 'lgbtq' ? 1.05 : 0.9;
      utterance.lang = 'hi-IN';

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) utterance.voice = hindiVoice;
      
      utterance.onend = () => {
        setPlayingPreviewId(null);
      };
      utterance.onerror = () => {
        setPlayingPreviewId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setPlayingPreviewId(null);
      }, 3000);
    }
  };

  const handleSelectFromQuiz = (personaId: string) => {
    const found = PERSONAS_DATA.find((p) => p.id === personaId) || PERSONAS_DATA[0];
    onConnectCall(found);
  };

  // Filter logic
  const filteredPersonas = PERSONAS_DATA.filter((p) => {
    const matchesCategory = filter === 'all' ? true : p.cat === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.vibe.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-16 animate-in fade-in duration-300">
      
      {/* 5-SECOND VIBE QUIZ MODAL */}
      <VibeQuizModal
        isOpen={showVibeQuiz}
        onClose={() => setShowVibeQuiz(false)}
        onSelectPersona={handleSelectFromQuiz}
      />

      {/* CRISIS HELPLINE MODAL */}
      <CrisisHelplineModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* 1-TAP QUICK-START VENT BAR */}
      <QuickStartBar
        onQuickConnect={(p) => onConnectCall(p)}
        onOpenQuiz={() => setShowVibeQuiz(true)}
        onOpenHelpline={() => setShowCrisisModal(true)}
      />

      {/* HERO BANNER */}
      <div
        className="bg-gradient-to-r from-orange-950/60 via-[#0d1322] to-amber-950/60 border-2 border-orange-500/30 rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          
          {/* Text & Action Callout */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-orange-400 text-[11px] sm:text-xs font-bold font-mono uppercase tracking-wider">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-md shadow-orange-500/50"></span>
              </span>
              <span>20 Real-Time Delhi NCR Personas Available</span>
            </div>
            
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
              Anonymous Voice Offloading & Peer Calls 🔥
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Authentic vernacular Hinglish peers trained on Cyber City burnout, Mukherjee Nagar UPSC attempts, and North Campus heartbreaks. 100% anonymous with zero logs.
            </p>

            {/* Tactile Action Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-[10px] sm:text-[11px] font-mono text-orange-300">
                <Coffee className="w-3 h-3 text-amber-400" />
                <span>Batra Tapri Chai Mode</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[10px] sm:text-[11px] font-mono text-cyan-300">
                <Headphones className="w-3 h-3 text-cyan-400" />
                <span>Spatial Soundscapes</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[10px] sm:text-[11px] font-mono text-emerald-300">
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>UPSC & Corporate Vents</span>
              </div>
            </div>

            {/* VIBE MATCHER CALLOUT BUTTON */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVibeQuiz(true)}
                className="min-h-[46px] px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>5-Sec Vibe Matcher</span>
              </button>

              <div className="bg-slate-950/80 border border-emerald-500/40 p-2.5 sm:p-3 rounded-2xl flex items-center gap-2.5 shrink-0 shadow-lg">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Ghost Mode Shield</p>
                  <p className="text-slate-400 text-[10px] font-mono">Zero logs • Audio wiped instantly</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3D WebGL Floating Interactive Artifacts Showcase (Desktop only to conserve mobile battery) */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <HeroFloating3D />
          </div>

        </div>
      </div>


      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        
        {/* CATEGORY TABS */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 no-scrollbar">
          {(['all', 'male', 'female', 'lgbtq'] as PersonaCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`min-h-[42px] px-4 sm:px-5 py-2 rounded-2xl text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap ${
                filter === cat
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All (20)' : cat === 'lgbtq' ? 'LGBTQ+ (4)' : `${cat} (${PERSONAS_DATA.filter(p => p.cat === cat).length})`}
            </button>
          ))}
        </div>

        {/* SEARCH FIELD */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, PG, tag, area..."
            className="w-full min-h-[44px] bg-slate-900/90 border border-slate-800 focus:border-orange-500 rounded-2xl pl-10 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* PERSONA GRID */}
      {filteredPersonas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isPlayingPreview={playingPreviewId === persona.id}
              onPlayPreview={playPreview}
              onConnectCall={onConnectCall}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <Filter className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No persona matches your search criteria.</p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 text-slate-950 font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};

