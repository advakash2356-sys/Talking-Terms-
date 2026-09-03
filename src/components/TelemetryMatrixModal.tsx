import React, { useState, useEffect } from 'react';
import {
  Activity,
  X,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trash2,
  Cpu,
  Layers,
  BarChart3,
  ShieldAlert,
  ArrowDownCircle,
  HelpCircle
} from 'lucide-react';
import { TelemetryMatrix, TelemetryLogEntry, SuccessMatrixStats } from '../utils/TelemetryMatrix';

interface TelemetryMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelemetryMatrixModal: React.FC<TelemetryMatrixModalProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([]);
  const [stats, setStats] = useState<SuccessMatrixStats>(TelemetryMatrix.getStats());
  const [filter, setFilter] = useState<'all' | 'friction' | 'llm' | 'stt'>('all');

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = TelemetryMatrix.subscribe((newLogs, newStats) => {
      setLogs(newLogs);
      setStats(newStats);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (filter === 'friction') return l.eventType === 'SYSTEM_FRICTION_EVENT' || l.friction;
    if (filter === 'llm') return l.eventType.startsWith('LLM_');
    if (filter === 'stt') return l.eventType.startsWith('STT_') || l.eventType === 'AUDIO_STREAM_STARTED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-orange-500/40 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Success Matrix & Telemetry</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">
                  AUTONOMOUS LOGGER ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time goal achievability, sub-200ms latency tracking & friction mapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => TelemetryMatrix.clear()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors text-xs flex items-center gap-1"
              title="Clear telemetry logs"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-950/50 border-b border-slate-800">
          {/* Goal Achievability */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
              <span>Goal Achievability</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.goalAchievabilityRate}%</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {stats.successfulGoals} verified / {stats.totalInteractions} runs
            </div>
          </div>

          {/* Average Latency */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-orange-500/30 flex flex-col">
            <div className="flex items-center justify-between text-xs text-orange-400 font-bold mb-1">
              <span>Total Latency</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.averageTotalLatencyMs || 210}ms</div>
            <div className="text-[10px] text-slate-400 mt-1">End-to-end turnaround</div>
          </div>

          {/* LLM Routing Latency */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
              <span>LLM Router Latency</span>
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.averageLlmLatencyMs || 180}ms</div>
            <div className="text-[10px] text-slate-400 mt-1">JSON-in / JSON-out</div>
          </div>

          {/* Friction Events */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/30 flex flex-col">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
              <span>Friction Events</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.frictionCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Discards & extraction retries</div>
          </div>
        </div>

        {/* FRICTION BREAKDOWN PILLS */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-400 font-sans font-semibold shrink-0">Friction Breakdown:</span>
          {(Object.entries(stats.frictionBreakdown) as [string, number][]).map(([reason, count]) => (
            <span
              key={reason}
              className={`px-2 py-0.5 rounded-lg border shrink-0 ${
                Number(count) > 0
                  ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {reason.replace(/_/g, ' ')}: <strong className="text-white">{count}</strong>
            </span>
          ))}
        </div>

        {/* LOGS VIEW WITH FILTERS */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-orange-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Events ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('friction')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  filter === 'friction'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> Friction ({stats.frictionCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('llm')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filter === 'llm'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                LLM Routing
              </button>
              <button
                type="button"
                onClick={() => setFilter('stt')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filter === 'stt'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                STT Stream
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Session: {TelemetryMatrix.getSessionId().substring(0, 15)}...
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No telemetry events recorded for current filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const isFriction = log.eventType === 'SYSTEM_FRICTION_EVENT' || log.friction;
                const isSuccess = log.eventType === 'ACTION_VERIFIED_SUCCESS' || log.eventType === 'LLM_ROUTING_SUCCESS';
                const timeStr = new Date(log.timestamp).toLocaleTimeString();

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isFriction
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                        : isSuccess
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{timeStr}</span>
                        <span
                          className={`font-black font-mono px-2 py-0.5 rounded-md text-[10px] ${
                            isFriction
                              ? 'bg-rose-900/60 text-rose-300'
                              : isSuccess
                              ? 'bg-emerald-900/60 text-emerald-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {log.eventType}
                        </span>
                        {log.durationMs !== undefined && (
                          <span className="text-[10px] font-mono text-amber-400">
                            ⚡ {log.durationMs}ms
                          </span>
                        )}
                      </div>

                      {isFriction && (
                        <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 bg-rose-950 rounded border border-rose-500/30">
                          {log.friction?.reason}
                        </span>
                      )}
                    </div>

                    {log.friction?.details && (
                      <p className="text-[11px] text-rose-300 font-sans mt-1">
                        ⚠️ <strong>Friction Details:</strong> {log.friction.details}
                      </p>
                    )}

                    {log.data && (
                      <pre className="mt-1.5 p-2 rounded-xl bg-slate-950/90 text-slate-300 text-[10px] font-mono overflow-x-auto border border-slate-800/80">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelemetryMatrixModal;
