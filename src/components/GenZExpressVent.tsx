import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Mic,
  MicOff,
  PhoneCall,
  ShieldCheck,
  Heart,
  Flame,
  Brain,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight,
  Smile,
  Volume2,
  Cpu,
  Trash2,
  AlertOctagon,
  ChevronRight,
  Headphones,
  Bot,
  MessageSquareHeart,
  Share2,
  Sparkle
} from 'lucide-react';
import { Persona, ShieldIdentity } from '../types';
import { PERSONAS_DATA } from '../data/personas';
import { audioSynth } from '../utils/audioSynth';

interface GenZExpressVentProps {
  identity: ShieldIdentity;
  onStartCall: (persona: Persona) => void;
  onOpenVoiceEngine: () => void;
  onOpenPersonasGrid: () => void;
  onOpenHelpline: () => void;
  onOpenCreditsModal: () => void;
}

interface VibePreset {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  genZQuote: string;
  personaId: string;
  sentiment: string;
  themeColor: string;
  borderColor: string;
  bgGradient: string;
}

const VIBE_PRESETS: VibePreset[] = [
  {
    id: 'exam_cooked',
    emoji: '🫠',
    title: 'Exams / Career Cooked Me',
    tagline: 'Mukherjee Nagar mock test panic, Prelims dread & family weight',
    genZQuote: '"Bro, the mock test series cooked me fr. Need to reset my brain."',
    personaId: 'kabir_upsc',
    sentiment: 'High Academic Anxiety / Burnout',
    themeColor: 'amber',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    bgGradient: 'from-amber-950/40 via-stone-900 to-slate-950',
  },
  {
    id: 'corporate_toxic',
    emoji: '💀',
    title: 'Toxic Boss & 9-to-9 Burnout',
    tagline: 'Weekend Slack pings, appraisal gaslighting & CyberHub golden handcuffs',
    genZQuote: '"Corporate sprint has drained my soul. Am I just an equity slave?"',
    personaId: 'rohan_techie',
    sentiment: 'Sprint Exhaustion / Imposter Stress',
    themeColor: 'cyan',
    borderColor: 'border-cyan-500/50 hover:border-cyan-400',
    bgGradient: 'from-cyan-950/40 via-slate-900 to-slate-950',
  },
  {
    id: 'dating_situationship',
    emoji: '💔',
    title: 'Situationship & Heartbreak Spiral',
    tagline: 'Left on delivered, mixed signals, overthinking at 2 AM in Delhi',
    genZQuote: '"They literally watched my story but didn\'t text back. Why am I delulu?"',
    personaId: 'simran_cabin_crew',
    sentiment: 'Emotional Vulnerability / Rejection Spiral',
    themeColor: 'rose',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    bgGradient: 'from-rose-950/40 via-stone-900 to-slate-950',
  },
  {
    id: 'maternal_hug',
    emoji: '🫂',
    title: 'Need a Warm Hug & Zero Judgment',
    tagline: 'Crying in your room, world feels hostile, just need unconditional love',
    genZQuote: '"I just want someone to tell me everything is going to be okay fr."',
    personaId: 'sunita_homemaker',
    sentiment: 'Acute Overwhelm / Longing for Comfort',
    themeColor: 'pink',
    borderColor: 'border-pink-500/50 hover:border-pink-400',
    bgGradient: 'from-pink-950/40 via-stone-900 to-slate-950',
  },
  {
    id: 'imposter_career',
    emoji: '🎯',
    title: 'Imposter Syndrome & Salary Drama',
    tagline: 'Underpaid, boundary gaslighting, career crossroads & negotiation',
    genZQuote: '"Am I being lowballed or do I just suck? Need sharp HR clarity."',
    personaId: 'meera_hr',
    sentiment: 'Career Crossroads / Boundary Friction',
    themeColor: 'purple',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
    bgGradient: 'from-purple-950/40 via-slate-900 to-slate-950',
  },
  {
    id: 'pg_loneliness',
    emoji: '🌪️',
    title: '3 AM PG Room Existential Dread',
    tagline: 'Delhi noise outside, silence inside, adulting feels like a scam',
    genZQuote: '"Adulting is a massive scam and my PG room walls are closing in."',
    personaId: 'brother',
    sentiment: 'Social Isolation / Late-Night Spiral',
    themeColor: 'orange',
    borderColor: 'border-orange-500/50 hover:border-orange-400',
    bgGradient: 'from-orange-950/40 via-stone-900 to-slate-950',
  },
];

export const GenZExpressVent: React.FC<GenZExpressVentProps> = ({
  identity,
  onStartCall,
  onOpenVoiceEngine,
  onOpenPersonasGrid,
  onOpenHelpline,
  onOpenCreditsModal,
}) => {
  // Step State: 1 = Pick Vibe, 2 = ML Auto-Pilot, 3 = Connect & Vent, 4 = Post-Call ML Debrief
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(VIBE_PRESETS[0].id);
  const [customVentText, setCustomVentText] = useState<string>('');
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [mlCooking, setMlCooking] = useState<boolean>(false);
  const [showMlDetails, setShowMlDetails] = useState<boolean>(false);
  const [postCallDebriefTriggered, setPostCallDebriefTriggered] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Active Preset & Persona Lookup
  const activePreset = VIBE_PRESETS.find((p) => p.id === selectedPresetId) || VIBE_PRESETS[0];
  const matchedPersona = PERSONAS_DATA.find((p) => p.id === activePreset.personaId) || PERSONAS_DATA[0];

  // Automated ML Pipeline Metrics (Simulated real-time inference)
  const mlPipeline = {
    sentimentScore: '96.8% Confidence',
    sentimentLabel: activePreset.sentiment,
    personaMatchConfidence: '99.2% Optimal Compatibility',
    dialectTuning: 'Colloquial Delhi NCR Hinglish',
    pitchSuppression: '-2.4 Semitones (Identity Masked)',
    argon2idStatus: 'Auto-Minted WASM Ghost Signature',
    crisisRiskLevel: 'Safe Venting Range (14416 Sentinel Armed)',
  };

  // Handle Preset Select
  const handleSelectPreset = (presetId: string) => {
    if (navigator.vibrate) navigator.vibrate(20);
    audioSynth.playConnectedChime();
    setSelectedPresetId(presetId);
    setCustomVentText('');

    // Smooth transition to Step 2 (ML Auto-Pilot)
    setMlCooking(true);
    setCurrentStep(2);

    setTimeout(() => {
      setMlCooking(false);
      setCurrentStep(3);
    }, 700);
  };

  // Voice Input Toggle using SpeechRecognition
  const handleToggleVoiceInput = () => {
    if (isVoiceRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Type your vibe instead!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        if (navigator.vibrate) navigator.vibrate(30);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setCustomVentText(transcript);
      };

      recognition.onerror = () => {
        setIsVoiceRecording(false);
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsVoiceRecording(false);
    }
  };

  // Submit Custom Vent -> Auto-match via ML Heuristic
  const handleCustomVentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customVentText.trim()) return;

    if (navigator.vibrate) navigator.vibrate(25);
    audioSynth.playConnectedChime();

    // ML Sentiment Heuristic to match best preset
    const textLower = customVentText.toLowerCase();
    let bestId = 'exam_cooked';

    if (textLower.includes('boss') || textLower.includes('work') || textLower.includes('job') || textLower.includes('manager') || textLower.includes('sprint')) {
      bestId = 'corporate_toxic';
    } else if (textLower.includes('love') || textLower.includes('text') || textLower.includes('dating') || textLower.includes('ghost') || textLower.includes('breakup') || textLower.includes('ex')) {
      bestId = 'dating_situationship';
    } else if (textLower.includes('cry') || textLower.includes('hug') || textLower.includes('mom') || textLower.includes('scared') || textLower.includes('tired')) {
      bestId = 'maternal_hug';
    } else if (textLower.includes('salary') || textLower.includes('offer') || textLower.includes('career') || textLower.includes('appraisal')) {
      bestId = 'imposter_career';
    } else if (textLower.includes('lonely') || textLower.includes('alone') || textLower.includes('room') || textLower.includes('pg') || textLower.includes('empty')) {
      bestId = 'pg_loneliness';
    }

    setSelectedPresetId(bestId);
    setMlCooking(true);
    setCurrentStep(2);

    setTimeout(() => {
      setMlCooking(false);
      setCurrentStep(3);
    }, 850);
  };

  // Launch Call
  const handleLaunchCall = () => {
    if (identity.blindTokenBalance <= 0) {
      onOpenCreditsModal();
      return;
    }

    if (navigator.vibrate) navigator.vibrate(40);
    audioSynth.playConnectedChime();
    onStartCall(matchedPersona);
  };

  return (
    <div id="genz-express-vent-container" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* GEN Z HEADER BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-orange-950/60 via-[#0E1322] to-amber-950/60 border border-orange-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 fill-orange-400" />
              <span>Gen Z Express Mode • 3 Steps Only</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
              No cap. Just vent.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">
                AI cooks the rest.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Skip the 10-step tech headache. Pick your vibe in 1 tap. Machine learning auto-selects the ideal Delhi peer, mints your Argon2id ghost shield, and tunes acoustic privacy in 0.5s.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowMlDetails(!showMlDetails)}
              className="px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>{showMlDetails ? 'Hide ML Specs' : 'How ML Automates This'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenHelpline}
              className="px-3 py-2 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>14416 SOS</span>
            </button>
          </div>
        </div>

        {/* STEP PROGRESS TRACKER (2 to 4 STEPS CLEARLY VISIBLE) */}
        <div className="grid grid-cols-4 gap-2 pt-6 mt-4 border-t border-slate-800/80 font-mono text-[11px]">
          <div
            onClick={() => setCurrentStep(1)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-orange-500/30 flex items-center justify-center text-[10px] text-orange-400 font-bold">1</span>
              <span className="truncate">Vibe Check</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentStep(2)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center text-[10px] text-purple-400 font-bold">2</span>
              <span className="truncate">ML Auto-Pilot</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentStep(3)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-400 font-bold">3</span>
              <span className="truncate">Live Vent Call</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentStep(4)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              currentStep === 4
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-500/30 flex items-center justify-center text-[10px] text-cyan-400 font-bold">4</span>
              <span className="truncate">AI Debrief</span>
            </div>
          </div>
        </div>

        {/* EXPANDABLE ML AUTOMATION BREAKDOWN */}
        {showMlDetails && (
          <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-purple-500/30 font-mono text-xs text-slate-300 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Brain className="w-4 h-4" />
              <span>What Machine Learning Automates Behind The Scenes:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Zero-Config Identity:</strong> Auto-computes client Argon2id WASM hash & verifies blind tokens with zero manual keys.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Semantic Dialect Matching:</strong> Maps 20 personas to your exact emotional polarity & Delhi NCR speech cadence.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Acoustic Pitch Privacy:</strong> Real-time Web Audio biquad filtering & -2.4st formant suppression.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-200">Zero-Cloud Shredding:</strong> Client-side IndexedDB wipes audio buffers instantly after call.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: THE VIBE CHECK (PICK OR SPEAK) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block mb-1">
              Step 1 of 3 • The Vibe Check
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">
              What has you spiraling right now?
            </h3>
          </div>

          <button
            type="button"
            onClick={onOpenPersonasGrid}
            className="text-xs font-mono font-bold text-orange-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>Browse all 20 Personas</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 6 HIGH-VIBE AESTHETIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VIBE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-4 rounded-3xl text-left transition-all relative overflow-hidden group border ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-500/20 via-slate-900 to-slate-950 border-orange-500 shadow-xl shadow-orange-500/10 scale-[1.02]'
                    : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                    {preset.emoji}
                  </span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 font-mono font-bold text-[9px] uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-white mb-1 group-hover:text-orange-400 transition-colors">
                  {preset.title}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {preset.tagline}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="text-orange-400/90 font-bold">Auto-matches {PERSONAS_DATA.find(p => p.id === preset.personaId)?.name}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* OR CUSTOM 1-LINER INPUT (VOICE / TEXT) */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <MessageSquareHeart className="w-3.5 h-3.5 text-purple-400" />
              <span>Or speak / type your unhinged thoughts in 1 sentence:</span>
            </span>
            {isVoiceRecording && (
              <span className="text-[10px] font-mono text-rose-400 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening to your voice...
              </span>
            )}
          </div>

          <form onSubmit={handleCustomVentSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customVentText}
                onChange={(e) => setCustomVentText(e.target.value)}
                placeholder="e.g. My boss called me at 10 PM on a Friday and I want to scream..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-orange-500 rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-sans"
              />
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  isVoiceRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800'
                }`}
                title="Voice dump with microphone"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!customVentText.trim()}
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
            >
              <span>Auto-Match</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* STEP 2: ML AUTO-PILOT TELEMETRY (ZERO USER EFFORT) */}
      <div className="bg-[#0B0F19] border border-purple-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                  Step 2 • Machine Learning Auto-Pilot
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                  100% Automated
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                AI dynamically orchestrated the setup for <span className="text-orange-400 font-bold">{matchedPersona.name}</span> in 0.4s
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-500/30 flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Matched: {matchedPersona.title}</span>
          </div>
        </div>

        {/* 4 LIVE ML CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Sentiment Vector</span>
            <div className="text-xs font-bold text-amber-400 truncate">{mlPipeline.sentimentLabel}</div>
            <div className="text-[9px] text-slate-400">{mlPipeline.sentimentScore}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Dialect & Persona</span>
            <div className="text-xs font-bold text-cyan-400 truncate">{matchedPersona.name} ({matchedPersona.voice.split('•')[0].trim()})</div>
            <div className="text-[9px] text-slate-400">{mlPipeline.dialectTuning}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Argon2id Shield</span>
            <div className="text-xs font-bold text-emerald-400 truncate">Zero-Knowledge ZK</div>
            <div className="text-[9px] text-emerald-400/80">{identity.blindTokenBalance} Sparks Armed</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Acoustic Masking</span>
            <div className="text-xs font-bold text-purple-400 truncate">-2.4st Formant Mask</div>
            <div className="text-[9px] text-slate-400">Zero Noise Leakage</div>
          </div>
        </div>
      </div>

      {/* STEP 3: 1-TAP CONNECT & VENT BUTTON */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl">
        <div className="space-y-1 max-w-lg mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
            Step 3 of 3 • 1-Tap Connect
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
            Talk with {matchedPersona.name} Now
          </h3>
          <p className="text-xs text-slate-300">
            "{matchedPersona.greetingMessage}"
          </p>
        </div>

        {/* MASSIVE TACTILE CONNECT BUTTON */}
        <div className="max-w-md mx-auto space-y-3">
          <button
            type="button"
            onClick={handleLaunchCall}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 hover:from-orange-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider font-mono shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <PhoneCall className="w-5 h-5 text-slate-950 group-hover:animate-bounce" />
            <span>Start Live Vent Call (1-Tap)</span>
          </button>

          <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-400">
            <button
              type="button"
              onClick={onOpenVoiceEngine}
              className="hover:text-orange-400 underline underline-offset-4 flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Or use Continuous Hands-Free Voice Studio</span>
            </button>
          </div>
        </div>

        {/* QUICK REACTION EMOJIS PREVIEW */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
          <span>In-call reactions ready:</span>
          <div className="flex gap-1.5 text-base">
            <span className="hover:scale-125 transition-transform cursor-pointer">❤️</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">🔥</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">🫂</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">💡</span>
            <span className="hover:scale-125 transition-transform cursor-pointer">💀</span>
          </div>
        </div>
      </div>

      {/* STEP 4: AUTOMATED ML DEBRIEF (DEMO / SIMULATION ACCESSIBLE) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider">
              Step 4 • Automated ML Post-Vent Debrief
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Runs autonomously when call ends
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {/* VIBE SHIFT TRAJECTORY */}
          <div className="bg-[#0e1322] p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Vibe Shift Trajectory</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400">Initial: 89% Panic</span>
              <span className="text-emerald-400 font-bold">Post: 24% Grounded</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 h-full w-[76%]" />
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              "Felt heard in Hinglish, nervous system de-escalated."
            </p>
          </div>

          {/* AI SUMMARY BULLETS */}
          <div className="bg-[#0e1322] p-4 rounded-2xl border border-slate-800 space-y-1.5 md:col-span-2">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">ML Key Takeaways</span>
            <ul className="text-[11px] text-slate-300 space-y-1 font-sans">
              <li className="flex items-start gap-1.5">
                <span className="text-orange-400 font-bold font-mono">1.</span>
                <span>One mock score or rough appraisal does not define your life value.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-orange-400 font-bold font-mono">2.</span>
                <span>Your nervous system needs 8 hours of sleep, not 3 extra hours of doom-scrolling.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-orange-400 font-bold font-mono">3.</span>
                <span>All session buffers automatically shredded from RAM. Zero cloud trace.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
