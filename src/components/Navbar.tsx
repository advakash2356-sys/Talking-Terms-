import React, { useState } from 'react';
import {
  ShieldCheck,
  Mic,
  Server,
  UserCheck,
  Key,
  Zap,
  MapPin,
  Cpu,
  Lock,
  Headphones,
  Sparkles,
  Radio,
  Volume2,
  ChevronDown,
  Flame,
  X,
  Menu,
  Sliders,
  Bot,
  Activity,
  Terminal,
  AlertOctagon,
  Scale
} from 'lucide-react';
import { ShieldIdentity } from '../types';
import { ambientSoundEngine } from '../utils/ambientSynth';

interface NavbarProps {
  activeTab: 'voice-agent' | 'personas' | 'mukherjee' | 'voice-studio' | 'intelligence' | 'ceo' | 'listener' | 'shield' | 'docker' | 'feed' | 'diagnostic';
  setActiveTab: (tab: 'voice-agent' | 'personas' | 'mukherjee' | 'voice-studio' | 'intelligence' | 'ceo' | 'listener' | 'shield' | 'docker' | 'feed' | 'diagnostic') => void;
  identity: ShieldIdentity;
  onOpenShieldModal: () => void;
  onOpenVoiceCreditsModal: () => void;
  adminEmail: string;
  onOpenTelemetry?: () => void;
  onOpenCrisisHelpline?: () => void;
  onOpenLegalModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  identity,
  onOpenShieldModal,
  onOpenVoiceCreditsModal,
  adminEmail,
  onOpenCrisisHelpline,
  onOpenLegalModal,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  const toggleAmbientSound = () => {
    if (navigator.vibrate) navigator.vibrate(25);
    if (isAmbientPlaying) {
      ambientSoundEngine.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientSoundEngine.play('chai_rain');
      setIsAmbientPlaying(true);
    }
  };

  const handleTabClick = (tab: 'voice-agent' | 'personas' | 'mukherjee' | 'voice-studio' | 'intelligence' | 'ceo' | 'listener' | 'shield' | 'docker' | 'feed' | 'diagnostic') => {
    if (navigator.vibrate) navigator.vibrate(30);
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* TOP HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-[#07090e]/95 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* MAIN ROW */}
          <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2 sm:gap-4">
            
            {/* BRAND LOGO */}
            <div
              onClick={() => handleTabClick('personas')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-h-[44px]"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 p-[1.5px] shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 group-hover:text-amber-300 transition-colors" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090e] animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-display">
                    Talking <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Terms</span>
                  </h1>
                  <span className="hidden sm:inline-flex text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono">
                    Delhi NCR Voice
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block">
                  Anonymous Voice Offloading & Peer Audio Sanctuary
                </p>
              </div>
            </div>

            {/* RIGHT ACTION PILLS */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              
              {/* AMBIENT CHAI TAPRI SOUND TOGGLE */}
              <button
                type="button"
                onClick={toggleAmbientSound}
                className={`flex items-center gap-1.5 min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-mono font-bold transition-all ${
                  isAmbientPlaying
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/60 shadow-lg shadow-orange-500/20 animate-pulse'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
                title="Toggle Delhi Late-Night Rain on Tin Roof (Procedural Web Audio)"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isAmbientPlaying ? 'text-orange-400 animate-bounce' : ''}`} />
                <span className="hidden sm:inline">{isAmbientPlaying ? 'Rain ☕' : 'Chai Ambience'}</span>
              </button>

              {/* ENERGY SPARKS / BUY TOKENS */}
              <button
                type="button"
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(25);
                  onOpenVoiceCreditsModal();
                }}
                className="flex items-center gap-1.5 min-h-[40px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold transition-all shadow-md active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>{identity.blindTokenBalance}⚡</span>
                <span className="hidden sm:inline text-amber-400/80 font-normal">Sparks</span>
              </button>

              {/* GHOST SHIELD BADGE */}
              <button
                type="button"
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(25);
                  onOpenShieldModal();
                }}
                className="flex items-center gap-1.5 min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 text-xs font-mono font-bold transition-all active:scale-95 shadow-md"
                title="100% Anonymous: Zero PII, Ephemeral RAM Wiped"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ghost Shield</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </button>

              {/* EMERGENCY 24/7 CRISIS HELPLINE PILL */}
              {onOpenCrisisHelpline && (
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(35);
                    onOpenCrisisHelpline();
                  }}
                  className="flex items-center gap-1.5 min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 rounded-2xl bg-rose-950/50 hover:bg-rose-950/70 border border-rose-500/60 hover:border-rose-400 text-rose-300 text-xs font-mono font-bold transition-all active:scale-95 shadow-md"
                  title="24/7 National Emergency Crisis Helplines (Tele-MANAS 14416 / KIRAN)"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="hidden sm:inline font-bold">14416 SOS</span>
                </button>
              )}

              {/* MORE / DEV MENU (DESKTOP) */}
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-2xl text-xs font-mono font-bold transition-all ${
                    activeTab === 'ceo' || activeTab === 'listener' || activeTab === 'shield' || activeTab === 'docker' || activeTab === 'diagnostic'
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>Dev & Ops</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* DESKTOP POPUP MENU */}
                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0e1322] border border-slate-800 rounded-3xl p-2 shadow-2xl z-50 space-y-1 animate-fade-in">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 font-mono">
                      Administrative & Diagnostics
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTabClick('diagnostic')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-900/40 transition-colors text-left"
                    >
                      <Activity className="w-4 h-4 text-rose-400" />
                      <div>
                        <div>Audio Hardware Diagnostic</div>
                        <div className="text-[10px] text-slate-400">Persistent MediaRecorder trace</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabClick('ceo')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <Cpu className="w-4 h-4 text-orange-400" />
                      <div>
                        <div>CEO Supervisory Telemetry</div>
                        <div className="text-[10px] text-slate-500">Single-Admin RBAC metrics</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabClick('listener')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <Headphones className="w-4 h-4 text-purple-400" />
                      <div>
                        <div>Verified Listener Portal</div>
                        <div className="text-[10px] text-slate-500">Peer queue & training</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabClick('shield')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div>Argon2id WASM Shield</div>
                        <div className="text-[10px] text-slate-500">Zero-knowledge proof inspector</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabClick('docker')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <Server className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div>Docker Stack Configuration</div>
                        <div className="text-[10px] text-slate-500">Self-hosted compose specs</div>
                      </div>
                    </button>

                    {/* Crisis & Legal Links */}
                    <div className="pt-1 border-t border-slate-800/80 mt-1 space-y-1">
                      {onOpenCrisisHelpline && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMoreMenu(false);
                            onOpenCrisisHelpline();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/50 transition-colors text-left"
                        >
                          <AlertOctagon className="w-4 h-4 text-rose-400" />
                          <div>
                            <div>24/7 Crisis Helplines</div>
                            <div className="text-[10px] text-slate-500">Tele-MANAS 14416 / KIRAN</div>
                          </div>
                        </button>
                      )}

                      {onOpenLegalModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMoreMenu(false);
                            onOpenLegalModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                        >
                          <Scale className="w-4 h-4 text-amber-400" />
                          <div>
                            <div>Legal & DPDP 2023</div>
                            <div className="text-[10px] text-slate-500">Terms, Privacy & Medical Non-Claim</div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* DESKTOP SEGMENTED TABS (Hidden on Mobile) */}
          <div className="hidden md:flex items-center justify-between gap-2 py-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              
              <button
                type="button"
                onClick={() => handleTabClick('voice-agent')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'voice-agent'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amber-400" />
                <span>Voice Agent (Dadaji / Brother / AI)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('personas')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'personas'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Talk with Peers</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('mukherjee')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'mukherjee'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Mukherjee Nagar Hub</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('feed')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'feed'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Live Feed</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('intelligence')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'intelligence'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Voice Capture & Router</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('voice-studio')}
                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'voice-studio'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>TTS Studio</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('diagnostic')}
                className={`flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all uppercase tracking-wider ${
                  activeTab === 'diagnostic'
                    ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-900/80 text-rose-300 hover:text-white hover:bg-slate-850 border border-rose-900/50'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Diagnostic</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Anonymous & Private
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Thumb-First Ergonomics for Mobile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-2xl border-t border-slate-800/90 md:hidden pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.8)]"
      >
        <div className="grid grid-cols-5 items-center px-1 py-1.5 text-center">
          
          {/* TAB 1: VOICE AGENT */}
          <button
            type="button"
            onClick={() => handleTabClick('voice-agent')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all select-none min-h-[50px] ${
              activeTab === 'voice-agent'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className={`w-5 h-5 mb-1 ${activeTab === 'voice-agent' ? 'text-orange-400 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] leading-none font-medium">AI Agent</span>
          </button>

          {/* TAB 2: STUDIO */}
          <button
            type="button"
            onClick={() => handleTabClick('voice-studio')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all select-none min-h-[50px] ${
              activeTab === 'voice-studio'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-5 h-5 mb-1 ${activeTab === 'voice-studio' ? 'text-orange-400 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] leading-none font-medium">Studio</span>
          </button>

          {/* TAB 3: MUKHERJEE HUB */}
          <button
            type="button"
            onClick={() => handleTabClick('mukherjee')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all select-none min-h-[50px] ${
              activeTab === 'mukherjee'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className={`w-5 h-5 mb-1 ${activeTab === 'mukherjee' ? 'text-rose-400 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] leading-none font-medium">Hub</span>
          </button>

          {/* TAB 4: LIVE FEED */}
          <button
            type="button"
            onClick={() => handleTabClick('feed')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all select-none min-h-[50px] ${
              activeTab === 'feed'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-5 h-5 mb-1 ${activeTab === 'feed' ? 'text-orange-400 scale-110' : 'text-slate-400'}`} />
            <span className="text-[10px] leading-none font-medium">Feed</span>
          </button>

          {/* TAB 5: DEV & TOOLS / SHIELD */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all select-none min-h-[50px] ${
              showMoreMenu || activeTab === 'ceo' || activeTab === 'listener' || activeTab === 'shield' || activeTab === 'docker'
                ? 'text-purple-400 font-bold bg-purple-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-5 h-5 mb-1" />
            <span className="text-[10px] leading-none font-medium">Dev & Ops</span>
          </button>

        </div>

        {/* MOBILE DEV TOOLS POPUP DRAWER */}
        {showMoreMenu && (
          <div className="bg-[#0e1322] border-t border-slate-800 p-3 space-y-2 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between pb-1 text-[10px] uppercase font-bold text-slate-500 font-mono">
              <span>Operational Dashboards</span>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTabClick('diagnostic')}
                className="col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-xs text-left font-semibold text-rose-200 shadow-md"
              >
                <Activity className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Audio Hardware Diagnostic (Persistent Logs)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('intelligence')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-950/40 border border-orange-500/40 text-xs text-left font-semibold text-orange-200"
              >
                <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="truncate">Voice Capture</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('ceo')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left font-semibold text-slate-200"
              >
                <Cpu className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="truncate">CEO Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('listener')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left font-semibold text-slate-200"
              >
                <Headphones className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Listener Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('shield')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left font-semibold text-slate-200"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">WASM Shield</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('docker')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left font-semibold text-slate-200"
              >
                <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Docker Stack</span>
              </button>

              {onOpenCrisisHelpline && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenCrisisHelpline();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs text-left font-semibold text-rose-200 shadow-sm"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                  <span className="truncate">SOS Helplines (14416)</span>
                </button>
              )}

              {onOpenLegalModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenLegalModal();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left font-semibold text-amber-300"
                >
                  <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Legal & DPDP Notice</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};


