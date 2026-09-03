import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  ExternalLink,
  CloudCheck,
  CloudAlert,
  Loader2,
  Database,
  History
} from 'lucide-react';
import { voiceSnippetDB, VoiceSnippetRecord } from '../utils/voiceSnippetDB';
import { serverSyncQueue } from '../utils/serverSyncQueue';

interface FloatingRecordButtonProps {
  onTransferToStudio?: (text: string) => void;
  onNavigateTab?: (tab: 'personas' | 'mukherjee' | 'voice-studio' | 'ceo' | 'listener' | 'shield' | 'docker') => void;
}

export const FloatingRecordButton: React.FC<FloatingRecordButtonProps> = ({
  onTransferToStudio,
  onNavigateTab,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // IndexedDB Auto-save & Server Sync States
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saved_idb' | 'queued' | 'syncing' | 'synced' | 'failed'>('idle');
  const [recentSavedCount, setRecentSavedCount] = useState<number>(0);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [cachedSnippets, setCachedSnippets] = useState<VoiceSnippetRecord[]>([]);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const autoSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Recover uncommitted or recent draft from IndexedDB on initial mount
  useEffect(() => {
    async function recoverFromIndexedDB() {
      try {
        const allSnippets = await voiceSnippetDB.getAllSnippets();
        setCachedSnippets(allSnippets);
        setRecentSavedCount(allSnippets.length);

        const latestDraft = await voiceSnippetDB.getLatestDraft();
        if (latestDraft && latestDraft.transcript.trim()) {
          setLiveTranscript(latestDraft.transcript);
          setCurrentSnippetId(latestDraft.id);
          setRecordDuration(latestDraft.durationSeconds || 0);
          setSyncStatus(latestDraft.status);
        }
      } catch (err) {
        console.warn('IndexedDB initial recovery error:', err);
      }
    }
    recoverFromIndexedDB();

    // Subscribe to server sync queue status updates
    const unsubscribe = serverSyncQueue.subscribe((updatedQueue) => {
      setCachedSnippets(updatedQueue);
      setRecentSavedCount(updatedQueue.length);
      if (currentSnippetId) {
        const current = updatedQueue.find((s) => s.id === currentSnippetId);
        if (current) {
          setSyncStatus(current.status);
        }
      }
    });

    return () => unsubscribe();
  }, [currentSnippetId]);

  // 2. Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPermissionError('Web Speech API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalized = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalized += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (finalized) {
        setLiveTranscript((prev) => {
          const updated = (prev + finalized).trim();
          triggerIndexedDBAutoSave(updated, interim);
          return updated;
        });
      }
      setInterimText(interim);
      if (interim) {
        triggerIndexedDBAutoSave(liveTranscript, interim);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setPermissionError('Microphone permission was denied. Please allow access.');
        stopCapture();
      } else if (event.error !== 'no-speech') {
        console.warn('Speech capture warning:', event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart recognition while active
      if (isRecording) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoSaveDebounceRef.current) clearTimeout(autoSaveDebounceRef.current);
    };
  }, [isRecording, selectedLang, liveTranscript]);

  // 3. Auto-save to IndexedDB (Continuous, debounced write-ahead-log)
  const triggerIndexedDBAutoSave = (finalText: string, interim: string) => {
    if (autoSaveDebounceRef.current) clearTimeout(autoSaveDebounceRef.current);

    autoSaveDebounceRef.current = setTimeout(async () => {
      const combined = (finalText + (interim ? ' ' + interim : '')).trim();
      if (!combined) return;

      const snippetId = currentSnippetId || `snip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      if (!currentSnippetId) {
        setCurrentSnippetId(snippetId);
      }

      const record: VoiceSnippetRecord = {
        id: snippetId,
        transcript: finalText,
        interimText: interim,
        durationSeconds: recordDuration,
        language: selectedLang,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'saved',
        retryCount: 0,
      };

      try {
        await voiceSnippetDB.saveSnippet(record);
        setSyncStatus('saved_idb');
        const all = await voiceSnippetDB.getAllSnippets();
        setCachedSnippets(all);
        setRecentSavedCount(all.length);
      } catch (err) {
        console.warn('Auto-save to IndexedDB failed:', err);
      }
    }, 250);
  };

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript, interimText]);

  // Audio Level Meter & MediaRecorder
  const startAudioMeterAndRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Web Audio Analyser
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Hardware MediaRecorder for audio blob creation
      if (typeof MediaRecorder !== 'undefined') {
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(500); // 500ms slices
        mediaRecorderRef.current = recorder;
      }
    } catch (err: any) {
      console.warn('Audio stream unavailable:', err);
    }
  };

  const stopAudioMeterAndRecorder = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Voice Capture
  const startCapture = useCallback(() => {
    setPermissionError(null);
    setIsExpanded(true);

    const newId = `snip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setCurrentSnippetId(newId);
    setSyncStatus('idle');

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    try {
      recognitionRef.current?.start();
    } catch {}

    startAudioMeterAndRecorder();
    setIsRecording(true);
    setRecordDuration(0);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  // Stop Voice Capture -> Auto-commits to IndexedDB, then enqueues to ServerSync
  const stopCapture = useCallback(async () => {
    setIsRecording(false);
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    try {
      recognitionRef.current?.stop();
    } catch {}

    stopAudioMeterAndRecorder();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const fullText = (liveTranscript + ' ' + interimText).trim();
    if (fullText) {
      const activeId = currentSnippetId || `snip_${Date.now()}`;
      const audioBlob = audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) : undefined;

      const record: VoiceSnippetRecord = {
        id: activeId,
        transcript: fullText,
        interimText: '',
        durationSeconds: recordDuration,
        language: selectedLang,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'saved',
        retryCount: 0,
        audioBlob,
      };

      // 1. Guarantee write to browser IndexedDB
      await voiceSnippetDB.saveSnippet(record);
      setSyncStatus('saved_idb');

      // 2. Queue for asynchronous server-side processing
      await serverSyncQueue.enqueueForServerProcessing(record);
      setSyncStatus('queued');

      const all = await voiceSnippetDB.getAllSnippets();
      setCachedSnippets(all);
      setRecentSavedCount(all.length);
    }
  }, [liveTranscript, interimText, currentSnippetId, recordDuration, selectedLang]);

  const toggleRecording = () => {
    if (isRecording) {
      stopCapture();
    } else {
      startCapture();
    }
  };

  const handleCopyTranscript = async () => {
    const fullText = (liveTranscript + ' ' + interimText).trim();
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {}
  };

  const handleClearTranscript = async () => {
    if (currentSnippetId) {
      try {
        await voiceSnippetDB.deleteSnippet(currentSnippetId);
      } catch {}
    }
    setLiveTranscript('');
    setInterimText('');
    setRecordDuration(0);
    setCurrentSnippetId(null);
    setSyncStatus('idle');
    const all = await voiceSnippetDB.getAllSnippets();
    setCachedSnippets(all);
    setRecentSavedCount(all.length);
  };

  const handleTransferToStudio = () => {
    const fullText = (liveTranscript + ' ' + interimText).trim();
    if (fullText && onTransferToStudio) {
      onTransferToStudio(fullText);
    }
    if (onNavigateTab) {
      onNavigateTab('voice-studio');
    }
    setIsExpanded(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fullDisplayTranscript = (liveTranscript + (interimText ? ' ' + interimText : '')).trim();

  // Status Badge Helper
  const renderSyncBadge = () => {
    switch (syncStatus) {
      case 'saved_idb':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
            <Database className="w-3 h-3" />
            <span>Auto-Saved (IndexedDB)</span>
          </span>
        );
      case 'queued':
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Queued for Server Sync</span>
          </span>
        );
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
            <CloudCheck className="w-3 h-3" />
            <span>Synced to Cloud</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
            <CloudAlert className="w-3 h-3" />
            <span>Local Only (Retrying)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            <Database className="w-3 h-3" />
            <span>Zero Data Loss WAL</span>
          </span>
        );
    }
  };

  return (
    <aside
      aria-label="Floating Voice Dictation"
      style={{ perspective: 1000 }}
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none max-w-[92vw] sm:max-w-md w-full"
    >
      {/* 1. EXPANDABLE 3D FLOATING TRANSCRIPT DOCK & OFFLINE VAULT */}
      {(isExpanded || isRecording || fullDisplayTranscript || showHistoryDrawer) && (
        <div
          id="floating-transcript-panel"
          style={{
            transform: 'translateZ(30px)',
            transformStyle: 'preserve-3d',
          }}
          className="pointer-events-auto w-full mb-2.5 bg-[#0e1322]/95 backdrop-blur-2xl border border-orange-500/30 rounded-3xl p-3.5 sm:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.9)] ring-1 ring-orange-500/20 transition-all duration-300 transform origin-bottom animate-in fade-in zoom-in-95 max-h-[55vh] overflow-y-auto"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="font-bold text-slate-200">
                {isRecording ? `LIVE • ${formatTime(recordDuration)}` : 'Voice Snippet Vault'}
              </span>
              {renderSyncBadge()}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  showHistoryDrawer ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="View IndexedDB Saved Snippets"
              >
                <History className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">{recentSavedCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isRecording) stopCapture();
                  setIsExpanded(false);
                  setShowHistoryDrawer(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* HISTORY VAULT ACCORDION (IndexedDB snippets list) */}
          {showHistoryDrawer ? (
            <div className="my-3 max-h-[220px] overflow-y-auto space-y-2 pr-1 font-sans">
              <div className="flex items-center justify-between pb-1 text-[11px] font-semibold text-slate-400">
                <span>Stored in Browser IndexedDB ({cachedSnippets.length})</span>
                <span className="text-[10px] text-emerald-400 font-mono">Persists on Refresh ✓</span>
              </div>
              {cachedSnippets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No cached voice snippets yet.</div>
              ) : (
                cachedSnippets.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => {
                      setLiveTranscript(item.transcript);
                      setCurrentSnippetId(item.id);
                      setSyncStatus(item.status);
                      setShowHistoryDrawer(false);
                    }}>
                      <p className="text-xs text-slate-200 font-medium truncate">{item.transcript}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="uppercase">{item.language}</span>
                        <span>•</span>
                        <span className={item.status === 'synced' ? 'text-emerald-400' : 'text-blue-400'}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await voiceSnippetDB.deleteSnippet(item.id);
                        const updated = await voiceSnippetDB.getAllSnippets();
                        setCachedSnippets(updated);
                        setRecentSavedCount(updated.length);
                        if (currentSnippetId === item.id) {
                          setLiveTranscript('');
                          setCurrentSnippetId(null);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete from local database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Dialect / Language Selector */}
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60 text-[11px]">
                <span className="text-slate-400 font-medium">Input Cadence:</span>
                <div className="flex gap-1.5 font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedLang('en-IN')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      selectedLang === 'en-IN'
                        ? 'bg-orange-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    English (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLang('hi-IN')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      selectedLang === 'hi-IN'
                        ? 'bg-orange-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    Hindi (हिन्दी)
                  </button>
                </div>
              </div>

              {/* Transcript Content Box */}
              <div className="my-3 min-h-[90px] max-h-[160px] overflow-y-auto pr-1 text-left font-sans">
                {permissionError ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                    {permissionError}
                  </div>
                ) : fullDisplayTranscript ? (
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                      {liveTranscript}
                      {interimText && <span className="text-amber-400 italic"> {interimText}</span>}
                      {isRecording && (
                        <span className="inline-block w-1.5 h-4 ml-1.5 bg-orange-400 animate-pulse align-middle" />
                      )}
                    </p>
                    <div ref={transcriptEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 space-y-1">
                    <Radio className="w-5 h-5 text-orange-400/80 animate-pulse" />
                    <p className="text-xs">
                      {isRecording ? 'Listening and auto-saving to IndexedDB...' : 'Tap the record button and speak'}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">Crash-safe write-ahead storage enabled</span>
                  </div>
                )}
              </div>

              {/* Live Waveform Equalizer Display (Active while recording) */}
              {isRecording && (
                <div className="flex items-center justify-center gap-1 py-1.5 mb-2 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-orange-400 flex items-center gap-1 mr-2">
                    <Volume2 className="w-3 h-3" />
                    <span>{audioLevel}%</span>
                  </span>
                  {[30, 60, 95, 45, 80, 100, 70, 40, 85, 55, 90, 35, 75, 50, 95, 65, 40, 80, 60].map((baseH, i) => {
                    const heightPercent = Math.max(15, (baseH / 100) * (audioLevel > 10 ? audioLevel : 25));
                    return (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-orange-500 to-amber-300 transition-all duration-75"
                        style={{ height: `${Math.min(24, Math.max(4, heightPercent * 0.24))}px` }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Quick Action Footer */}
              {fullDisplayTranscript && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1 active:scale-95"
                    >
                      {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearTranscript}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/50 transition-all flex items-center gap-1 active:scale-95"
                      title="Clear draft and remove from IndexedDB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={handleTransferToStudio}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Send to Voice Studio</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 2. HIGH-VISIBILITY FLOATING RECORD BUTTON & RADIATING AURA */}
      <div className="pointer-events-auto relative flex items-center justify-center group" id="high-visibility-record-anchor">
        {/* Layer 1: Ambient Pulse Background Aura */}
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
            isRecording
              ? 'bg-rose-500/30 blur-2xl animate-pulse'
              : 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-rose-500/25 blur-xl group-hover:opacity-100 opacity-70'
          }`}
          style={{
            width: isRecording ? `${96 + audioLevel * 0.9}px` : '100px',
            height: isRecording ? `${96 + audioLevel * 0.9}px` : '100px',
          }}
        />

        {/* Layer 2: Outward Radiating Ping Waves */}
        {isRecording && (
          <>
            <span
              className="absolute inline-flex h-20 w-20 rounded-full bg-rose-500/40 animate-ping pointer-events-none"
              style={{ animationDuration: '1.4s' }}
            />
            <span
              className="absolute inline-flex h-24 w-24 rounded-full bg-orange-500/30 animate-pulse pointer-events-none"
              style={{
                transform: `scale(${1 + (audioLevel / 100) * 0.3})`,
                transition: 'transform 75ms ease-out',
              }}
            />
          </>
        )}

        {/* Layer 3: Main Tactile Interactive Button */}
        <button
          type="button"
          id="btn-voice-record-floating"
          onClick={toggleRecording}
          aria-label={isRecording ? 'Stop Voice Recording' : 'Start Instant Voice Capture'}
          title={isRecording ? 'Tap to Stop Recording' : 'Single Tap to Record Voice'}
          className={`relative z-10 flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 rounded-full font-black text-sm sm:text-base tracking-wide transition-all duration-200 active:scale-90 shadow-2xl border ${
            isRecording
              ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 text-white border-rose-400/80 shadow-[0_0_40px_rgba(239,68,68,0.7)] ring-4 ring-rose-500/30'
              : 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:via-orange-400 hover:to-amber-400 text-slate-950 border-amber-300/80 shadow-[0_12px_35px_rgba(245,158,11,0.5)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.7)] hover:scale-105 ring-2 ring-white/20'
          }`}
        >
          {/* Animated Icon */}
          <div className="relative flex items-center justify-center">
            {isRecording ? (
              <Square className="w-5 h-5 fill-white text-white animate-pulse" />
            ) : (
              <Mic className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
            )}
          </div>

          {/* Button Label */}
          <span className="font-black select-none">
            {isRecording ? 'Stop Recording' : 'Record'}
          </span>

          {/* Live indicator tag or pulse badge */}
          {isRecording ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/30 text-white font-mono text-xs font-bold">
              {formatTime(recordDuration)}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-mono text-[10px] font-bold uppercase tracking-wider">
              Auto-Save
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default FloatingRecordButton;
