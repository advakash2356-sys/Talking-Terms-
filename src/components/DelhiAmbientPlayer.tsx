import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Train,
  Heart,
  Moon,
  ChevronUp,
  ChevronDown,
  Music2,
  Play,
  Pause,
  Headphones
} from 'lucide-react';
import { ambientSoundEngine } from '../utils/ambientSynth';

export const DelhiAmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'chai_rain' | 'metro_lofi' | 'theta_432' | 'late_night_cp'>('chai_rain');
  const [volume, setVolume] = useState(0.35);
  const [isExpanded, setIsExpanded] = useState(false);

  const tracks = [
    {
      id: 'chai_rain' as const,
      name: 'Chai Tapri Rain',
      subtitle: 'Mukherjee Nagar Tin Roof & Monsoon',
      icon: CloudRain,
      color: 'text-amber-400',
      bg: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
    },
    {
      id: 'metro_lofi' as const,
      name: 'Yellow Line Lo-Fi',
      subtitle: 'Gentle Subway Drone & Rhodes Chords',
      icon: Train,
      color: 'text-yellow-400',
      bg: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40',
    },
    {
      id: 'theta_432' as const,
      name: '432Hz Vagus Relax',
      subtitle: 'Binaural Theta Calm for High Anxiety',
      icon: Heart,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
    },
    {
      id: 'late_night_cp' as const,
      name: '3 AM CP Breeze',
      subtitle: 'Inner Circle Solfeggio 174Hz Tone',
      icon: Moon,
      color: 'text-fuchsia-400',
      bg: 'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/40',
    },
  ];

  const handleTogglePlay = (trackId?: 'chai_rain' | 'metro_lofi' | 'theta_432' | 'late_night_cp') => {
    const target = trackId || currentTrack;
    if (isPlaying && (!trackId || trackId === currentTrack)) {
      ambientSoundEngine.stop();
      setIsPlaying(false);
    } else {
      setCurrentTrack(target);
      ambientSoundEngine.play(target);
      ambientSoundEngine.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientSoundEngine.setVolume(val);
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end">
      {/* Expanded Track Picker Drawer */}
      {isExpanded && (
        <div className="mb-3 w-72 sm:w-80 bg-[#0c101c]/95 backdrop-blur-2xl border border-orange-500/30 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 origin-bottom-right">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-xs font-black text-white tracking-wide">Delhi Lo-Fi Generator</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Web Audio
            </span>
          </div>

          {/* Track List */}
          <div className="space-y-2 my-3">
            {tracks.map((t) => {
              const Icon = t.icon;
              const isSelected = currentTrack === t.id && isPlaying;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTogglePlay(t.id)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? `bg-gradient-to-r ${t.bg} text-white shadow-lg`
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl bg-slate-950/80 ${t.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {isSelected && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{t.subtitle}</div>
                    </div>
                  </div>
                  <div className="p-1 rounded-full bg-slate-950/50 text-slate-300">
                    {isSelected ? <Pause className="w-3.5 h-3.5 fill-orange-400 text-orange-400" /> : <Play className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextVol = volume > 0 ? 0 : 0.4;
                setVolume(nextVol);
                ambientSoundEngine.setVolume(nextVol);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-orange-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <div className="flex items-center gap-2 bg-[#0c101c]/90 border border-orange-500/40 hover:border-orange-400 rounded-full p-1.5 shadow-2xl backdrop-blur-xl transition-all group">
        <button
          type="button"
          onClick={() => handleTogglePlay()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isPlaying
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-300 hover:text-white'
          }`}
          title={isPlaying ? 'Pause Ambient Sound' : 'Play Soothing Delhi Lo-Fi Beats'}
        >
          {isPlaying ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
              </span>
              <span>Playing {tracks.find((t) => t.id === currentTrack)?.name.split(' ')[0]}</span>
            </>
          ) : (
            <>
              <Music2 className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-12 transition-transform" />
              <span>Delhi Lo-Fi Beats</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Choose Track"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
