import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Send,
  ShieldCheck,
  Heart,
  Zap,
  Bot,
  User,
  Play,
  AlertCircle,
  Radio,
  Repeat,
  AlertOctagon,
  Lock
} from 'lucide-react';
import { PERSONAS_DATA } from '../data/personas';
import { Persona } from '../types';
import { audioSynth } from '../utils/audioSynth';

export interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  avatar: string;
  themeColor: string;
  badgeColor: string;
  bgGradient: string;
  tagline: string;
  systemPrompt: string;
  ttsConfig: {
    pitch: number;
    rate: number;
    preferredLang: string;
    description: string;
  };
}

// Built-in presets + dynamic 20-persona mapped registry
export const DEFAULT_PERSONAS: PersonaConfig[] = [
  {
    id: 'kabir_upsc',
    name: 'Kabir',
    role: 'UPSC Aspirant',
    avatar: '📚',
    themeColor: 'amber',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGradient: 'from-amber-950/40 via-stone-900 to-slate-950',
    tagline: 'Mukherjee Nagar PG burnout, mock test series stress & family expectations',
    systemPrompt: `You are Kabir, a 24-year-old UPSC aspirant living in a tiny Mukherjee Nagar PG room in Delhi. Speak authentic colloquial Hinglish. Listen intently. Use natural Delhi slang like Bhai, scene, attempt, prelims. Be grounded and non-judgmental. Keep spoken replies concise (2-3 sentences max).`,
    ttsConfig: {
      pitch: 0.95,
      rate: 0.98,
      preferredLang: 'hi-IN',
      description: 'Grounded, empathetic, authentic peer'
    }
  },
  {
    id: 'rohan_techie',
    name: 'Rohan',
    role: 'CyberHub Techie',
    avatar: '💻',
    themeColor: 'cyan',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bgGradient: 'from-cyan-950/40 via-slate-900 to-slate-950',
    tagline: 'Corporate sprint burnout, toxic manager politics & golden handcuffs',
    systemPrompt: `You are Rohan, a 29-year-old Senior Software Engineer working in Gurgaon Cyber City. You understand corporate sprint burnout, toxic managers, and high CTC golden handcuffs. Speak pragmatic Hinglish. Keep spoken replies concise (2-3 sentences max).`,
    ttsConfig: {
      pitch: 1.05,
      rate: 1.08,
      preferredLang: 'en-IN',
      description: 'Pragmatic, fast-paced, sharp'
    }
  },
  {
    id: 'sunita_homemaker',
    name: 'Sunita Ji',
    role: 'Lajpat Nagar Supermom',
    avatar: '🌸',
    themeColor: 'rose',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgGradient: 'from-rose-950/40 via-stone-900 to-slate-950',
    tagline: 'Maternal warmth, comforting wisdom & unconditional patient listening',
    systemPrompt: `You are Sunita Ji, a 42-year-old affectionate homemaker from Lajpat Nagar, Delhi. Speak soothing, motherly Hindi/Hinglish. Use comforting natural words like Beta, Shaant ho jao, Dil halka karo. Keep spoken replies concise (2-3 sentences max).`,
    ttsConfig: {
      pitch: 1.12,
      rate: 0.92,
      preferredLang: 'hi-IN',
      description: 'Maternal warmth, soothing cadence'
    }
  },
  {
    id: 'meera_hr',
    name: 'Meera',
    role: 'Corporate HR Leader',
    avatar: '💼',
    themeColor: 'purple',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bgGradient: 'from-purple-950/40 via-slate-900 to-slate-950',
    tagline: 'Workplace boundary erosion, career crossroads & strategic clarity',
    systemPrompt: `You are Meera, a 38-year-old HR Leader in Noida. You understand workplace gaslighting, boundary erosion, and career stagnation. Speak articulate, sharp, empathetic Hinglish. Keep spoken replies concise (2-3 sentences max).`,
    ttsConfig: {
      pitch: 1.0,
      rate: 1.0,
      preferredLang: 'en-IN',
      description: 'Articulate, empathetic, strategic'
    }
  },
  {
    id: 'dadaji',
    name: 'Dadaji',
    role: 'Grandfather',
    avatar: '👴🏽',
    themeColor: 'amber',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGradient: 'from-amber-950/40 via-stone-900 to-slate-950',
    tagline: 'Warm, wise, traditional elder blessing & unconditional patience',
    systemPrompt: `You are Dadaji, a warm, wise, loving Indian grandfather. You speak with traditional elder warmth, using comforting Indian elder phrasing ("Beta", "Aashirwad", "Chinta mat karo", "Duniya ka tajurba"). Keep replies short (2-3 spoken sentences), soothing, and in conversational warm Hinglish.`,
    ttsConfig: {
      pitch: 0.8,
      rate: 0.88,
      preferredLang: 'hi-IN',
      description: 'Deep, measured, elder warmth'
    }
  },
  {
    id: 'brother',
    name: 'Bhai (Peer)',
    role: 'Loyal Sibling',
    avatar: '🧢',
    themeColor: 'cyan',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bgGradient: 'from-cyan-950/40 via-slate-900 to-slate-950',
    tagline: 'Casual, modern, direct slang & unfiltered peer loyalty',
    systemPrompt: `You are Brother (Bhai), a casual, modern, supportive, direct sibling. You speak with contemporary energy and colloquial slang ("Bro", "Bhai", "Scene kya hai", "Chill maar", "Sort kar lenge"). Keep spoken replies short (2-3 spoken sentences).`,
    ttsConfig: {
      pitch: 1.08,
      rate: 1.1,
      preferredLang: 'en-IN',
      description: 'Energetic, casual, quick cadence'
    }
  }
];

export const PERSONAS = DEFAULT_PERSONAS;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  personaId?: string;
  text: string;
  timestamp: string;
  audioPlaying?: boolean;
}

export interface ConversationalVoiceEngineProps {
  onOpenCrisisHelpline?: () => void;
  onOpenLegalModal?: () => void;
  engineState: 'idle' | 'listening' | 'thinking' | 'speaking';
  setEngineState: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
}

export const ConversationalVoiceEngine: React.FC<ConversationalVoiceEngineProps> = ({
  onOpenCrisisHelpline,
  onOpenLegalModal,
  engineState,
  setEngineState,
}) => {
  // 1. Persona State
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('kabir_upsc');
  const [showAllPersonasDrawer, setShowAllPersonasDrawer] = useState<boolean>(false);
  const [continuousHandsFree, setContinuousHandsFree] = useState<boolean>(false);

  // Derive active persona config (either from DEFAULT_PERSONAS or mapped from PERSONAS_DATA)
  const activePersona: PersonaConfig = React.useMemo(() => {
    const fromDefault = DEFAULT_PERSONAS.find((p) => p.id === selectedPersonaId);
    if (fromDefault) return fromDefault;

    const fromData = PERSONAS_DATA.find((p) => p.id === selectedPersonaId);
    if (fromData) {
      return {
        id: fromData.id,
        name: fromData.name,
        role: fromData.title,
        avatar: fromData.cat === 'male' ? '👨🏽' : fromData.cat === 'female' ? '👩🏽' : '✨',
        themeColor: 'orange',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        bgGradient: 'from-orange-950/40 via-stone-900 to-slate-950',
        tagline: fromData.vibe,
        systemPrompt: `${fromData.systemPromptBase} Keep spoken answers concise, empathetic, natural and in 2-3 sentences.`,
        ttsConfig: {
          pitch: fromData.cat === 'female' ? 1.1 : fromData.age > 40 ? 0.85 : 1.0,
          rate: 0.98,
          preferredLang: 'hi-IN',
          description: fromData.voice
        }
      };
    }

    return DEFAULT_PERSONAS[0];
  }, [selectedPersonaId]);

  // 2. Loop State Machine: lifted up to props
  // const [engineState, setEngineState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'gemini',
      personaId: 'kabir_upsc',
      text: 'Haan bhai! Kabir here. Mukherjee Nagar ki chai tapri pe baitha hoon. Jo bhi dil mein bojh hai, bolo... poora sun raha hoon.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [textInput, setTextInput] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const capturedTranscriptRef = useRef<string>('');
  const handsFreeTimeoutRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, engineState]);

  // Load available speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopTTS();
    };
  }, []);

  // STEP 4 (TTS - Text to Speech)
  const speakText = (text: string, persona: PersonaConfig) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setEngineState('idle');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = persona.ttsConfig.pitch;
      utterance.rate = persona.ttsConfig.rate;

      // Select matching voice
      if (availableVoices.length > 0) {
        let matchedVoice: SpeechSynthesisVoice | undefined;

        if (persona.ttsConfig.preferredLang.startsWith('hi')) {
          matchedVoice = availableVoices.find((v) =>
            v.lang.includes('hi') || v.lang.includes('en-IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('hindi')
          ) || availableVoices.find((v) => v.lang.startsWith('en'));
        } else {
          matchedVoice = availableVoices.find((v) =>
            v.lang.includes('en-IN') || v.lang.includes('en-US') || v.name.toLowerCase().includes('natural')
          ) || availableVoices[0];
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        setEngineState('speaking');
      };

      utterance.onend = () => {
        setEngineState('idle');
        // Hands-free continuous loop auto-trigger with guard
        if (continuousHandsFree) {
          if (handsFreeTimeoutRef.current) clearTimeout(handsFreeTimeoutRef.current);
          handsFreeTimeoutRef.current = setTimeout(() => {
            if (!isListeningRef.current) {
              startSpeechRecognition();
            }
          }, 450);
        }
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setEngineState('idle');
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS Playback failed:', err);
      setEngineState('idle');
    }
  };

  const stopTTS = () => {
    if (handsFreeTimeoutRef.current) {
      clearTimeout(handsFreeTimeoutRef.current);
      handsFreeTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (engineState === 'speaking') {
      setEngineState('idle');
    }
  };

  // STEP 2 & 3: Gemini API Call & UI Render
  const executeGeminiCall = async (userPromptText: string, persona: PersonaConfig) => {
    if (!userPromptText.trim()) return;

    setEngineState('thinking');
    setSpeechError(null);

    // Format conversation history
    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender === 'user' ? 'user' : 'persona',
      text: m.text
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          personaPrompt: persona.systemPrompt,
          personaName: persona.name,
          userText: userPromptText,
          history: historyPayload,
          mode: 'receptive_venting'
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      const geminiReply = data.text || "Main poora sun raha hoon. Please continue, jo bhi dil mein hai bolo.";

      // STEP 3: Render response to chat
      const botMessage: ChatMessage = {
        id: `gemini_${Date.now()}`,
        sender: 'gemini',
        personaId: persona.id,
        text: geminiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);

      // STEP 4: Speak out loud immediately
      speakText(geminiReply, persona);
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      // Fallback message
      const fallbackText = "Main yahin hoon, thoda network dip hua tha par main poori tarah sun raha hoon. Aaram se bolo.";

      const botErrorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'gemini',
        personaId: persona.id,
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botErrorMessage]);
      speakText(fallbackText, persona);
    }
  };

  // STEP 1 (STT - Speech to Text)
  const startSpeechRecognition = () => {
    audioSynth.unlockAudioContext();
    audioSynth.playMicToggleChime(true);
    stopTTS();
    setSpeechError(null);
    setLiveTranscript('');
    capturedTranscriptRef.current = '';

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech Recognition is not supported on this browser. You can type below or use Chrome/Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Capture utterance and stop on pause
      recognition.interimResults = true;
      recognition.lang = activePersona.ttsConfig.preferredLang.startsWith('hi') ? 'hi-IN' : 'en-IN';

      let finalCapturedText = '';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setEngineState('listening');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalCapturedText += transcriptChunk;
          } else {
            interim += transcriptChunk;
          }
        }
        const currentDisplay = (finalCapturedText + ' ' + interim).trim();
        capturedTranscriptRef.current = currentDisplay;
        setLiveTranscript(currentDisplay);
      };

      recognition.onerror = (event: any) => {
        console.warn('STT Error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Tap mic and speak closer.');
        } else {
          setSpeechError(`STT Notice: ${event.error}`);
        }
        isListeningRef.current = false;
        setEngineState('idle');
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        const captured = (finalCapturedText.trim() || capturedTranscriptRef.current).trim();
        capturedTranscriptRef.current = '';
        setLiveTranscript('');

        if (captured) {
          // Render user speech to chat
          const userMsg: ChatMessage = {
            id: `usr_${Date.now()}`,
            sender: 'user',
            text: captured,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, userMsg]);

          // Trigger Step 2
          executeGeminiCall(captured, activePersona);
        } else {
          setEngineState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError(`Could not access microphone: ${err.message || String(err)}`);
      setEngineState('idle');
    }
  };

  const stopSpeechRecognition = () => {
    audioSynth.playMicToggleChime(false);
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
  };

  const toggleRecording = () => {
    if (navigator.vibrate) navigator.vibrate(30);

    if (engineState === 'listening') {
      stopSpeechRecognition();
    } else if (engineState === 'speaking') {
      stopTTS();
      startSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || engineState === 'thinking') return;

    setSpeechError(null);
    const userText = textInput.trim();
    setTextInput('');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    executeGeminiCall(userText, activePersona);
  };

  const handleSelectPersona = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(20);
    stopTTS();
    setSelectedPersonaId(id);
    setShowAllPersonasDrawer(false);

    const foundInDefault = DEFAULT_PERSONAS.find((item) => item.id === id);
    const foundInData = PERSONAS_DATA.find((item) => item.id === id);
    const name = foundInDefault?.name || foundInData?.name || 'Peer';

    // Announce switch in chat
    const switchNotice: ChatMessage = {
      id: `switch_${Date.now()}`,
      sender: 'gemini',
      personaId: id,
      text: foundInData?.greetingMessage || `Haan ji! ${name} is here. Dil khol ke baat karo, poora safe space hai.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, switchNotice]);
    speakText(switchNotice.text, activePersona);
  };

  const replayMessage = (msg: ChatMessage) => {
    const p = DEFAULT_PERSONAS.find((item) => item.id === msg.personaId) || activePersona;
    speakText(msg.text, p);
  };

  const clearConversation = async () => {
    stopTTS();
    stopSpeechRecognition();
    try {
      await fetch('/api/session/wipe-ram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `voice_session_${selectedPersonaId}`,
          reason: 'user_voluntary_purge'
        })
      });
    } catch (_) {}

    setMessages([
      {
        id: `init_${Date.now()}`,
        sender: 'gemini',
        personaId: activePersona.id,
        text: `Zero-Knowledge RAM scrubbed & conversation cleared. ${activePersona.name} is ready to listen.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div
      id="conversational-voice-engine"
      className="w-full max-w-lg mx-auto flex flex-col h-[calc(100vh-80px)] sm:h-[840px] max-h-[100dvh] bg-[#090D16] border border-slate-800/80 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden relative selection:bg-orange-500 selection:text-black"
    >
      {/* 1. TOP STATUS BAR & CONTROLS */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br ${activePersona.bgGradient} border border-slate-700 shadow-inner`}>
              {activePersona.avatar}
            </div>
            {engineState !== 'idle' && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
            )}
            <span
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                engineState === 'listening'
                  ? 'bg-rose-500'
                  : engineState === 'thinking'
                  ? 'bg-amber-400 animate-pulse'
                  : engineState === 'speaking'
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-wide">{activePersona.name}</h1>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${activePersona.badgeColor}`}>
                {activePersona.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]">
              {engineState === 'listening'
                ? '🎙️ Listening to you...'
                : engineState === 'thinking'
                ? '⚡ Gemini synthesizing...'
                : engineState === 'speaking'
                ? '🔊 Speaking out loud...'
                : activePersona.ttsConfig.description}
            </p>
          </div>
        </div>

        {/* Top Actions: SOS Help, Hands-free Loop, Mute TTS, Clear */}
        <div className="flex items-center gap-1.5">
          {onOpenCrisisHelpline && (
            <button
              type="button"
              onClick={onOpenCrisisHelpline}
              title="24/7 Verified Crisis Helplines (Tele-MANAS 14416 / KIRAN)"
              className="p-2 min-h-[44px] min-w-[44px] rounded-xl border bg-rose-950/50 border-rose-500/60 text-rose-300 hover:text-white transition-all flex items-center justify-center shadow-md active:scale-95"
              aria-label="Open emergency crisis helplines"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setContinuousHandsFree(!continuousHandsFree)}
            title={continuousHandsFree ? 'Continuous Hands-Free Mode: ON' : 'Continuous Hands-Free Mode: OFF'}
            className={`p-2 min-h-[44px] min-w-[44px] rounded-xl border transition-all flex items-center justify-center ${
              continuousHandsFree
                ? 'bg-orange-950/50 border-orange-500/60 text-orange-300'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className={`w-4 h-4 ${continuousHandsFree ? 'animate-spin-slow text-orange-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute voice playback' : 'Mute voice playback'}
            className={`p-2 min-h-[44px] min-w-[44px] rounded-xl border transition-all flex items-center justify-center ${
              isMuted
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={clearConversation}
            title="Scrub RAM & Clear Chat"
            className="p-2 min-h-[44px] min-w-[44px] rounded-xl border bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white transition-all flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DPDP ACT 2023 ZERO-DISK CONFIDENTIALITY BAR */}
      <div className="px-3.5 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono shrink-0">
        <span className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>RAM-Only Ephemeral Voice • Zero Disk Recording</span>
        </span>
        {onOpenLegalModal && (
          <button
            type="button"
            onClick={onOpenLegalModal}
            className="text-orange-400 hover:underline shrink-0 ml-2"
          >
            DPDP Notice
          </button>
        )}
      </div>

      {/* 2. PERSONA SELECTOR BAR + All 20 Personas Switcher Button */}
      <nav aria-label="Persona Selection" className="px-3 py-2 bg-slate-950/70 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DEFAULT_PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => handleSelectPersona(persona.id)}
                className={`py-2 px-3 rounded-xl min-h-[44px] border text-center transition-all flex items-center gap-2 shrink-0 relative ${
                  isSelected
                    ? 'bg-slate-800/95 border-orange-500/80 text-white shadow-lg shadow-orange-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span className="text-sm leading-none">{persona.avatar}</span>
                <span className="text-xs font-bold leading-none whitespace-nowrap">{persona.name}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                )}
              </button>
            );
          })}

          {/* More Personas Pill */}
          <button
            type="button"
            onClick={() => setShowAllPersonasDrawer(!showAllPersonasDrawer)}
            className="py-2 px-3 rounded-xl min-h-[44px] border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white text-xs font-mono shrink-0 flex items-center gap-1.5"
          >
            <Radio className="w-3 h-3 text-orange-400" />
            <span>All 20 Personas</span>
          </button>
        </div>

        {/* Expanded 20 Personas Drawer */}
        {showAllPersonasDrawer && (
          <div className="mt-2 pt-2 border-t border-slate-800 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5 p-1">
            {PERSONAS_DATA.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p.id)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  selectedPersonaId === p.id
                    ? 'bg-orange-950/60 border-orange-500 text-white'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-base">{p.cat === 'male' ? '👨🏽' : p.cat === 'female' ? '👩🏽' : '✨'}</span>
                <div className="truncate">
                  <div className="text-xs font-bold truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.title}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* 3. CHAT MESSAGE STREAM (Flex grow, scrollable, 100% responsive) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth overscroll-contain">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const msgPersona = DEFAULT_PERSONAS.find((p) => p.id === msg.personaId) || activePersona;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0 mb-0.5">
                  {msgPersona.avatar}
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-md relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Sender Tag & Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${isUser ? 'text-orange-100' : 'text-slate-400'}`}>
                    {isUser ? 'You' : msgPersona.name}
                  </span>
                  <span className={`text-[9px] font-mono ${isUser ? 'text-orange-200/80' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </p>

                {/* TTS Replay Button for Bot replies */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => replayMessage(msg)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 py-1 px-1.5 -ml-1 rounded-lg hover:bg-slate-800/60 min-h-[32px] transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Replay Voice</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-400">
                      {msgPersona.ttsConfig.description}
                    </span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-200 shrink-0 mb-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Transcript Bubble */}
        {liveTranscript && (
          <div className="flex items-end gap-2.5 justify-end animate-fade-in">
            <div className="max-w-[85%] rounded-2xl rounded-br-none p-3.5 bg-orange-950/60 border border-orange-500/50 text-orange-200 shadow-md">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Transcribing real-time speech...</span>
              </div>
              <p className="text-sm italic">{liveTranscript}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-300 shrink-0">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {engineState === 'thinking' && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
              {activePersona.avatar}
            </div>
            <div className="rounded-2xl rounded-bl-none p-3.5 bg-slate-900 border border-slate-800 flex items-center gap-2.5">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-amber-300">
                {activePersona.name} is generating reply...
              </span>
            </div>
          </div>
        )}

        {/* Speaking Waveform Banner */}
        {engineState === 'speaking' && (
          <div className="sticky bottom-2 mx-auto max-w-sm w-full py-2 px-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md flex items-center justify-between text-emerald-200 shadow-xl animate-fade-in z-10">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-full" />
                <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2/3" />
                <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-full" />
                <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-1/2" />
              </div>
              <span className="text-xs font-semibold">{activePersona.name} is speaking...</span>
            </div>
            <button
              type="button"
              onClick={stopTTS}
              className="text-[11px] font-mono uppercase bg-emerald-900/80 hover:bg-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-400/40 text-white min-h-[32px]"
            >
              Stop Audio
            </button>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 4. ERROR DISPLAY BANNER */}
      {speechError && (
        <div className="px-4 py-2 bg-rose-950/90 border-t border-b border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-rose-400 font-bold ml-2 px-2 py-0.5 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* 5. BOTTOM CONTROL DECK */}
      <footer className="p-3.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 shrink-0 z-20">
        {/* Main Voice Record Button */}
        <div className="flex items-center justify-center mb-3">
          <button
            id="voice-loop-mic-button"
            type="button"
            onClick={toggleRecording}
            aria-label={engineState === 'listening' ? 'Stop Recording' : 'Start Voice Recording'}
            className={`w-full max-w-xs h-14 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-3 shadow-xl ${
              engineState === 'listening'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30 scale-[1.02] animate-pulse ring-4 ring-rose-500/30'
                : engineState === 'thinking'
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : engineState === 'speaking'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-orange-500/25 hover:brightness-110 active:scale-95'
            }`}
            disabled={engineState === 'thinking'}
          >
            {engineState === 'listening' ? (
              <>
                <MicOff className="w-5 h-5 animate-bounce" />
                <span>Tap to Stop & Send</span>
              </>
            ) : engineState === 'speaking' ? (
              <>
                <Mic className="w-5 h-5" />
                <span>Interrupt & Speak</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Hold or Tap to Speak to {activePersona.name.split(' ')[0]}</span>
              </>
            )}
          </button>
        </div>

        {/* Text Fallback Input Bar */}
        <form onSubmit={handleManualSend} className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Type a message to ${activePersona.name}...`}
            disabled={engineState === 'thinking'}
            className="flex-1 bg-slate-950/90 border border-slate-800 focus:border-orange-500/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-400 outline-none transition-all min-h-[44px]"
          />

          <button
            type="submit"
            disabled={!textInput.trim() || engineState === 'thinking'}
            className="px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 font-bold transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Footnote Guide */}
        <div className="flex items-center justify-between mt-2 pt-1 text-[10px] font-mono text-slate-400">
          <span>⚡ Delhi NCR Voice Engine</span>
          <span>{continuousHandsFree ? '🔄 Hands-Free Continuous ON' : 'Push-to-Talk'}</span>
        </div>
      </footer>
    </div>
  );
};

export default ConversationalVoiceEngine;
