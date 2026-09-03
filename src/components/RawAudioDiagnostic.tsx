import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  timeOffsetMs: number;
  type: 'info' | 'chunk' | 'state' | 'permission' | 'hardware' | 'error' | 'success';
  message: string;
  details?: Record<string, any>;
}

export interface StoredDiagnosticSession {
  sessionId: string;
  startTime: string;
  mimeType: string;
  totalChunks: number;
  totalBytes: number;
  hasZeroByteFailure: boolean;
  logs: DiagnosticLogEntry[];
}

const STORAGE_KEY = 'talking_terms_audio_diagnostic_logs_v2';

export const RawAudioDiagnostic: React.FC = () => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'stopped'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [blobSize, setBlobSize] = useState<number | null>(null);
  const [mimeTypeUsed, setMimeTypeUsed] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState<number>(0);
  const [liveBytes, setLiveBytes] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Persistent Session Logs
  const [sessions, setSessions] = useState<StoredDiagnosticSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentLogs, setCurrentLogs] = useState<DiagnosticLogEntry[]>([]);
  const currentSessionIdRef = useRef<string>('');
  const recordingStartTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to persist diagnostic logs:', e);
    }
  }, [sessions]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [currentLogs]);

  const addLog = (
    type: DiagnosticLogEntry['type'],
    message: string,
    details?: Record<string, any>
  ) => {
    const timeOffsetMs = recordingStartTimeRef.current > 0 ? Date.now() - recordingStartTimeRef.current : 0;
    const entry: DiagnosticLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().substring(11, 23),
      timeOffsetMs,
      type,
      message,
      details
    };

    setCurrentLogs((prev) => [...prev, entry]);
    return entry;
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setChunkCount(0);
    setLiveBytes(0);

    const newSessionId = `sess_${Date.now()}`;
    currentSessionIdRef.current = newSessionId;
    recordingStartTimeRef.current = Date.now();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setBlobSize(null);

    addLog('info', `=== Initializing Audio Diagnostic Session: ${newSessionId} ===`);

    // 1. Browser Security & Permissions check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = 'CRITICAL_ERROR: navigator.mediaDevices.getUserMedia is NOT supported in this browser/environment.';
      setErrorMessage(err);
      addLog('error', err);
      return;
    }

    try {
      addLog('permission', 'Requesting microphone permission via getUserMedia({ audio: true })...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 1. Log Permission Success & Trace
      console.log("1. Permission Granted. Stream active:", stream.active);
      addLog('permission', '1. Permission Granted. Stream active: ' + stream.active, {
        streamActive: stream.active,
        streamId: stream.id,
      });

      // Hardware Track Diagnostics
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        const settings = track.getSettings ? track.getSettings() : {};
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        addLog('hardware', `Audio Track Detected: "${track.label || 'Default Microphone'}"`, {
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings,
          capabilities
        });
      }

      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }
      setMimeTypeUsed(mimeType);
      addLog('info', `Selected MediaRecorder MIME Type: ${mimeType}`);

      // 2. MediaRecorder Initialization
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        const size = event.data ? event.data.size : 0;
        console.log("3. Chunk received. Size:", size);

        if (event.data && size > 0) {
          audioChunksRef.current.push(event.data);
          const currentTotal = audioChunksRef.current.reduce((acc, c) => acc + c.size, 0);
          setChunkCount((prev) => prev + 1);
          setLiveBytes(currentTotal);

          addLog('chunk', `3. Chunk #${audioChunksRef.current.length} received: ${size} bytes (Total: ${currentTotal} bytes)`, {
            chunkIndex: audioChunksRef.current.length,
            chunkBytes: size,
            accumulatedBytes: currentTotal,
            timestamp: Date.now()
          });
        } else {
          addLog('error', '3. Chunk received with 0 bytes!', { size });
        }
      };

      recorder.onstop = () => {
        const totalChunks = audioChunksRef.current.length;
        console.log("4. MediaRecorder stopped. Total chunks:", totalChunks);
        addLog('state', `4. MediaRecorder stopped. Total chunks collected: ${totalChunks}`, { totalChunks });

        // Compile chunks into a single Blob
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const sizeInBytes = blob.size;
        console.log("5. Blob generated. Total size:", sizeInBytes, "bytes.");
        setBlobSize(sizeInBytes);

        const hasZeroByteFailure = sizeInBytes === 0;

        if (hasZeroByteFailure) {
          const failureMsg = 'CAPTURE_FAILURE: MediaRecorder generated a Blob of 0 bytes.';
          setErrorMessage(failureMsg);
          addLog('error', `5. ${failureMsg}`, { sizeInBytes, totalChunks });
        } else {
          addLog('success', `5. Blob generated successfully: ${sizeInBytes} bytes (${(sizeInBytes / 1024).toFixed(2)} KB)`, {
            blobSize: sizeInBytes,
            mimeType: blob.type
          });

          // 3. Raw Playback & Data Verification
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }

        // Persist session to history list
        setCurrentLogs((latestLogs) => {
          const sessionRecord: StoredDiagnosticSession = {
            sessionId: currentSessionIdRef.current,
            startTime: new Date().toISOString(),
            mimeType: mimeType || 'audio/webm',
            totalChunks,
            totalBytes: sizeInBytes,
            hasZeroByteFailure,
            logs: latestLogs
          };

          setSessions((prevSessions) => [sessionRecord, ...prevSessions.slice(0, 9)]);
          return latestLogs;
        });
      };

      // Request data chunks every 250ms
      recorder.start(250);
      console.log("2. MediaRecorder started. State:", recorder.state);
      addLog('state', `2. MediaRecorder started. State: ${recorder.state} (timeslice: 250ms)`, {
        state: recorder.state,
        timesliceMs: 250
      });
      setRecordingState('recording');
    } catch (err: any) {
      let errText = '';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errText = 'NotAllowedError: User denied permission or browser blocked microphone access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errText = 'NotFoundError: No microphone detected on this system.';
      } else {
        errText = `MediaDeviceError (${err.name || 'Unknown'}): ${err.message || String(err)}`;
      }
      setErrorMessage(errText);
      addLog('error', errText, { errorName: err.name, errorMessage: err.message });
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      addLog('state', 'Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');

      // Stop mic tracks to release hardware
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          addLog('hardware', `Microphone track "${track.label}" stopped.`);
        });
        streamRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    if (recordingState === 'recording') {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    audioChunksRef.current = [];
    setAudioUrl(null);
    setBlobSize(null);
    setChunkCount(0);
    setLiveBytes(0);
    setErrorMessage(null);
    setRecordingState('idle');
    setMimeTypeUsed(null);
    addLog('info', 'Active recording buffer cleared.');
  };

  const clearLogs = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear diagnostic localStorage:', e);
    }
    setSessions([]);
    setCurrentLogs([]);
    clearRecording();
  };

  const copyDiagnosticReport = () => {
    const report = {
      environment: {
        userAgent: navigator.userAgent,
        mediaDevicesSupported: !!navigator.mediaDevices,
        getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        speechRecognitionSupported: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
        speechSynthesisSupported: 'speechSynthesis' in window,
        audioContextSupported: !!((window as any).AudioContext || (window as any).webkitAudioContext),
      },
      currentStatus: {
        recordingState,
        blobSize,
        chunkCount,
        liveBytes,
        mimeTypeUsed,
        errorMessage
      },
      recentLogs: currentLogs,
      persistedSessionsCount: sessions.length
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="raw-audio-diagnostic"
      className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#07090E] border border-slate-800/90 rounded-3xl shadow-2xl text-slate-100 font-mono space-y-6"
    >
      {/* 1. HEADER TITLE & STATUS BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Audio Engine Hardware Diagnostic
              <span className="text-[10px] font-mono uppercase bg-orange-500/20 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full">
                Persistent Telemetry
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Verify browser MediaRecorder permissions, chunk emission streams, and raw audio blob synthesis.
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">State:</span>
          <span
            id="diagnostic-status"
            className={`text-xs uppercase font-bold px-3 py-1 rounded-xl border ${
              recordingState === 'recording'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : recordingState === 'stopped'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {recordingState}
          </span>
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY METRIC TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase">Chunks Emitted</div>
          <div className="text-xl font-bold text-orange-400 mt-1">{chunkCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">250ms timeslices</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase">Accumulated Bytes</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">
            {liveBytes > 0 ? `${(liveBytes / 1024).toFixed(2)} KB` : '0 B'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{liveBytes} raw bytes</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase">Final Blob Size</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {blobSize !== null ? `${(blobSize / 1024).toFixed(2)} KB` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {blobSize === null ? 'Not stopped yet' : blobSize === 0 ? 'FAIL: 0 Bytes' : 'Validated'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase">Selected Codec</div>
          <div className="text-xs font-bold text-purple-300 truncate mt-2">
            {mimeTypeUsed || 'Detecting...'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hardware supported</div>
        </div>
      </div>

      {/* 3. HARDWARE CONTROL ACTIONS */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-start-record"
            type="button"
            onClick={startRecording}
            disabled={recordingState === 'recording'}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
          >
            <Mic className="w-4 h-4" />
            <span>1. Start Recording (250ms chunks)</span>
          </button>

          <button
            id="btn-stop-record"
            type="button"
            onClick={stopRecording}
            disabled={recordingState !== 'recording'}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-600/20"
          >
            <MicOff className="w-4 h-4" />
            <span>2. Stop & Compile Blob</span>
          </button>

          <button
            id="btn-clear-record"
            type="button"
            onClick={clearRecording}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Buffer</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyDiagnosticReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all border border-slate-700"
            title="Copy entire JSON report to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Report!' : 'Copy Telemetry'}</span>
          </button>

          <button
            id="btn-clear-logs"
            type="button"
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 transition-all border border-rose-800/60 shadow-sm"
            title="Reset persisted session state, localStorage, and clear all diagnostic logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* 4. ERROR MESSAGE BOX */}
      {errorMessage && (
        <div
          id="diagnostic-error"
          className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-3 shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wider text-rose-300">Hardware / Permission Alert</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* 5. RAW AUDIO PLAYBACK PLAYER */}
      {audioUrl && (
        <div
          id="diagnostic-player"
          className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Captured Audio Verification Player ({blobSize} bytes)</span>
            </span>
            <a
              href={audioUrl}
              download={`audio_diagnostic_${Date.now()}.webm`}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Blob</span>
            </a>
          </div>
          <audio id="raw-audio-element" controls src={audioUrl} className="w-full h-10 rounded-xl" />
        </div>
      )}

      {/* 6. PERSISTENT LIVE TERMINAL LOG STREAM */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-slate-200">Real-Time Event Stream & Chunk Trace</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500">
              {currentLogs.length} events in active stream
            </span>
            {currentLogs.length > 0 && (
              <button
                type="button"
                onClick={clearLogs}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 underline transition-colors"
                title="Clear current stream and persisted logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Logs</span>
              </button>
            )}
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="h-64 sm:h-72 overflow-y-auto bg-black/90 rounded-2xl p-3.5 border border-slate-800 text-xs font-mono space-y-1.5 scroll-smooth select-text"
        >
          {currentLogs.length === 0 ? (
            <div className="text-slate-600 italic py-8 text-center">
              No events yet. Tap "Start Recording" above to trace getUserMedia permissions, hardware tracks, and 250ms chunks in real time.
            </div>
          ) : (
            currentLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-0.5 ${
                  log.type === 'error'
                    ? 'text-rose-400'
                    : log.type === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : log.type === 'chunk'
                    ? 'text-cyan-300'
                    : log.type === 'permission'
                    ? 'text-amber-300'
                    : log.type === 'hardware'
                    ? 'text-purple-300'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                <span className="text-slate-500 shrink-0 select-none">+{log.timeOffsetMs}ms</span>
                <span className="break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 7. PERSISTENT HISTORICAL SESSIONS (Saved across reloads) */}
      {sessions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-200">Saved Diagnostic Sessions ({sessions.length})</span>
            <span className="text-[10px] text-slate-500">Persisted in browser localStorage</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.map((sess, idx) => (
              <div
                key={sess.sessionId}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Session #{sessions.length - idx}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(sess.startTime).toLocaleTimeString()}
                    </span>
                    {sess.hasZeroByteFailure ? (
                      <span className="text-[9px] uppercase bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.2 rounded">
                        0-Byte Fail
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                        Success
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {sess.totalChunks} chunks collected • {sess.totalBytes} bytes ({(sess.totalBytes / 1024).toFixed(1)} KB) • {sess.mimeType}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentLogs(sess.logs);
                    setBlobSize(sess.totalBytes);
                    setChunkCount(sess.totalChunks);
                    setLiveBytes(sess.totalBytes);
                    setMimeTypeUsed(sess.mimeType);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-all"
                >
                  Load Logs
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RawAudioDiagnostic;
