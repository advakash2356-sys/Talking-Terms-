import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  Loader2,
  Volume2,
  ChevronDown,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Radio
} from 'lucide-react';
import { MockVoice, LanguageOption } from './types';
import { MOCK_LANGUAGES, MOCK_VOICES } from './mockData';

interface InteractiveDemoWidgetProps {
  onAudioGenerated?: (audioInfo: { voice: string; text: string; language: string }) => void;
}

const DEFAULT_SAMPLE_TEXT =
  "Voice AI brings human nuance, dynamic cadence, and realistic emotion to every interactive agent. Experience instant text-to-speech with sub-300 millisecond response times.";

export const InteractiveDemoWidget: React.FC<InteractiveDemoWidgetProps> = ({
  onAudioGenerated,
}) => {
  const [inputText, setInputText] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedVoice, setSelectedVoice] = useState<MockVoice>(MOCK_VOICES[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState<boolean>(false);
  const [activePlaybackProgress, setActivePlaybackProgress] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_CHARS = 333;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(90, textareaRef.current.scrollHeight)}px`;
    }
  }, [inputText]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVoiceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup playback on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setInputText(val);
      // Reset generated state if text changed
      if (hasGenerated) {
        setHasGenerated(false);
        setIsPlaying(false);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      }
    }
  };

  const handleGenerateAudio = () => {
    if (!inputText.trim()) return;

    // Cancel any previous speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActivePlaybackProgress(0);
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);

    setIsGenerating(true);

    // Exact 2-second generation simulation
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);

      if (onAudioGenerated) {
        onAudioGenerated({
          voice: selectedVoice.name,
          text: inputText,
          language: selectedLanguage,
        });
      }

      // Auto-trigger speech preview if supported in browser
      playSynthesizedAudio();
    }, 2000);
  };

  const playSynthesizedAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(inputText);
      utterance.rate = selectedVoice.rate || 1.0;
      utterance.pitch = selectedVoice.pitch || 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        startProgressTracking();
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setActivePlaybackProgress(100);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback simulated progress if Web Speech API isn't supported
      setIsPlaying(true);
      startProgressTracking();
      setTimeout(() => {
        setIsPlaying(false);
        setActivePlaybackProgress(100);
        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      }, 4000);
    }
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
  };

  const startProgressTracking = () => {
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    setActivePlaybackProgress(0);
    const step = 2;
    playbackIntervalRef.current = setInterval(() => {
      setActivePlaybackProgress((prev) => {
        if (prev >= 98) {
          if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
          return 100;
        }
        return prev + step;
      });
    }, 100);
  };

  const handleResetSample = () => {
    setInputText(DEFAULT_SAMPLE_TEXT);
    setHasGenerated(false);
    setIsPlaying(false);
    setActivePlaybackProgress(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div
      className="bg-white text-gray-900 rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 transition-all relative overflow-hidden"
      id="interactive-demo-widget"
    >
      {/* Top Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-900 to-gray-200" />

      {/* LANGUAGE SELECTOR PILLS */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-gray-700" />
            <span>Select Model Language</span>
          </label>
          <span className="text-xs text-gray-400 font-mono">Neural Multilingual v2</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {MOCK_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.name;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white shadow-sm ring-2 ring-black/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{lang.name}</span>
                <span className={`text-[10px] opacity-75 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                  ({lang.nativeName})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BORDERLESS TEXTAREA & CHARACTER COUNTER */}
      <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/80 mb-5 focus-within:border-gray-400 focus-within:bg-white transition-all">
        <div className="flex justify-between items-center pb-2 mb-1 border-b border-gray-200/50 text-[11px] text-gray-500">
          <span className="font-medium">Prompt Input / Synthesis Script</span>
          <button
            type="button"
            onClick={handleResetSample}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
            title="Reset default text"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Sample</span>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleTextChange}
          placeholder="Type or paste the text you want the AI voice to generate..."
          className="w-full bg-transparent border-none outline-none resize-none text-gray-800 text-sm md:text-base leading-relaxed placeholder-gray-400 focus:ring-0 p-0 min-h-[90px]"
          rows={3}
        />

        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 mt-2 text-xs">
          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Studio Audio Engine Ready</span>
          </div>

          <div className="font-mono text-[11px]">
            <span className={inputText.length >= MAX_CHARS ? 'text-rose-600 font-bold' : 'text-gray-500'}>
              {inputText.length}
            </span>
            <span className="text-gray-400">/{MAX_CHARS} chars</span>
          </div>
        </div>
      </div>

      {/* CONTROLS ROW: VOICE SELECTOR + GENERATE BUTTON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
        
        {/* VOICE SELECTOR DROPDOWN */}
        <div className="relative flex-1" ref={dropdownRef}>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1.5">
            Voice Persona
          </label>

          <button
            type="button"
            onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                {selectedVoice.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{selectedVoice.name}</span>
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                    {selectedVoice.type}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate max-w-[200px] sm:max-w-[240px]">
                  {selectedVoice.accent}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showVoiceDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN MENU */}
          {showVoiceDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                Available Voice Models
              </div>
              {MOCK_VOICES.map((voice) => {
                const isCurrent = selectedVoice.id === voice.id;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoiceDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      isCurrent ? 'bg-gray-50/80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                        isCurrent ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {voice.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">{voice.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-mono">
                            {voice.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 block">{voice.accent}</span>
                      </div>
                    </div>

                    {isCurrent && <Check className="w-4 h-4 text-black" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* PRIMARY CTA: GENERATE AUDIO */}
        <div className="flex flex-col justify-end sm:w-auto">
          <span className="hidden sm:block text-xs text-transparent mb-1.5 select-none">Action</span>
          <button
            type="button"
            onClick={handleGenerateAudio}
            disabled={isGenerating || !inputText.trim()}
            className="w-full sm:w-auto min-w-[180px] bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                <span>Synthesizing Voice...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GENERATION STATE OR AUDIO PLAYBACK CONTROLLER */}
      {isGenerating && (
        <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[40, 75, 100, 50, 85, 30, 95, 60, 45, 80, 65, 35].map((height, i) => (
                <span
                  key={i}
                  className="w-1 bg-black rounded-full animate-bounce"
                  style={{
                    height: `${Math.max(10, (height / 100) * 24)}px`,
                    animationDelay: `${i * 75}ms`,
                    animationDuration: '800ms',
                  }}
                />
              ))}
            </div>
            <div className="text-xs">
              <span className="font-semibold text-gray-900 block">Neural Vocoder Processing</span>
              <span className="text-gray-500 font-mono text-[11px]">Generating sub-band acoustic spectrum...</span>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-500">2.0s</span>
        </div>
      )}

      {/* COMPLETED AUDIO PLAYBACK BAR */}
      {!isGenerating && hasGenerated && (
        <div className="mt-6 p-4 rounded-xl bg-gray-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={isPlaying ? stopAudio : playSynthesizedAudio}
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow"
              title={isPlaying ? 'Pause playback' : 'Play synthesized audio'}
            >
              {isPlaying ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">{selectedVoice.name} Voice Track</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  24kHz Studio HD
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {selectedLanguage} • 280ms Latency • Audio Ready
              </p>
            </div>
          </div>

          {/* AUDIO WAVEFORM PROGRESS BAR */}
          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden relative">
              <div
                className="bg-emerald-400 h-full transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${activePlaybackProgress}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 shrink-0">
              <Volume2 className="w-3.5 h-3.5 text-gray-300" />
              <span>{isPlaying ? 'Playing' : 'Ready'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
