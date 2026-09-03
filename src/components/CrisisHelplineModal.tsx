import React from 'react';
import { Phone, ShieldAlert, Heart, X, ExternalLink, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { CrisisHelpline } from '../types';

interface CrisisHelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VERIFIED_HELPLINES: CrisisHelpline[] = [
  {
    id: 'telemanas',
    name: 'Tele-MANAS (Govt of India)',
    number: '14416 / 1800-891-4416',
    telUri: 'tel:14416',
    languages: 'Hindi, English & 20 Regional Languages',
    hours: '24/7 • Toll-Free • Govt Certified',
    focus: 'Comprehensive Mental Health Support & Crisis Intervention',
    verifiedGov: true,
  },
  {
    id: 'kiran',
    name: 'KIRAN National Mental Health Helpline',
    number: '1800-599-0019',
    telUri: 'tel:18005990019',
    languages: 'Hindi, English & 13 Regional Languages',
    hours: '24/7 • Free Emergency Helpline',
    focus: 'Depression, Stress, Anxiety, Trauma & Crisis Triage',
    verifiedGov: true,
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation Helpline',
    number: '+91 9999 666 555',
    telUri: 'tel:+919999666555',
    languages: 'Hindi, English, Gujarati, Tamil, Marathi',
    hours: '24/7 • Free & Immediate Peer Counseling',
    focus: 'Emotional Distress, Relationship Strain & Suicidal Ideation',
    verifiedGov: false,
  },
  {
    id: 'samaritans',
    name: 'Samaritans Mumbai Helpline',
    number: '+91 84229 84528',
    telUri: 'tel:+918422984528',
    languages: 'English & Hindi',
    hours: '5:00 PM – 8:00 PM Daily',
    focus: 'Active Empathetic Listening & Despair Counseling',
    verifiedGov: false,
  },
];

export const CrisisHelplineModal: React.FC<CrisisHelplineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="bg-[#0b0f19] border-2 border-rose-500/60 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-[0_0_60px_rgba(244,63,94,0.3)] relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow Header */}
        <div className="flex items-start justify-between pb-3 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h2 id="crisis-title" className="text-lg sm:text-xl font-black text-white font-display flex items-center gap-2">
                Immediate Crisis Support
              </h2>
              <p className="text-xs text-rose-300/90 font-medium">
                You matter. Free, confidential & verified 24/7 helplines
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close crisis support modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        <div className="my-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-slate-200 leading-relaxed">
          <p className="font-semibold text-rose-200 mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            Talking Terms is a peer listening app, not a medical provider.
          </p>
          If you or someone you know is in acute distress or having thoughts of self-harm, please reach out directly to certified professionals immediately below.
        </div>

        {/* Directory List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 my-1">
          {VERIFIED_HELPLINES.map((helpline) => (
            <div
              key={helpline.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{helpline.name}</span>
                  {helpline.verifiedGov && (
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Govt Certified
                    </span>
                  )}
                </div>
                <div className="text-xs text-rose-400 font-mono font-bold">{helpline.number}</div>
                <div className="text-[11px] text-slate-400">{helpline.languages} • {helpline.hours}</div>
                <div className="text-[11px] text-slate-500 italic">{helpline.focus}</div>
              </div>

              <a
                href={helpline.telUri}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 shrink-0"
              >
                <Phone className="w-3.5 h-3.5 fill-white" />
                <span>Call Now</span>
              </a>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Toll-free across India</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white underline min-h-[44px] flex items-center"
          >
            Return to App
          </button>
        </div>

      </div>
    </div>
  );
};
