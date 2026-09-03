/**
 * REAL-TIME STREAMING SPEECH-TO-TEXT ENGINE
 * Sub-200ms interim transcription stream with auto-reconnection,
 * audio volume meters, and telemetry tracking.
 */

import { TelemetryMatrix } from './TelemetryMatrix';

export interface StreamingSTTCallbacks {
  onInterimText: (text: string, isFinal: boolean) => void;
  onFinalText: (text: string) => void;
  onVolumeChange?: (volume: number) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: 'idle' | 'listening' | 'processing' | 'error') => void;
}

export class StreamingSTTEngine {
  private recognition: any = null;
  private isListening = false;
  private startTime = 0;
  private fullTranscript = '';
  private interimTranscript = '';
  private callbacks: StreamingSTTCallbacks;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private volumeInterval: number | null = null;

  constructor(callbacks: StreamingSTTCallbacks) {
    this.callbacks = callbacks;
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[StreamingSTT] Web Speech API not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.startTime = Date.now();
        TelemetryMatrix.recordEvent('AUDIO_STREAM_STARTED', {
          engine: 'WebSpeechStreaming',
          lang: this.recognition.lang
        });
        this.callbacks.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (finalChunk) {
          this.fullTranscript += finalChunk;
          const chunkLatency = Date.now() - this.startTime;
          TelemetryMatrix.recordEvent('STT_STREAMING_CHUNK', {
            chunk: finalChunk.trim(),
            totalLength: this.fullTranscript.length
          }, chunkLatency);
        }

        this.interimTranscript = interim;
        const currentCompleteText = (this.fullTranscript + ' ' + interim).trim();

        this.callbacks.onInterimText(currentCompleteText, false);
      };

      this.recognition.onerror = (event: any) => {
        console.error('[StreamingSTT] Recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          TelemetryMatrix.recordFriction('PERMISSION_DENIED', `Microphone permission error: ${event.error}`);
        } else if (event.error !== 'no-speech') {
          TelemetryMatrix.recordFriction('EXTRACTION_FAILED', `Speech recognition error: ${event.error}`);
        }
        this.callbacks.onError?.(event.error);
        this.callbacks.onStateChange?.('error');
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart if continuous listening expected
          try {
            this.recognition.start();
          } catch (_) {
            this.isListening = false;
            this.callbacks.onStateChange?.('idle');
          }
        } else {
          this.callbacks.onStateChange?.('idle');
        }
      };
    } catch (e) {
      console.error('[StreamingSTT] Initialization exception:', e);
    }
  }

  public async start(): Promise<void> {
    this.fullTranscript = '';
    this.interimTranscript = '';
    this.startTime = Date.now();
    TelemetryMatrix.recordEvent('TAP_CAPTURE_START', { mode: 'streaming_stt' });

    // Start Audio Visualizer
    await this.startAudioMeters();

    if (this.recognition) {
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (err: any) {
        if (err.name !== 'InvalidStateError') {
          console.error('[StreamingSTT] Start error:', err);
        }
      }
    } else {
      // Fallback state
      this.isListening = true;
      this.callbacks.onStateChange?.('listening');
    }
  }

  private async startAudioMeters() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = this.audioContext.createMediaStreamSource(this.micStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 128;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.volumeInterval = window.setInterval(() => {
          if (!this.analyser || !this.isListening) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          this.callbacks.onVolumeChange?.(normalized);
        }, 60);
      }
    } catch (e) {
      console.warn('[StreamingSTT] Audio meter capture unavailable:', e);
    }
  }

  public stop(): string {
    this.isListening = false;
    const finalResult = (this.fullTranscript + ' ' + this.interimTranscript).trim();
    const durationMs = Date.now() - this.startTime;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }

    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (!finalResult) {
      TelemetryMatrix.recordFriction('TRANSCRIPT_EMPTY', 'User stopped recording with empty transcript', { durationMs });
    } else {
      TelemetryMatrix.recordEvent('STT_TRANSCRIPTION_COMPLETE', {
        transcriptLength: finalResult.length,
        characterCount: finalResult.length
      }, durationMs);
    }

    this.callbacks.onFinalText(finalResult);
    this.callbacks.onStateChange?.('idle');
    return finalResult;
  }

  public discard(): void {
    this.isListening = false;
    const discardedLength = (this.fullTranscript + ' ' + this.interimTranscript).trim().length;
    TelemetryMatrix.recordFriction('DICTATION_DISCARDED', 'User manually discarded dictation', {
      discardedLength
    });
    this.stop();
  }
}
