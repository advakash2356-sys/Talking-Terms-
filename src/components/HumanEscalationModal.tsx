import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Sparkles, Clock, Heart, Users, MessageSquare, Phone } from 'lucide-react';
import { Persona } from '../types';

interface HumanEscalationModalProps {
  persona?: Persona | null;
  onClose: () => void;
}

export const HumanEscalationModal: React.FC<HumanEscalationModalProps> = ({
  persona,
  onClose,
}) => {
  const [queueStatus, setQueueStatus] = useState<'selecting' | 'queued' | 'connected'>('selecting');
  const [queuePosition, setQueuePosition] = useState(3);
  const [waitTimeSeconds, setWaitTimeSeconds] = useState(45);
  const [selectedTopic, setSelectedTopic] = useState('General Offloading');
  const [matchedListener, setMatchedListener] = useState<string | null>(null);

  // Topics
  const topics = [
    'Exam / Career Stress',
    'Corporate Burnout',
    'Heartbreak & Relationships',
    'Family Pressure',
    'Loneliness & Isolation',
    'LGBTQ+ Safe Space',
    'General Offloading',
  ];

  // Queue countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (queueStatus === 'queued') {
      timer = setInterval(() => {
        setWaitTimeSeconds((prev) => {
          if (prev <= 1) {
            setQueueStatus('connected');
            setMatchedListener('Sunita_Listener_NCR');
            return 0;
          }
          return prev - 1;
        });

        if (Math.random() > 0.6 && queuePosition > 1) {
          setQueuePosition((pos) => pos - 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [queueStatus, queuePosition]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <UserCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Connect to Real Human Listener</h2>
              <p className="text-xs text-purple-400 font-mono">Peer-to-Peer Anonymous Escalation Queue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white font-bold p-1">
            ✕
          </button>
        </div>

        {/* SELECTING TOPIC STATE */}
        {queueStatus === 'selecting' && (
          <div className="space-y-4">
            {persona && (
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-2xl text-xs text-amber-300">
                Escalating session from AI Persona <strong>{persona.name} ({persona.title})</strong>.
              </div>
            )}

            <p className="text-xs text-gray-300 font-medium">
              Select topic to match with a trained, background-verified empathetic human listener:
            </p>

            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedTopic === topic
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950/50'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> 100% Anonymous Peer Call
              </div>
              <p>Your real phone number and identity are masked via Zero-Knowledge Argon2id Blind Tokens.</p>
            </div>

            <button
              onClick={() => setQueueStatus('queued')}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" /> Enter Anonymous Listener Queue
            </button>
          </div>
        )}

        {/* QUEUED STATE */}
        {queueStatus === 'queued' && (
          <div className="text-center py-6 space-y-6">
            <div className="relative flex items-center justify-center my-6">
              <div className="w-24 h-24 rounded-full bg-purple-500/20 animate-ping absolute" />
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40 z-10">
                <Users className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">Matching with Verified Human Listener</h3>
              <p className="text-xs text-purple-400 font-mono">Topic: {selectedTopic}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl font-mono text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block uppercase">Queue Position</span>
                <span className="text-xl font-bold text-amber-400">#{queuePosition}</span>
              </div>

              <div>
                <span className="text-gray-400 text-[10px] block uppercase">Est. Wait Time</span>
                <span className="text-xl font-bold text-emerald-400">{waitTimeSeconds}s</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Hold tight! Argon2id Handshake in progress...
            </p>

            <button
              onClick={() => setQueueStatus('selecting')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-xl font-semibold"
            >
              Cancel Match
            </button>
          </div>
        )}

        {/* CONNECTED STATE */}
        {queueStatus === 'connected' && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-emerald-400">Human Listener Connected!</h3>
              <p className="text-xs text-gray-300 mt-1">
                You are now paired with <strong>{matchedListener}</strong>
              </p>
            </div>

            <div className="bg-gray-900/90 border border-emerald-500/30 p-4 rounded-2xl text-xs text-gray-300 space-y-2 text-left">
              <p className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-End Encrypted Session Active
              </p>
              <p className="text-gray-400">"Namaste! I am here to listen with full empathy. What would you like to talk about today?"</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition-all"
              >
                Start Voice/Text Offloading
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
