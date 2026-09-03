import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Lock,
  Trash2,
  Download,
  Search,
  Clock,
  Coins,
  ShieldCheck,
  RefreshCw,
  EyeOff,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  LocalCallRecord,
  getAllLocalCallRecords,
  deleteLocalCallRecord,
  clearAllLocalCallRecords,
  seedInitialLocalHistoryIfEmpty
} from '../utils/localCallHistoryDb';

interface LocalCallHistoryViewProps {
  onRefreshTrigger?: number;
}

export const LocalCallHistoryView: React.FC<LocalCallHistoryViewProps> = ({
  onRefreshTrigger = 0,
}) => {
  const [records, setRecords] = useState<LocalCallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await seedInitialLocalHistoryIfEmpty();
      setRecords(data);
    } catch (e) {
      console.error('Error loading IndexedDB records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [onRefreshTrigger]);

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteLocalCallRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('Call record purged from local IndexedDB.');
    } catch (e) {
      console.error('Failed to delete record:', e);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to shred all local IndexedDB session history? This action is irreversible and no cloud copy exists.')) {
      try {
        await clearAllLocalCallRecords();
        setRecords([]);
        showToast('All local IndexedDB history securely shredded.');
      } catch (e) {
        console.error('Failed to clear IndexedDB:', e);
      }
    }
  };

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `talkingterms_local_sessions_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported local JSON successfully.');
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.callerMonikerTruncated.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topicTruncated.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.escalatedFromPersona.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalMinutes = Math.round(records.reduce((sum, r) => sum + r.durationSeconds, 0) / 60);
  const totalEarnings = records.reduce((sum, r) => sum + r.earnedInr, 0);

  return (
    <div
      id="local-call-history-section"
      className="bg-gray-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Privacy Guarantee Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <HardDrive className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              Local Call History (IndexedDB Offline Only)
            </h3>
          </div>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Truncated session logs are strictly committed to your browser's private client-side IndexedDB sandbox. Zero telemetry is sent to any remote server.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={records.length === 0}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200 border border-gray-700 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            title="Download offline JSON file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={records.length === 0}
            className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            title="Purge all local session records"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Local Shred</span>
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Privacy KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-950/80 p-3.5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 font-mono block mb-0.5">Stored Records</span>
          <span className="text-lg font-black text-white">{records.length} Sessions</span>
        </div>

        <div className="bg-gray-950/80 p-3.5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 font-mono block mb-0.5">Total Offloaded Time</span>
          <span className="text-lg font-black text-amber-400">{totalMinutes} Mins</span>
        </div>

        <div className="bg-gray-950/80 p-3.5 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 font-mono block mb-0.5">Verified Payout</span>
          <span className="text-lg font-black text-emerald-400">₹{totalEarnings} INR</span>
        </div>

        <div className="bg-gray-950/80 p-3.5 rounded-2xl border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 font-mono block mb-0.5 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Storage Isolation
          </span>
          <span className="text-xs font-mono font-bold text-gray-200">100% Client-Side</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search local records by truncated moniker, topic, or persona..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 font-mono focus:border-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:border-purple-500 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="Career & Exams">Career & Exams</option>
          <option value="Isolation & Loneliness">Isolation & Loneliness</option>
          <option value="Corporate Burnout">Corporate Burnout</option>
          <option value="Relationship Stress">Relationship Stress</option>
        </select>
      </div>

      {/* Records Table / Cards */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-purple-400" />
            Loading IndexedDB store...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-gray-950/40 border border-gray-800 rounded-2xl text-xs font-mono text-gray-500">
            {records.length === 0
              ? 'No past calls recorded in local IndexedDB yet.'
              : 'No records match your filter criteria.'}
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-gray-950/70 border border-gray-800/90 hover:border-purple-500/40 p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-400">
                    {record.callerMonikerTruncated}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800">
                    {record.category}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    via {record.escalatedFromPersona}
                  </span>
                </div>

                <div className="text-xs text-gray-300 font-sans truncate" title={record.topicTruncated}>
                  {record.topicTruncated}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" /> {record.durationFormatted}
                  </span>
                  <span>•</span>
                  <span>{record.timestamp}</span>
                  <span>•</span>
                  <span className="text-slate-400 font-bold">+₹{record.earnedInr} Earned</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-[9px] uppercase px-2 py-1 rounded-md bg-black/50 text-gray-400 border border-gray-800">
                  Zero Sync
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteRecord(record.id)}
                  className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all"
                  title="Purge this session from IndexedDB"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Guarantee Tag */}
      <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-500">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 Compliant: Zero Cloud Synchronization Guarantee</span>
        </div>
        <span>Schema: TalkingTerms_ListenerDB_v1</span>
      </div>
    </div>
  );
};
