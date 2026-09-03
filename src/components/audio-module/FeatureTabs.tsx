import React, { useState } from 'react';
import {
  Wand2,
  Bot,
  Code2,
  Copy,
  Check,
  Zap,
  Activity,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  TrendingUp,
  MessageSquareQuote,
  SlidersHorizontal,
  FileCode
} from 'lucide-react';
import { ShowcaseGrid } from './ShowcaseGrid';
import {
  MOCK_CREATION_FEATURES,
  MOCK_AGENT_TELEMETRY,
  MOCK_API_SNIPPETS
} from './mockData';

export type FeatureTabType = 'creation' | 'agents' | 'api';

interface FeatureTabsProps {
  defaultTab?: FeatureTabType;
  onTabChange?: (tab: FeatureTabType) => void;
}

export const FeatureTabs: React.FC<FeatureTabsProps> = ({
  defaultTab = 'creation',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<FeatureTabType>(defaultTab);
  const [selectedApiLang, setSelectedApiLang] = useState<'javascript' | 'curl' | 'python'>('javascript');
  const [copied, setCopied] = useState<boolean>(false);

  const handleTabClick = (tab: FeatureTabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleCopyCode = async () => {
    const code = MOCK_API_SNIPPETS[selectedApiLang];
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write error', err);
    }
  };

  return (
    <div className="w-full space-y-6" id="feature-tabs-section">
      
      {/* TABS NAVIGATION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 gap-3 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl border border-gray-200/80 overflow-x-auto w-full sm:w-auto">
          
          <button
            type="button"
            onClick={() => handleTabClick('creation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'creation'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Voice Creation</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'agents'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Conversational Agents</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('api')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-200/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer API</span>
          </button>

        </div>

        <div className="text-xs text-gray-500 font-mono hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Multi-Engine Model Stack v2.4</span>
        </div>
      </div>

      {/* TAB CONTENT 1: VOICE CREATION TOOLS */}
      {activeTab === 'creation' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Audio Creation & Synthesis Suite</h3>
              <p className="text-xs text-gray-500">
                Precision tools for generative speech synthesis, zero-shot voice cloning, and audio isolation.
              </p>
            </div>
            <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 hidden sm:inline-block">
              4 Production Modules
            </span>
          </div>

          <ShowcaseGrid features={MOCK_CREATION_FEATURES} />
        </div>
      )}

      {/* TAB CONTENT 2: CONVERSATIONAL AGENTS DASHBOARD */}
      {activeTab === 'agents' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Conversational Voice Agents</h3>
              <p className="text-xs text-gray-500">
                Sub-300ms duplex conversational agents equipped with real-time sentiment detection and interruption handling.
              </p>
            </div>
          </div>

          {/* TELEMETRY METRIC CARDS (SIMULATING 98% RESOLUTION RATE METRIC) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                <span>First-Contact Resolution</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{MOCK_AGENT_TELEMETRY.resolutionRate}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+2.1% this month</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                <span>P95 End-to-End Latency</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{MOCK_AGENT_TELEMETRY.averageLatencyMs}</span>
                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Sub-band streaming</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                <span>Active Voice Sessions</span>
                <PhoneCall className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{MOCK_AGENT_TELEMETRY.concurrentCalls}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Zero dropped frames</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                <span>Caller Satisfaction</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{MOCK_AGENT_TELEMETRY.satisfactionScore}</span>
                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Based on 12k ratings</span>
              </div>
            </div>

          </div>

          {/* MOCK CONVERSATION TRANSCRIPT & LIVE AGENT STATUS */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Live Agent Session Monitor</h4>
                  <p className="text-[11px] text-gray-500 font-mono">Channel: WebRTC Opus Full-Duplex • Engine: Real-Time Multimodal Voice Live</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Stream
              </span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {MOCK_AGENT_TELEMETRY.sampleTranscript.map((turn, index) => (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl max-w-xl ${
                    turn.sender === 'user'
                      ? 'bg-gray-100 text-gray-900 ml-auto'
                      : 'bg-black text-white mr-auto border border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] font-mono opacity-70">
                    <span className="uppercase font-bold">{turn.sender === 'user' ? 'Caller' : 'AI Voice Agent (Aria)'}</span>
                    {turn.sentiment && <span>Sentiment: {turn.sentiment}</span>}
                  </div>
                  <p className="leading-relaxed">{turn.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: DEVELOPER API & CODE BLOCK */}
      {activeTab === 'api' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Developer API Integration</h3>
              <p className="text-xs text-gray-500">
                High-throughput REST and WebSocket endpoints for streaming text-to-speech directly into your apps.
              </p>
            </div>

            {/* CODE LANGUAGE SELECTOR */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start sm:self-auto">
              {(['javascript', 'curl', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedApiLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedApiLang === lang
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {lang === 'javascript' ? 'JavaScript' : lang === 'curl' ? 'cURL' : 'Python'}
                </button>
              ))}
            </div>
          </div>

          {/* DARK-THEMED CODE BLOCK */}
          <div className="bg-gray-950 rounded-2xl border border-gray-800 shadow-xl overflow-hidden text-gray-300 font-mono text-xs">
            {/* CODE HEADER */}
            <div className="px-4 py-3 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-gray-400 text-[11px]">
                  {selectedApiLang === 'javascript'
                    ? 'speechSynthesis.ts'
                    : selectedApiLang === 'curl'
                    ? 'request.sh'
                    : 'voice_stream.py'}
                </span>
              </div>

              {/* FUNCTIONAL COPY CODE BUTTON */}
              <button
                type="button"
                onClick={handleCopyCode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                }`}
                title="Copy API Code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* CODE CONTENT */}
            <div className="p-5 overflow-x-auto selection:bg-gray-700 selection:text-white">
              <pre className="leading-relaxed">
                <code>{MOCK_API_SNIPPETS[selectedApiLang]}</code>
              </pre>
            </div>

            {/* FOOTER METRICS */}
            <div className="px-5 py-3 bg-gray-900/50 border-t border-gray-800 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2 font-sans">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99.99% API Uptime SLA
                </span>
                <span>•</span>
                <span>Chunked Transfer Encoding</span>
              </div>
              <span className="font-mono text-gray-500">HTTP/2 & WebSocket Supported</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
