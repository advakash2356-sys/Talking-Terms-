import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Play,
  Square,
  Volume2,
  Zap,
  Star,
  Flame,
  ArrowRight,
  Music,
  Globe2,
  Mic2,
  CheckCircle2,
  Headphones,
  Copy,
  Check
} from 'lucide-react';
import { AudioRibbon3D } from './3d/AudioRibbon3D';
import { VoicePitchModulator } from './VoicePitchModulator';

/* ==========================================================================
   1. LOCALIZED MOCK DATA REPOSITORY
   ========================================================================== */

interface VoiceTone {
  id: string;
  name: string;
  badge: string;
  region: string;
  desc: string;
  vibe: string;
  rate: number;
  pitch: number;
}

const LOCAL_LANGUAGES = [
  { id: 'hinglish', label: 'Hinglish', icon: '🇮🇳', tag: 'NCR Trending', sample: "Bhai, tension bilkul mat le! Presentation ekdum solid banegi. Studio AI voice ready hai!" },
  { id: 'hindi', label: 'Hindi', icon: '✨', tag: 'Pure Shuddh', sample: "नमस्ते! भारत का सबसे तेज़ AI वॉइस इंजन आपकी आवाज़ में वास्तविक भाव भरने के लिए तैयार है।" },
  { id: 'english', label: 'English (IN)', icon: '🎙️', tag: 'Urban Modern', sample: "Hey Delhi! Experience ultra-fast, studio-grade neural voice synthesis tailored for modern creators." },
  { id: 'punjabi', label: 'Punjabi', icon: '🔥', tag: 'Vibrant Josh', sample: "Chak de phatte! Agg laa ditti AI voice ne, sunke maza hi aa jana hai!" },
];

const LOCAL_VOICES: VoiceTone[] = [
  {
    id: 'kabir',
    name: 'Kabir (Delhi NCR)',
    badge: 'Trending 🔥',
    region: 'North Campus / Gurgaon',
    desc: 'Charming, upbeat Hinglish tone. High energy and perfect for short clips, video streams, and podcasts.',
    vibe: 'bg-gradient-to-r from-orange-500 to-amber-500',
    rate: 1.05,
    pitch: 1.0,
  },
  {
    id: 'ananya',
    name: 'Ananya (South Ex)',
    badge: 'Creator Favorite',
    region: 'Urban Contemporary',
    desc: 'Crisp, articulate storytelling voice with soothing empathy and premium cadence.',
    vibe: 'bg-gradient-to-r from-fuchsia-500 to-pink-500',
    rate: 1.0,
    pitch: 1.1,
  },
  {
    id: 'ranveer',
    name: 'Ranveer (Studio HD)',
    badge: 'Deep Baritone',
    region: 'Documentary & Ads',
    desc: 'Punchy, commanding bass voice designed for high-conversion brand advertisements.',
    vibe: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    rate: 0.95,
    pitch: 0.85,
  },
  {
    id: 'simran',
    name: 'Simran (RJ Vibe)',
    badge: 'Radio & Chill',
    region: 'Late Night FM',
    desc: 'Warm, conversational friend-next-door inflection that keeps listeners hooked.',
    vibe: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    rate: 1.0,
    pitch: 1.05,
  },
];

const TRUST_AVATARS = [
  { name: 'Aman G.', role: 'Creator (2.4M)', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { name: 'Pooja S.', role: 'D2C Founder', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  { name: 'Rohan V.', role: 'Podcaster', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { name: 'Kavita M.', role: 'Educator', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { name: 'Harpreet S.', role: 'Agency Lead', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
];

/* ==========================================================================
   2. TRUST BANNER COMPONENT
   ========================================================================== */

export const TrustBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-center sm:justify-start">
          {/* Overlapping Avatar Faces */}
          <div className="flex -space-x-2.5 overflow-hidden p-0.5">
            {TRUST_AVATARS.map((user, idx) => (
              <img
                key={idx}
                src={user.img}
                alt={user.name}
                className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-950 object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>

          {/* Social Proof Text & 5-Star Rating */}
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black text-white">4.96/5</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Trusted by <span className="text-orange-400 font-bold">50,000+ Creators</span> across Delhi NCR & India
            </p>
          </div>
        </div>

        {/* Live Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>#1 Audio AI in North India</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>220ms Turbo Latency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. MAGIC DEMO CARD COMPONENT
   ========================================================================== */

interface MagicDemoCardProps {
  onAudioGenerated?: (data: { voice: string; text: string; language: string }) => void;
}

export const MagicDemoCard: React.FC<MagicDemoCardProps> = ({ onAudioGenerated }) => {
  const [selectedLang, setSelectedLang] = useState(LOCAL_LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState(LOCAL_VOICES[0]);
  const [inputText, setInputText] = useState(LOCAL_LANGUAGES[0].sample);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLangChange = (lang: typeof LOCAL_LANGUAGES[0]) => {
    setSelectedLang(lang);
    setInputText(lang.sample);
    setHasGenerated(false);
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleGenerateMagic = () => {
    if (!inputText.trim()) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);

      onAudioGenerated?.({
        voice: selectedVoice.name,
        text: inputText,
        language: selectedLang.label,
      });

      playVoiceOutput();
    }, 2500);
  };

  const playVoiceOutput = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.rate = selectedVoice.rate;
      utterance.pitch = selectedVoice.pitch;

      utterance.onstart = () => {
        setIsPlaying(true);
        startProgressBar();
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setPlaybackProgress(100);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(true);
      startProgressBar();
      setTimeout(() => {
        setIsPlaying(false);
        setPlaybackProgress(100);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      }, 3500);
    }
  };

  const stopVoiceOutput = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
  };

  const startProgressBar = () => {
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    setPlaybackProgress(0);
    playbackIntervalRef.current = setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev >= 98) {
          if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
          return 100;
        }
        return prev + 2.5;
      });
    }, 100);
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(inputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
      id="magic-demo-card"
    >
      {/* Spatial-Glow Background Flares */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-orange-500/20 via-pink-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Test Instant Voice Magic
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pick a local dialect, type anything, and experience the zero-latency neural vocoder.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-300 self-start sm:self-auto shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Full-Duplex Neural Engine v4.2</span>
        </div>
      </div>

      {/* Language Quick-Select Pills */}
      <div className="mb-4 relative z-10">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Choose Regional Cadence:</span>
          <span className="text-orange-400 font-mono text-[10px]">Natural NCR Inflection</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {LOCAL_LANGUAGES.map((lang) => {
            const isSelected = selectedLang.id === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`group px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/50'
                    : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-black/20 text-slate-950 font-black' : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {lang.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distraction-Free Input Area */}
      <div className="relative z-10 bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 focus-within:border-orange-500/60 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all shadow-inner mb-5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Mic2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Script Playground</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="hover:text-white transition-colors flex items-center gap-1"
              title="Copy script"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <span>•</span>
            <span className={inputText.length > 250 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
              {inputText.length}/333 chars
            </span>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, 333))}
          placeholder="Type something or paste your script here in Hinglish, Hindi, or English..."
          rows={3}
          className="w-full bg-transparent border-none outline-none resize-none text-white text-sm sm:text-base leading-relaxed placeholder-slate-500 focus:ring-0 p-0 min-h-[85px] font-sans"
        />

        {/* Voice Persona Selector */}
        <div className="pt-3 border-t border-slate-800/80 mt-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select Indian AI Voice Persona:</span>
            <span className="text-slate-500 font-mono">{selectedVoice.region}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LOCAL_VOICES.map((voice) => {
              const isPicked = selectedVoice.id === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setSelectedVoice(voice)}
                  className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between active:scale-95 ${
                    isPicked
                      ? 'bg-slate-800 border-orange-500 text-white shadow-md shadow-orange-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold truncate">{voice.name.split(' ')[0]}</span>
                    <span className={`w-2 h-2 rounded-full ${voice.vibe}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">{voice.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chunky Thumb-Friendly CTA Button */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={handleGenerateMagic}
          disabled={isGenerating || !inputText.trim()}
          className="w-full min-h-[56px] sm:min-h-[60px] rounded-2xl font-black text-base sm:text-lg tracking-wide text-slate-950 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 hover:from-orange-400 hover:to-yellow-300 active:scale-95 hover:scale-[1.01] transition-all duration-200 shadow-[0_10px_30px_rgba(249,115,22,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 select-none"
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[30, 85, 100, 60, 90, 40, 95, 70, 50, 80].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-slate-950 rounded-full animate-bounce"
                    style={{
                      height: `${(h / 100) * 22}px`,
                      animationDelay: `${idx * 75}ms`,
                      animationDuration: '650ms',
                    }}
                  />
                ))}
              </div>
              <span className="text-slate-950 font-black">Generating Magic... ⚡</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950 animate-bounce" />
              <span>Generate Magic ✨</span>
              <span className="text-xs bg-slate-950/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold">
                Instant
              </span>
            </>
          )}
        </button>
      </div>

      {/* Success Player Component with 3D Spatial Audio Ribbon */}
      {!isGenerating && hasGenerated && (
        <div className="mt-5 p-4 rounded-3xl bg-gradient-to-r from-slate-950 to-slate-900 border border-orange-500/40 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300 relative z-10">
          
          {/* 3D Audio Waveform Ribbon */}
          <div className="w-full bg-[#07090e]/80 rounded-2xl border border-slate-800/80 p-2 overflow-hidden relative">
            <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 border border-slate-700 text-[10px] font-mono text-orange-400">
              <Sparkles className="w-2.5 h-2.5" />
              <span>3D Spatial Neural Spectrum</span>
            </div>
            <AudioRibbon3D isPlaying={isPlaying} audioLevel={isPlaying ? 65 : 10} height={120} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={isPlaying ? stopVoiceOutput : playVoiceOutput}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:brightness-110 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
                title={isPlaying ? 'Pause Audio' : 'Play Synthesized Voice'}
              >
                {isPlaying ? (
                  <Square className="w-5 h-5 fill-slate-950" />
                ) : (
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white truncate">{selectedVoice.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedLang.label} • 24kHz HD Waveform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-60">
              <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-orange-400 shrink-0 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlaying ? 'Live' : '100%'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   4. FEATURE BENTO GRID COMPONENT
   ========================================================================== */

export const FeatureBentoGrid: React.FC = () => {
  return (
    <div className="w-full space-y-4" id="feature-bento-grid">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
            <span>Built For Indian Creators & Brands</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero fluff. High-speed neural audio designed for real-world viral content and automated operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Block 1: Voice Cloning */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/15 transition-all" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Mic2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                15-Second Instant
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white mb-2 group-hover:text-orange-400 transition-colors">
              Zero-Shot Voice Cloning
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Clone your own voice or any brand spokesperson with a quick 15-second audio note. Retains native regional accent, breath pauses, and comedic timing.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 99.2% Accuracy
              </span>
              <span>•</span>
              <span>Zero Accent Drift</span>
            </div>
            
            <span className="font-bold text-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Try Studio Cloning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Block 2: Instant Dubbing */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                12 Indian Dialects
              </span>
            </div>

            <h4 className="text-lg font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">
              Instant Regional Dubbing
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Auto-translate English video or audio into Hinglish, Hindi, and Punjabi with perfect lip-sync audio alignment.
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-bold">
            <span>Auto Lip-Sync</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Block 3: Background Music */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 shadow-xl hover:shadow-purple-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Royalty Free
              </span>
            </div>

            <h4 className="text-lg font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
              Generative Background Music
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Layer lo-fi Delhi chill beats, cinematic sitar vibes, or podcast ambient drones that duck automatically during speech.
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-bold">
            <span>Adaptive Audio Ducking</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Block 4: Conversational Agents */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Full Duplex WebRTC
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Conversational Voice Agents
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Deploy autonomous AI hotlines for customer service, exam coaching, or emotional support with natural mid-sentence interruption handling.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">98.4% Resolution Rate</span>
              <span>•</span>
              <span>Zero Call Drops</span>
            </div>
            
            <span className="font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Agent Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   5. MAIN EXPORT CONTAINER (AIAudioModule)
   ========================================================================== */

export interface AIAudioModuleProps {
  className?: string;
  onAudioGenerated?: (data: { voice: string; text: string; language: string }) => void;
}

export const AIAudioModule: React.FC<AIAudioModuleProps> = ({
  className = '',
  onAudioGenerated,
}) => {
  return (
    <div
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-white bg-slate-950 ${className}`}
      id="ai-audio-module"
    >
      {/* Module Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-xs font-bold text-orange-300 shadow-md">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Built for India’s Fastest Creators & Teams</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            High-Impact AI Voice & Speech Studio
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Generate viral Hinglish, Hindi, and English voiceovers with unmatched human cadence, zero robotic pauses, and sub-second generation.
          </p>
        </div>

        {/* Metrics Stack */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Latency</span>
            <span className="text-base font-black text-emerald-400">&lt; 220ms</span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-lg">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Satisfaction</span>
            <span className="text-base font-black text-amber-400">4.96 ★</span>
          </div>
        </div>
      </div>

      {/* Section 1: Magic Demo Card */}
      <section aria-label="Interactive AI Voice Demo">
        <MagicDemoCard onAudioGenerated={onAudioGenerated} />
      </section>

      {/* Section 1.5: Real-Time Voice Pitch Modulator */}
      <section aria-label="Real-Time Voice Pitch Modulator">
        <VoicePitchModulator />
      </section>

      {/* Section 2: Social Proof Trust Banner */}
      <section aria-label="Social Proof & User Trust">
        <TrustBanner />
      </section>

      {/* Section 3: Bento Box Capabilities */}
      <section aria-label="Core Audio Capabilities Bento Box">
        <FeatureBentoGrid />
      </section>
    </div>
  );
};

export const AudioFeatureModule = AIAudioModule;
export default AIAudioModule;
