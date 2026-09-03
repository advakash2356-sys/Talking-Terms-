export type PersonaCategory = 'all' | 'male' | 'female' | 'lgbtq';

export type BehavioralMode = 'receptive_venting' | 'directive_action' | 'grounding_deescalation';

export type PersonaEmotion = 'neutral' | 'serious' | 'joyful';

export interface PersonaExpressions {
  neutral: string;
  serious: string;
  joyful: string;
}

export interface PersonaAssets {
  id: string;
  name: string;
  expressions: PersonaExpressions;
}

export type CallStage =
  | 'AI_LIVE'
  | 'ESCALATION_REQUESTED'
  | 'ROUTING_QUEUE'
  | 'PEER_CONNECTED'
  | 'POST_CALL';

export interface Persona {
  id: string;
  name: string;
  title: string;
  age: number;
  cat: 'male' | 'female' | 'lgbtq';
  vibe: string;
  voice: string;
  voiceId: string;
  tags: string[];
  systemPromptBase: string;
  greetingMessage: string;
  location: string;
  avatarColor: string;
  expressions?: PersonaExpressions;
  receptiveFocus?: string;
  directiveFocus?: string;
  behavioralAnchors?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'persona' | 'listener' | 'system';
  text: string;
  timestamp: string;
  audioBase64?: string;
  sentiment?: 'positive' | 'neutral' | 'distressed' | 'relieved';
  emotion?: PersonaEmotion;
  latencyMs?: number;
  ttftMs?: number;
  mode?: BehavioralMode;
  bargeInTriggered?: boolean;
}

export interface ShieldIdentity {
  userUuid: string;
  hashedIdentityKey: string;
  displayMoniker: string;
  blindTokenBalance: number;
  shieldActive: boolean;
  generatedAt: string;
  activeBlindTokens: BlindToken[];
}

export interface BlindToken {
  id: string;
  blindedNonce: string;
  unblindedSignature: string;
  issuedAt: string;
  minutesRemaining: number;
  isSpent: boolean;
  orderReference?: string;
}

export interface CallTelemetry {
  sessionId: string;
  personaId: string;
  personaName: string;
  startedAt: string;
  durationSeconds: number;
  latencyAvgMs: number;
  interruptionCount: number;
  distressScoreStart: number; // 0 - 100
  distressScoreEnd: number; // 0 - 100
  sentimentDelta: string;
  escalatedToHuman: boolean;
  empathyScore: number;
  hallucinationRisk: 'low' | 'medium' | 'high';
  anonymizedSnippet: string;
}

export interface PromptPatch {
  id: string;
  personaId: string;
  personaName: string;
  reason: string;
  originalInstruction: string;
  calibratedInstruction: string;
  benchmarkScoreBefore: number;
  benchmarkScoreAfter: number;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: string;
}

export interface ActiveDistressTriage {
  id: string;
  sessionId: string;
  callerMoniker: string;
  personaName: string;
  locationArea: string;
  distressScore: number; // 0-100
  distressVelocity: 'Critical Surge' | 'Elevated' | 'Stabilizing';
  detectedRiskFactors: string[];
  activeDurationSeconds: number;
  status: 'triage_active' | 'sos_dispatched' | 'human_bridged' | 'stabilized';
  assignedListener?: string;
  emergencyTokensGranted: number;
  timestamp: string;
}

export interface CeoCrisisPolicy {
  zeroBalanceBypass: boolean;
  auto5SecEscalation: boolean;
  somatic432HzVagusTone: boolean;
  teleManasHotlineBridge: boolean;
  emergencyTokenSubsidyActive: boolean;
  groundVolunteerAlerts: boolean;
}

export interface GroundVolunteerNode {
  id: string;
  zone: string;
  leadVolunteer: string;
  activePeerListeners: number;
  standbyStatus: 'ready' | 'on_call' | 'mobilizing';
  directHelpline: string;
}

export interface AdminMetrics {
  totalActiveStreams: number;
  avgLatencyMs: number;
  totalTokensBurned: number;
  distressEscalationRate: number; // percentage
  totalSessionsToday: number;
  criticEmpathyAvg: number; // 0 - 100
  criticalInterventionsToday: number;
  emergencyTokensGrantedMinutes: number;
  systemStatus: 'healthy' | 'degraded' | 'calibrating';
  recentTelemetry: CallTelemetry[];
  activePromptPatches: PromptPatch[];
  activeDistressCalls: ActiveDistressTriage[];
  crisisPolicies: CeoCrisisPolicy;
  groundVolunteerNodes: GroundVolunteerNode[];
}

export interface ListenerProfile {
  id: string;
  name: string;
  age: number;
  badge: 'Certified Empathetic Peer' | 'Clinical Psychology Intern' | 'Master Counselor';
  languages: string[];
  location: string;
  rating: number;
  totalSessions: number;
  hourlyRateInr: number;
  isOnline: boolean;
  upiId: string;
  verifiedKyc: boolean;
}

export interface IncomingCallTicket {
  ticketId: string;
  userMoniker: string;
  topic: string;
  category: string;
  escalatedFromPersona: string;
  waitTimeSeconds: number;
  emotionalUrgency: 'Normal' | 'High Empathy Needed' | 'Critical Support';
  timestamp: string;
}

export interface PayoutRecord {
  id: string;
  listenerId: string;
  amountInr: number;
  talkMinutes: number;
  status: 'processing' | 'settled' | 'queued';
  upiVpa: string;
  utrNumber: string;
  timestamp: string;
}

export interface CrisisHelpline {
  id: string;
  name: string;
  number: string;
  telUri: string;
  languages: string;
  hours: string;
  focus: string;
  verifiedGov: boolean;
}

export interface WipeReceipt {
  sessionId: string;
  durationSeconds: number;
  audioBytesPurged: number;
  memoryBufferState: '0_BYTES_RETAINED';
  argon2KeyDestroyed: boolean;
  webrtcSessionTeardown: boolean;
  timestamp: string;
}

export interface DecompressionRecord {
  sessionId: string;
  personaName: string;
  initialDistress: number;
  postMood: 'lighter' | 'neutral' | 'heavy' | 'peaceful';
  breathworkCompleted: boolean;
  takeawayNote?: string;
  timestamp: string;
}

export interface DailyAllowanceState {
  lastClaimDate: string;
  streakDays: number;
  freeMinutesAvailable: number;
  totalClaimedAllTime: number;
}

export interface CommunitySponsorshipPool {
  totalSponsoredMinutes: number;
  availableMinutesForStudents: number;
  activeDonorsCount: number;
}

