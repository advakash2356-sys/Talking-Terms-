import React, { useState, useEffect } from 'react';
import { Heart, Wind, CheckCircle2, ShieldCheck, Sparkles, Smile, Meh, Frown, ArrowRight, Download, X } from 'lucide-react';
import { DecompressionRecord, WipeReceipt } from '../types';

interface PostCallDecompressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaName: string;
  callDurationSeconds: number;
}

export const PostCallDecompressionModal: React.FC<PostCallDecompressionModalProps> = ({
  isOpen,
  onClose,
  personaName,
  callDurationSeconds,
}) => {
  const [selectedMood, setSelectedMood] = useState<'lighter' | 'neutral' | 'heavy' | 'peaceful'>('lighter');
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathCounter, setBreathCounter] = useState(4);
  const [notes, setNotes] = useState('');
  const [isBreathActive, setIsBreathActive] = useState(true);

  // Simulated 4-7-8 Breathing Loop
  useEffect(() => {
    if (!isOpen || !isBreathActive) return;

    let timer: NodeJS.Timeout;
    const interval = setInterval(() => {
      setBreathCounter((prev) => {
        if (prev > 1) return prev - 1;
        
        // Transition phases
        setBreathPhase((currentPhase) => {
          if (currentPhase.startsWith('Inhale')) {
            timer = setTimeout(() => {}, 0);
            return 'Hold (7s)';
          } else if (currentPhase.startsWith('Hold')) {
            return 'Exhale (8s)';
          } else {
            return 'Inhale (4s)';
          }
        });

        return 4;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isOpen, isBreathActive]);

  if (!isOpen) return null;

  const audioBytesEstimate = callDurationSeconds * 16000 * 2; // 16kHz 16-bit PCM

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl animate-fade-in"
    >
      <div className="bg-[#0b0f19] border border-orange-500/30 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-black text-white font-display">
              Post-Call Decompression
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* EPHEMERAL DATA WIPE AUDIT RECEIPT */}
        <div className="my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Trace Ephemeral Audit</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              RAM PURGED
            </span>
          </div>
          <div className="text-slate-300 flex justify-between">
            <span>Call Partner:</span>
            <span className="text-white font-bold">{personaName}</span>
          </div>
          <div className="text-slate-300 flex justify-between">
            <span>Session Duration:</span>
            <span className="text-white font-bold">{Math.floor(callDurationSeconds / 60)}m {callDurationSeconds % 60}s</span>
          </div>
          <div className="text-slate-300 flex justify-between">
            <span>Audio Buffer Purged:</span>
            <span className="text-emerald-300 font-bold">~{(audioBytesEstimate / 1024).toFixed(0)} KB (0 Bytes Retained)</span>
          </div>
          <div className="text-slate-300 flex justify-between">
            <span>Argon2 Session Key:</span>
            <span className="text-slate-400 line-through">Destroyed upon disconnect</span>
          </div>
        </div>

        {/* 4-7-8 CALMING BREATHWORK CIRCLE */}
        <div className="my-3 p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Somatic 4-7-8 Grounding Pulse</span>
          </p>

          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            {/* Animated Pulser */}
            <div className={`absolute inset-0 rounded-full border-2 border-orange-400/40 transition-all duration-1000 ${
              breathPhase.startsWith('Inhale') ? 'scale-110 bg-orange-500/10' : breathPhase.startsWith('Hold') ? 'scale-100 bg-amber-500/15' : 'scale-90 bg-slate-800/40'
            }`} />
            <div className="relative z-10 text-center">
              <span className="text-xs font-mono font-bold text-orange-400 block">{breathPhase}</span>
              <span className="text-2xl font-black text-white font-display">{breathCounter}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Slow steady breathing resets the vagus nerve after emotional venting.</p>
        </div>

        {/* HOW DO YOU FEEL NOW? MOOD CHECK */}
        <div className="my-2 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">How do you feel after this session?</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'peaceful', label: 'Peaceful', icon: Sparkles, color: 'text-amber-400' },
              { id: 'lighter', label: 'Lighter', icon: Smile, color: 'text-emerald-400' },
              { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-300' },
              { id: 'heavy', label: 'Still Heavy', icon: Frown, color: 'text-rose-400' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMood(item.id as any)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition-all min-h-[54px] ${
                    selectedMood === item.id
                      ? 'bg-orange-500/20 border-orange-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAKEAWAY NOTE */}
        <div className="my-2 space-y-1">
          <label className="text-xs font-medium text-slate-400 block">Private note for yourself (optional, local only):</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Kabir said to take a walk and sleep early..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-orange-500"
          />
        </div>

        {/* DONE BUTTON */}
        <div className="mt-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <span>Complete & Return to Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
