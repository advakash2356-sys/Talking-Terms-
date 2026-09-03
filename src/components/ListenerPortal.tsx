import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  Radio,
  FileText,
  Send,
  Zap
} from 'lucide-react';
import { ListenerProfile, IncomingCallTicket, PayoutRecord } from '../types';
import { audioSynth } from '../utils/audioSynth';
import { LocalCallHistoryView } from './LocalCallHistoryView';
import { saveLocalCallRecord, LocalCallRecord } from '../utils/localCallHistoryDb';

export const ListenerPortal: React.FC = () => {
  const [profile, setProfile] = useState<ListenerProfile>({
    id: 'lis_sunita_991',
    name: 'Sunita Sharma (Listener)',
    age: 44,
    badge: 'Certified Empathetic Peer',
    languages: ['Hindi', 'English', 'Punjabi'],
    location: 'Rohini, Delhi NCR',
    rating: 4.94,
    totalSessions: 382,
    hourlyRateInr: 450, // ₹7.5 / min
    isOnline: true,
    upiId: 'sunita.listener@okhdfcbank',
    verifiedKyc: true,
  });

  const [activeCall, setActiveCall] = useState<IncomingCallTicket | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<IncomingCallTicket[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    {
      id: 'pout_9812',
      listenerId: 'lis_sunita_991',
      amountInr: 1250,
      talkMinutes: 166,
      status: 'settled',
      upiVpa: 'sunita.listener@okhdfcbank',
      utrNumber: 'UTR492819482910',
      timestamp: 'Yesterday, 11:30 PM',
    },
    {
      id: 'pout_7721',
      listenerId: 'lis_sunita_991',
      amountInr: 850,
      talkMinutes: 113,
      status: 'settled',
      upiVpa: 'sunita.listener@okhdfcbank',
      utrNumber: 'UTR381928471920',
      timestamp: '21 Aug 2026',
    },
  ]);

  const [notes, setNotes] = useState('');
  const [payoutProcessing, setPayoutProcessing] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // Fetch Queue from backend
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/listener/queue');
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const handleAcceptCall = (ticket: IncomingCallTicket) => {
    audioSynth.playConnectedChime();
    setActiveCall(ticket);
    setCallDurationSeconds(0);
    setNotes('');
    setQueue((prev) => prev.filter((q) => q.ticketId !== ticket.ticketId));
  };

  const handleEndCall = async () => {
    if (activeCall) {
      const durationSecs = callDurationSeconds;
      const earnedAmount = Math.max(10, Math.round((durationSecs / 60) * 7.5));
      const currentCall = activeCall;

      setActiveCall(null);
      setCallDurationSeconds(0);
      setProfile((prev) => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
      }));

      // Save truncated metadata to local IndexedDB (zero remote sync)
      try {
        const truncatedMoniker = currentCall.userMoniker
          ? currentCall.userMoniker.slice(0, 8) + '***'
          : 'Anon-Del***';
        const truncatedTopic = currentCall.topic.length > 35
          ? currentCall.topic.slice(0, 35) + '...'
          : currentCall.topic;

        const record: LocalCallRecord = {
          id: `call_${Date.now()}`,
          callerMonikerTruncated: truncatedMoniker,
          topicTruncated: truncatedTopic,
          category: currentCall.category || 'Peer Offloading',
          escalatedFromPersona: currentCall.escalatedFromPersona || 'Fleet AI',
          durationSeconds: durationSecs,
          durationFormatted: `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`,
          earnedInr: earnedAmount,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
          timestampEpoch: Date.now(),
          status: 'completed',
          zkEncryptedOfflineTag: 'OFFLINE_INDEXED_DB_LOCAL_STORAGE',
        };

        await saveLocalCallRecord(record);
        setHistoryRefreshTrigger((prev) => prev + 1);
      } catch (err) {
        console.warn('Failed to save to local IndexedDB:', err);
      }
    }
  };

  const handleTriggerInstantPayout = async () => {
    setPayoutProcessing(true);
    setPayoutSuccess(null);

    try {
      const res = await fetch('/api/listener/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listenerId: profile.id,
          amountInr: 680,
          upiVpa: profile.upiId,
        }),
      });

      const data = await res.json();
      setPayouts((prev) => [
        {
          id: data.payoutId || `pout_${Date.now()}`,
          listenerId: profile.id,
          amountInr: 680,
          talkMinutes: 90,
          status: 'settled',
          upiVpa: profile.upiId,
          utrNumber: data.utrNumber || 'UTR99882736192',
          timestamp: 'Just now',
        },
        ...prev,
      ]);

      setPayoutSuccess(`✓ ₹680 Instant UPI Settled to ${profile.upiId} (UTR: ${data.utrNumber})`);
    } catch (err) {
      console.error(err);
    } finally {
      setPayoutProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950/30 to-gray-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-xl">
              {profile.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{profile.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3" /> KYC Verified
                </span>
              </div>
              <p className="text-xs text-purple-300 font-mono mt-0.5">
                {profile.badge} • {profile.location} • {profile.languages.join(', ')}
              </p>
            </div>
          </div>

          {/* ONLINE TOGGLE & INSTANT STATS */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-950 border border-gray-800 p-3 rounded-2xl font-mono text-xs text-right">
              <span className="text-gray-500 block text-[10px]">Unsettled Balance</span>
              <span className="text-emerald-400 font-black text-lg">₹680 INR</span>
            </div>

            <button
              onClick={() => setProfile((p) => ({ ...p, isOnline: !p.isOnline }))}
              className={`px-4 py-3 rounded-2xl text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
                profile.isOnline
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-gray-900 border-gray-800 text-gray-500'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${profile.isOnline ? 'animate-ping' : ''}`} />
              <span>{profile.isOnline ? 'ONLINE & ACCEPTING' : 'OFFLINE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE CALL SOFTPHONE BAR (IF IN CALL) */}
      {activeCall && (
        <div className="bg-[#0B0F19] border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-gray-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE WebRTC Softphone Call Active</span>
              </div>
              <h3 className="text-xl font-bold text-white">Caller: {activeCall.userMoniker}</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Topic: {activeCall.topic} • Handover from: {activeCall.escalatedFromPersona}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-900 px-4 py-2 rounded-2xl border border-gray-800 text-center font-mono">
                <span className="text-[10px] text-gray-500 block">CALL TIME</span>
                <span className="text-2xl font-black text-amber-400">
                  {Math.floor(callDurationSeconds / 60)}:
                  {String(callDurationSeconds % 60).padStart(2, '0')}
                </span>
              </div>

              {/* CALL CONTROLS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isMuted
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl flex items-center gap-2 text-xs shadow-lg shadow-rose-950/60 transition-all"
                >
                  <PhoneOff className="w-4 h-4" /> End Call
                </button>
              </div>
            </div>
          </div>

          {/* REALTIME AUDIO WAVE & NOTEPAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                <span>PCM Voice Level (Caller / Listener)</span>
                <span className="text-emerald-400">Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 h-16 bg-black/60 rounded-xl p-3 justify-center">
                {[40, 65, 85, 30, 95, 55, 75, 45, 90, 60, 35, 80, 50, 70, 90, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 bg-gradient-to-t from-emerald-500 to-amber-400 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" /> Ephemeral Session Notes (Auto-deleted on Call End)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type temporary reflections here..."
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-3 text-xs text-gray-200 outline-none focus:border-purple-500 h-20 resize-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN MAIN CONTENT: INCOMING CALL QUEUE + EARNINGS LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1 & 2: INCOMING QUEUE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Live Incoming Call Dispatcher
              </h3>
              <p className="text-xs text-gray-400">Delhi NCR Peer-to-Peer Escalation Queue</p>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-3 py-1 rounded-xl border border-purple-500/30">
              {queue.length} Waiting
            </span>
          </div>

          <div className="space-y-3">
            {queue.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="bg-gray-900/80 border border-gray-800 hover:border-purple-500/50 rounded-3xl p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">{ticket.userMoniker}</span>
                    <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800">
                      {ticket.category}
                    </span>
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded-full">
                      Wait: {ticket.waitTimeSeconds}s
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{ticket.topic}</h4>
                  <p className="text-xs text-gray-400">
                    AI Escalation Source: <strong className="text-gray-300">{ticket.escalatedFromPersona}</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleAcceptCall(ticket)}
                  disabled={!profile.isOnline || !!activeCall}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all shrink-0"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Accept Incoming Call</span>
                </button>
              </div>
            ))}

            {queue.length === 0 && (
              <div className="p-8 text-center bg-gray-900/40 border border-gray-800 rounded-3xl text-gray-500 text-xs font-mono">
                No waiting calls in queue. You are active on standby.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: EARNINGS & DIRECT PAYOUTS */}
        <div className="space-y-6">
          
          <div className="bg-gray-900/80 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Earnings & Settlement
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full">
                ₹7.5 / Min
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Total Sessions:</span>
                <span className="text-white font-bold">{profile.totalSessions}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Accumulated Unsettled:</span>
                <span className="text-emerald-400 font-bold">₹680.00 INR</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Payout UPI VPA:</span>
                <span className="text-amber-400">{profile.upiId}</span>
              </div>
            </div>

            {payoutSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-[11px] font-mono text-emerald-300">
                {payoutSuccess}
              </div>
            )}

            <button
              onClick={handleTriggerInstantPayout}
              disabled={payoutProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-xs font-mono shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{payoutProcessing ? 'Triggering Direct Payout API...' : 'Instant Payout to UPI (₹680)'}</span>
            </button>
          </div>

          {/* HISTORICAL SETTLEMENTS */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider">
              Settlement History
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {payouts.map((p) => (
                <div key={p.id} className="p-3 bg-gray-950 rounded-2xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <span className="text-emerald-400 font-bold block">+₹{p.amountInr}</span>
                    <span className="text-[10px] text-gray-500">{p.timestamp} • {p.talkMinutes} mins</span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-1 rounded-lg">
                    {p.utrNumber.substring(0, 8)}...
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* LOCAL CALL HISTORY (INDEXEDDB OFFLINE PRIVACY) */}
      <div className="pt-2">
        <LocalCallHistoryView onRefreshTrigger={historyRefreshTrigger} />
      </div>

    </div>
  );
};
