/**
 * TELEMETRY MATRIX & GOAL ACHIEVABILITY ENGINE
 * Silent background tracking system measuring interaction lifecycle, latency waterfall,
 * friction events, and goal completion rates.
 */

export type TelemetryEventType =
  | 'TAP_CAPTURE_START'
  | 'AUDIO_STREAM_STARTED'
  | 'STT_STREAMING_CHUNK'
  | 'STT_TRANSCRIPTION_COMPLETE'
  | 'LLM_ROUTING_START'
  | 'LLM_ROUTING_SUCCESS'
  | 'LLM_ROUTING_FAILURE'
  | 'CONTEXT_RESOLVE_START'
  | 'CONTEXT_RESOLVE_SUCCESS'
  | 'ACTION_OPTIMISTIC_APPLIED'
  | 'ACTION_VERIFIED_SUCCESS'
  | 'ACTION_VERIFIED_FAILURE'
  | 'SYSTEM_FRICTION_EVENT'
  | 'USER_CLARIFICATION_PROMPTED'
  | 'USER_CLARIFICATION_RESOLVED';

export type FrictionReason =
  | 'DICTATION_DISCARDED'
  | 'TRANSCRIPT_EMPTY'
  | 'EXTRACTION_FAILED'
  | 'LLM_PARSE_ERROR'
  | 'LLM_TIMEOUT'
  | 'AMBIGUOUS_INTENT'
  | 'API_HTTP_ERROR'
  | 'PERMISSION_DENIED';

export interface TelemetryLogEntry {
  id: string;
  timestamp: number;
  sessionId: string;
  eventType: TelemetryEventType;
  durationMs?: number;
  data?: Record<string, any>;
  friction?: {
    reason: FrictionReason;
    details: string;
    recoverable: boolean;
  };
}

export interface LatencyWaterfall {
  sttStreamingMs: number;
  llmRoutingMs: number;
  contextResolutionMs: number;
  verificationMs: number;
  totalEndToEndMs: number;
}

export interface SuccessMatrixStats {
  totalInteractions: number;
  successfulGoals: number;
  frictionCount: number;
  goalAchievabilityRate: number; // 0 - 100%
  averageTotalLatencyMs: number;
  averageLlmLatencyMs: number;
  averageSttLatencyMs: number;
  frictionBreakdown: Record<FrictionReason, number>;
}

type TelemetryListener = (logs: TelemetryLogEntry[], stats: SuccessMatrixStats) => void;

class TelemetryMatrixService {
  private logs: TelemetryLogEntry[] = [];
  private listeners: Set<TelemetryListener> = new Set();
  private maxLogs = 500;
  private currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  constructor() {
    // Initial bootstrap
    this.recordEvent('TAP_CAPTURE_START', { initiated: 'Telemetry Matrix Online' });
  }

  public getSessionId(): string {
    return this.currentSessionId;
  }

  public renewSession(): string {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return this.currentSessionId;
  }

  public recordEvent(
    eventType: TelemetryEventType,
    data?: Record<string, any>,
    durationMs?: number,
    friction?: { reason: FrictionReason; details: string; recoverable: boolean }
  ): TelemetryLogEntry {
    const entry: TelemetryLogEntry = {
      id: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      eventType,
      durationMs,
      data,
      friction
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Output to developer console for autonomous error mapping
    if (eventType === 'SYSTEM_FRICTION_EVENT' || eventType === 'LLM_ROUTING_FAILURE' || eventType === 'ACTION_VERIFIED_FAILURE') {
      console.warn(`[TelemetryMatrix:FRICTION] [${friction?.reason || eventType}]`, {
        sessionId: this.currentSessionId,
        details: friction?.details || data,
        durationMs
      });
    } else {
      console.debug(`[TelemetryMatrix] ${eventType}`, { durationMs, data });
    }

    this.notifyListeners();
    return entry;
  }

  public recordFriction(reason: FrictionReason, details: string, data?: Record<string, any>): TelemetryLogEntry {
    return this.recordEvent(
      'SYSTEM_FRICTION_EVENT',
      data,
      undefined,
      { reason, details, recoverable: true }
    );
  }

  public getLogs(): TelemetryLogEntry[] {
    return [...this.logs];
  }

  public getFrictionEvents(): TelemetryLogEntry[] {
    return this.logs.filter((l) => l.eventType === 'SYSTEM_FRICTION_EVENT' || l.friction !== undefined);
  }

  public getStats(): SuccessMatrixStats {
    const totalInteractions = this.logs.filter((l) => l.eventType === 'TAP_CAPTURE_START' || l.eventType === 'LLM_ROUTING_START').length;
    const verifiedSuccesses = this.logs.filter((l) => l.eventType === 'ACTION_VERIFIED_SUCCESS' || l.eventType === 'LLM_ROUTING_SUCCESS').length;
    const frictionLogs = this.getFrictionEvents();

    const llmDurations = this.logs
      .filter((l) => l.eventType === 'LLM_ROUTING_SUCCESS' && typeof l.durationMs === 'number')
      .map((l) => l.durationMs!);

    const sttDurations = this.logs
      .filter((l) => l.eventType === 'STT_TRANSCRIPTION_COMPLETE' && typeof l.durationMs === 'number')
      .map((l) => l.durationMs!);

    const totalDurations = this.logs
      .filter((l) => l.eventType === 'ACTION_VERIFIED_SUCCESS' && typeof l.durationMs === 'number')
      .map((l) => l.durationMs!);

    const avgLlm = llmDurations.length ? Math.round(llmDurations.reduce((a, b) => a + b, 0) / llmDurations.length) : 0;
    const avgStt = sttDurations.length ? Math.round(sttDurations.reduce((a, b) => a + b, 0) / sttDurations.length) : 0;
    const avgTotal = totalDurations.length ? Math.round(totalDurations.reduce((a, b) => a + b, 0) / totalDurations.length) : (avgLlm + avgStt);

    const frictionBreakdown: Record<FrictionReason, number> = {
      DICTATION_DISCARDED: 0,
      TRANSCRIPT_EMPTY: 0,
      EXTRACTION_FAILED: 0,
      LLM_PARSE_ERROR: 0,
      LLM_TIMEOUT: 0,
      AMBIGUOUS_INTENT: 0,
      API_HTTP_ERROR: 0,
      PERMISSION_DENIED: 0
    };

    frictionLogs.forEach((l) => {
      if (l.friction?.reason && frictionBreakdown[l.friction.reason] !== undefined) {
        frictionBreakdown[l.friction.reason]++;
      }
    });

    const goalRate = totalInteractions > 0
      ? Math.min(100, Math.max(0, Math.round(((totalInteractions - frictionLogs.length) / totalInteractions) * 100)))
      : 100;

    return {
      totalInteractions: Math.max(totalInteractions, 1),
      successfulGoals: Math.max(verifiedSuccesses, totalInteractions - frictionLogs.length),
      frictionCount: frictionLogs.length,
      goalAchievabilityRate: goalRate,
      averageTotalLatencyMs: avgTotal,
      averageLlmLatencyMs: avgLlm,
      averageSttLatencyMs: avgStt,
      frictionBreakdown
    };
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.getLogs(), this.getStats());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const logs = this.getLogs();
    const stats = this.getStats();
    this.listeners.forEach((l) => {
      try {
        l(logs, stats);
      } catch (err) {
        console.error('[TelemetryMatrix] Listener error:', err);
      }
    });
  }

  public clear() {
    this.logs = [];
    this.notifyListeners();
  }
}

export const TelemetryMatrix = new TelemetryMatrixService();
export default TelemetryMatrix;
