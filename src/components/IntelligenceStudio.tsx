import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Calendar,
  CheckSquare,
  FileText,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { StreamingSTTEngine } from '../utils/streamingSTT';
import { IntelligenceRouter, CategorizedIntelligence } from '../utils/IntelligenceRouter';
import { ContextMemory, ContextUpdateResult } from '../utils/ContextMemoryEngine';
import { TelemetryMatrix } from '../utils/TelemetryMatrix';
import { TelemetryMatrixModal } from './TelemetryMatrixModal';

export const IntelligenceStudio: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'notes'>('tasks');
  const [clarificationPrompt, setClarificationPrompt] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<ContextUpdateResult | null>(null);

  // Active Context State
  const [contextState, setContextState] = useState(ContextMemory.getState());

  const sttEngineRef = useRef<StreamingSTTEngine | null>(null);

  // Subscribe to Context Memory updates
  useEffect(() => {
    const unsub = ContextMemory.subscribe(() => {
      setContextState(ContextMemory.getState());
    });
    return () => unsub();
  }, []);

  // Initialize Speech-to-Text streaming engine
  useEffect(() => {
    sttEngineRef.current = new StreamingSTTEngine({
      onInterimText: (text) => {
        setInputText(text);
      },
      onFinalText: (text) => {
        setInputText(text);
        setIsRecording(false);
        setMicVolume(0);
      },
      onVolumeChange: (vol) => {
        setMicVolume(vol);
      },
      onStateChange: (state) => {
        setIsRecording(state === 'listening');
      },
      onError: (err) => {
        console.warn('[IntelligenceStudio] STT error:', err);
        setIsRecording(false);
        setMicVolume(0);
      }
    });

    return () => {
      sttEngineRef.current?.stop();
    };
  }, []);

  // Toggle Live Streaming Mic
  const handleToggleRecord = async () => {
    if (isRecording) {
      sttEngineRef.current?.stop();
    } else {
      setClarificationPrompt(null);
      await sttEngineRef.current?.start();
    }
  };

  // Discard recording
  const handleDiscard = () => {
    sttEngineRef.current?.discard();
    setInputText('');
    setClarificationPrompt(null);
  };

  // Process & Route with Optimistic UI updates
  const handleProcessAndRoute = async (customText?: string) => {
    const textToProcess = (customText || inputText).trim();
    if (!textToProcess) return;

    setIsProcessing(true);
    setClarificationPrompt(null);
    const start = Date.now();

    // 1. Optimistic UI Notification
    TelemetryMatrix.recordEvent('ACTION_OPTIMISTIC_APPLIED', {
      text: textToProcess.substring(0, 40)
    });

    try {
      // 2. Perform low-latency Intelligence Routing (JSON-in/JSON-out)
      const categorized: CategorizedIntelligence = await IntelligenceRouter.route(textToProcess);

      // 3. Resolve with Contextual Memory (check updates vs creates vs completion)
      const result = ContextMemory.resolveAndApply(textToProcess, categorized);
      const totalLatency = Date.now() - start;

      setLastLatency(totalLatency);
      setLastActionResult(result);

      if (result.actionType === 'CLARIFICATION_REQUIRED' && result.clarificationQuestion) {
        setClarificationPrompt(result.clarificationQuestion);
      } else {
        setInputText('');
        if (result.itemType === 'calendar_events') setActiveTab('calendar');
        if (result.itemType === 'tasks') setActiveTab('tasks');
        if (result.itemType === 'notes') setActiveTab('notes');
      }
    } catch (err: any) {
      console.error('[IntelligenceStudio] Routing error:', err);
      TelemetryMatrix.recordFriction('LLM_PARSE_ERROR', err?.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 font-sans">
      {/* TELEMETRY MODAL */}
      <TelemetryMatrixModal
        isOpen={showTelemetryModal}
        onClose={() => setShowTelemetryModal(false)}
      />

      {/* HEADER WITH LATENCY & TELEMETRY BADGE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-slate-900/80 border border-orange-500/30 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Zap className="w-5 h-5 fill-orange-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Intelligence Router & Voice Capture
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time streaming speech-to-text with semantic JSON categorization and context verification
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {lastLatency !== null && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Turnaround: {lastLatency}ms</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowTelemetryModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
          >
            <Activity className="w-4 h-4" />
            <span>Success Matrix</span>
          </button>
        </div>
      </div>

      {/* MAIN CAPTURE & CONTEXT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: SPEECH & TEXT CAPTURE (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Streaming Dictation</span>
                </div>
                {isRecording && (
                  <span className="text-[11px] font-mono text-orange-400 bg-orange-950/60 border border-orange-500/40 px-2 py-0.5 rounded-full animate-pulse">
                    Live Stream Sub-200ms
                  </span>
                )}
              </div>

              {/* LIVE TRANSCRIPT INPUT */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tap microphone and speak in English/Hinglish, or paste any notes/tasks..."
                  className="w-full h-36 bg-slate-950/90 border border-slate-800 focus:border-orange-500 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none font-sans"
                />

                {/* VOLUME METER WAVEFORM WHEN RECORDING */}
                {isRecording && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-orange-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-slate-300">Streaming Mic Level:</span>
                    </div>
                    <div className="w-32 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75"
                        style={{ width: `${Math.min(100, Math.max(8, micVolume))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CLARIFICATION WARNING BANNER */}
              {clarificationPrompt && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Clarification Needed:</strong> {clarificationPrompt}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION CONTROLS */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-orange-500 hover:bg-orange-400 text-slate-950'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop & Stream' : 'Voice Dictate'}</span>
                </button>

                {inputText && (
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors text-xs"
                    title="Discard transcript"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={!inputText.trim() || isProcessing}
                onClick={() => handleProcessAndRoute()}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                  !inputText.trim() || isProcessing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Routing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Process</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1-CLICK TEST SCENARIOS */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1-Click Context Test Vectors
            </h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setInputText('Reschedule the UPSC Mains GS review meeting to 5:00 PM tomorrow');
                  handleProcessAndRoute('Reschedule the UPSC Mains GS review meeting to 5:00 PM tomorrow');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-all"
              >
                <span>📅 Contextual Meeting Reschedule</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('Mark CSAT Sectional Mock Test 4 as completed');
                  handleProcessAndRoute('Mark CSAT Sectional Mock Test 4 as completed');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 hover:text-white flex items-center justify-between group transition-all"
              >
                <span>✅ Contextual Task Completion</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('Do that thing we talked about');
                  handleProcessAndRoute('Do that thing we talked about');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800/80 text-xs text-rose-300 hover:text-rose-200 flex items-center justify-between group transition-all"
              >
                <span>⚠️ Ambiguity Clarification Trigger</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTEXT MEMORY STATE DASHBOARD (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col">
          {/* TAB HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tasks'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks ({contextState.tasks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-orange-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar ({contextState.calendar_events.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes ({contextState.notes.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Store</span>
            </div>
          </div>

          {/* ACTION NOTIFICATION TOAST */}
          {lastActionResult && lastActionResult.actionType !== 'CLARIFICATION_REQUIRED' && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lastActionResult.message}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                HTTP 200 OK
              </span>
            </div>
          )}

          {/* TAB CONTENTS */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[420px] pr-1">
            {/* TASKS LIST */}
            {activeTab === 'tasks' && (
              contextState.tasks.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">No active tasks. Dictate or write to add.</div>
              ) : (
                contextState.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      task.completed
                        ? 'bg-slate-950/40 border-slate-850 opacity-60'
                        : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => ContextMemory.toggleTask(task.id!)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700 hover:border-emerald-400 bg-slate-900'
                        }`}
                      >
                        {task.completed && <CheckSquare className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold text-white ${
                            task.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                          {task.dueDate && <span className="text-amber-400">📅 {task.dueDate}</span>}
                          {task.priority && (
                            <span
                              className={`px-1.5 py-0.2 rounded uppercase font-bold ${
                                task.priority === 'urgent' || task.priority === 'high'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-900 text-slate-400'
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => ContextMemory.deleteItem('tasks', task.id!)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )
            )}

            {/* CALENDAR EVENTS LIST */}
            {activeTab === 'calendar' && (
              contextState.calendar_events.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">No scheduled events. Dictate or write to schedule.</div>
              ) : (
                contextState.calendar_events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-orange-500/50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{event.title}</span>
                        {event.allDay && (
                          <span className="px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-500/30 text-[9px] font-mono font-bold">
                            ALL DAY
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{event.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-300">
                        {event.startDate && (
                          <span className="text-orange-400">
                            🕒 {event.startDate.replace('T', ' ').replace('Z', '')}
                          </span>
                        )}
                        {event.location && (
                          <span className="text-slate-400">📍 {event.location}</span>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <span className="text-slate-400">👥 {event.attendees.join(', ')}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => ContextMemory.deleteItem('calendar_events', event.id!)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )
            )}

            {/* NOTES LIST */}
            {activeTab === 'notes' && (
              contextState.notes.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">No notes captured yet.</div>
              ) : (
                contextState.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">{note.title}</div>
                      <p className="text-[11px] text-slate-300 mt-1 whitespace-pre-line">{note.content}</p>
                      {note.keyPoints && note.keyPoints.length > 0 && (
                        <ul className="mt-2 space-y-0.5 list-disc list-inside text-[10px] text-cyan-300/80">
                          {note.keyPoints.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 text-[9px] font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => ContextMemory.deleteItem('notes', note.id!)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceStudio;
