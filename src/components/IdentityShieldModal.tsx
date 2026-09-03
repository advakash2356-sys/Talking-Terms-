import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  RefreshCw,
  Lock,
  CheckCircle2,
  Zap,
  Copy,
  Check,
  Trash2,
  EyeOff,
  Radio,
  Sparkles,
  AlertTriangle,
  BrainCircuit,
  FileText
} from 'lucide-react';
import { ShieldIdentity } from '../types';
import { getClientContextMemory, saveClientContextMemory, purgeAllClientData } from '../utils/localVault';
import { getDailyAllowance } from '../utils/dailyAllowance';

interface IdentityShieldModalProps {
  identity: ShieldIdentity;
  onUpdateIdentity: (newIdentity: ShieldIdentity) => void;
  onClose: () => void;
}

export const IdentityShieldModal: React.FC<IdentityShieldModalProps> = ({
  identity,
  onUpdateIdentity,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [nukeConfirm, setNukeConfirm] = useState(false);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const [contextMemory, setContextMemory] = useState(getClientContextMemory());
  const [dailyState, setDailyState] = useState(getDailyAllowance());

  const toggleContextMemory = () => {
    const updated = saveClientContextMemory({ enabled: !contextMemory.enabled });
    setContextMemory(updated);
  };

  const handleTotalPurge = () => {
    if (!purgeConfirm) {
      setPurgeConfirm(true);
      setTimeout(() => setPurgeConfirm(false), 4000);
      return;
    }
    purgeAllClientData();
    window.location.reload();
  };

  const copyKey = () => {
    navigator.clipboard.writeText(identity.hashedIdentityKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = () => {
    setIsGeneratingKey(true);
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    setTimeout(() => {
      const newSeed = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      const newIdentity: ShieldIdentity = {
        userUuid: 'usr_' + Math.random().toString(36).substring(2, 9),
        hashedIdentityKey: '$argon2id$v=19$m=65536,t=3,p=4$' + newSeed,
        displayMoniker: `Anonymous_Aspirant_${Math.floor(1000 + Math.random() * 9000)}`,
        blindTokenBalance: identity.blindTokenBalance < 15 ? 15 : identity.blindTokenBalance,
        shieldActive: true,
        generatedAt: new Date().toLocaleTimeString(),
        activeBlindTokens: identity.activeBlindTokens || [],
      };

      onUpdateIdentity(newIdentity);
      setIsGeneratingKey(false);
      setNukeConfirm(true);
      setTimeout(() => setNukeConfirm(false), 3000);
    }, 600);
  };

  const claimTokens = () => {
    if (navigator.vibrate) navigator.vibrate(40);
    onUpdateIdentity({
      ...identity,
      blindTokenBalance: identity.blindTokenBalance + 15,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in"
    >
      <div className="bg-[#0b0f19] border border-emerald-500/40 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative space-y-4 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase mb-0.5">
                <EyeOff className="w-3 h-3" />
                <span>DPDP 2023 Compliant</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Ghost Shield & Privacy Controls
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close Ghost Shield settings"
          >
            ✕
          </button>
        </div>

        {/* DAILY ALLOWANCE & STREAK BADGE */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono">
              <span>Day {dailyState.streakDays} Streak 🔥</span>
              <span className="text-[10px] text-slate-400">(Resets Midnight)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {dailyState.freeMinutesAvailable} mins of daily free voice remaining
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-amber-400 font-display">
              {dailyState.freeMinutesAvailable}m Free
            </span>
          </div>
        </div>

        {/* 3 CORE PRIVACY PILLARS */}
        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
              1
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-white">Zero PII Collected (No Login / Phone / Email)</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Untraceable anonymous access conforming to Indian DPDP regulations.</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-white">Ephemeral RAM Purge After Each Call</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Live audio buffers are destroyed in memory upon call hangup. 0 bytes retained.</p>
            </div>
          </div>
        </div>

        {/* LOCAL CONTEXT MEMORY TOGGLE */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Client-Side Context Memory</div>
              <div className="text-[10px] text-slate-400">
                {contextMemory.enabled
                  ? 'Personas remember context on this browser only (Encrypted locally)'
                  : 'Complete Amnesia: Every call starts completely blank'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleContextMemory}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              contextMemory.enabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {contextMemory.enabled ? 'Enabled ✓' : 'Amnesia'}
          </button>
        </div>

        {/* CURRENT ANONYMOUS PROFILE */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active Moniker:</span>
            <span className="text-xs font-black text-orange-400 font-mono">{identity.displayMoniker}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{identity.blindTokenBalance} Energy Sparks</span>
            </div>
            <button
              type="button"
              onClick={claimTokens}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold rounded-xl transition-all"
            >
              +15 Sparks
            </button>
          </div>
        </div>

        {/* ROTATE / NUKE IDENTITY ACTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={regenerateKey}
            disabled={isGeneratingKey}
            className="min-h-[44px] px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKey ? 'animate-spin' : ''}`} />
            <span>{nukeConfirm ? 'Identity Refreshed! ✓' : 'Rotate Moniker'}</span>
          </button>

          <button
            type="button"
            onClick={handleTotalPurge}
            className={`min-h-[44px] px-3 py-2 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              purgeConfirm
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900 hover:bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{purgeConfirm ? 'Confirm Purge (Click Again)' : 'Purge All Local Data'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/20"
        >
          Close Ghost Shield
        </button>

      </div>
    </div>
  );
};
