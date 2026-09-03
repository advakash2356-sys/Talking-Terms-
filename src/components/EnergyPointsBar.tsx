import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  Gift,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface EnergyPointsBarProps {
  balance: number;
  onOpenCreditsModal: () => void;
  onOpenShieldModal: () => void;
}

export const EnergyPointsBar: React.FC<EnergyPointsBarProps> = ({
  balance,
  onOpenCreditsModal,
  onOpenShieldModal,
}) => {
  const [streakDays, setStreakDays] = useState(3);
  const [hasClaimedDailyBonus, setHasClaimedDailyBonus] = useState(false);
  const [showBonusSpark, setShowBonusSpark] = useState(false);

  // Calculate percentage of daily 100 free sparks
  const energyPercent = Math.min(100, Math.max(10, (balance / 50) * 100));

  const handleClaimDailyBonus = () => {
    if (hasClaimedDailyBonus) return;
    setHasClaimedDailyBonus(true);
    setShowBonusSpark(true);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    setTimeout(() => setShowBonusSpark(false), 3000);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Daily Streak Fire Badge */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold font-mono cursor-pointer hover:border-orange-400 transition-all"
        title="3-Day Daily Voice Vent Streak! Free bonus sparks recharge every midnight."
        onClick={handleClaimDailyBonus}
      >
        <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
        <span className="text-orange-300">{streakDays}d Streak</span>
        {!hasClaimedDailyBonus && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </div>

      {/* Energy Sparks Meter & Quick Top-up Trigger */}
      <button
        type="button"
        onClick={onOpenCreditsModal}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 transition-all group text-left shadow-md"
        title="Tap to view Daily Energy Balance or Top-Up"
      >
        <div className="relative flex items-center justify-center">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
          {showBonusSpark && (
            <span className="absolute -top-4 -right-2 text-[10px] font-black text-emerald-400 animate-bounce">
              +15⚡
            </span>
          )}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
            <span>{balance} Sparks</span>
            <span className="text-[10px] text-amber-400/80 font-mono font-normal">Active</span>
          </div>
          {/* Energy gauge line */}
          <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Ghost Mode Quick Indicator */}
      <button
        type="button"
        onClick={onOpenShieldModal}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 text-xs font-mono transition-all"
        title="Ghost Shield Active: No logs, blind tokens verified"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold">Ghost Mode</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </button>
    </div>
  );
};
