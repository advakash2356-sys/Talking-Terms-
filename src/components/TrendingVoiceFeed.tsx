import React, { useState, useRef } from 'react';
import {
  Flame,
  Play,
  Pause,
  Share2,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Radio,
  MessageCircle,
  Download,
  Heart,
  TrendingUp,
  MapPin,
  Clock,
  Mic2,
  Filter,
  Plus
} from 'lucide-react';
import { voiceSnippetDB } from '../utils/voiceSnippetDB';

interface TrendingSnippet {
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  avatar: string;
  location: string;
  audioDuration: string;
  transcript: string;
  tags: string[];
  fireCount: number;
  listenCount: number;
  category: 'rant' | 'upsc' | 'du_vibe' | 'late_night' | 'humor';
  voicePitch: number;
  voiceRate: number;
}

const TRENDING_POSTS: TrendingSnippet[] = [
  {
    id: 'snip_1',
    title: 'CyberHub Toll Pe 2 Ghante Ka Traffic Rant 🚗💨',
    creator: 'Rohan Sharma',
    creatorHandle: '@rohan_cybercity',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    location: 'Cyber City, Gurgaon',
    audioDuration: '0:18',
    transcript: 'Bhai Gurgaon toll pe do ghante se gaadi phansi hai. AC chalake baitha hoon aur manager ka work chat pe message aa raha hai "Are you online?". Bhai main hawa mein code likhoon kya?!',
    tags: ['#GurgaonTraffic', '#CorporateBurnout', '#HinglishRant'],
    fireCount: 4280,
    listenCount: 18400,
    category: 'rant',
    voicePitch: 1.0,
    voiceRate: 1.1,
  },
  {
    id: 'snip_2',
    title: 'Mukherjee Nagar Library: 3 AM Reality Check 📚',
    creator: 'Kabir & PG Gang',
    creatorHandle: '@upsc_batra_room',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    location: 'Batra Cinema, Mukherjee Nagar',
    audioDuration: '0:22',
    transcript: 'Library ki batti 3 baje bhi jalti rehti hai. Bahar chai ki tapri pe sab bolte hain "is baar ho jayega". Par andar se jo darr lagta hai na mock test score dekh ke... bas wahi jaanta hai jo yahan baitha hai.',
    tags: ['#MukherjeeNagar', '#UPSCAspirant', '#LateNightChai'],
    fireCount: 8910,
    listenCount: 34200,
    category: 'upsc',
    voicePitch: 0.95,
    voiceRate: 1.0,
  },
  {
    id: 'snip_3',
    title: 'South Delhi Café: ₹650 For Warm Water & Oat Milk? ☕✨',
    creator: 'Ananya Roy',
    creatorHandle: '@ananya_south_ex',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    location: 'Hauz Khas Village',
    audioDuration: '0:15',
    transcript: 'Guys I literally just paid six hundred and fifty rupees for an iced matcha with oat milk that tasted like sad grass. The aesthetic was giving 10/10 but my bank account is crying!',
    tags: ['#SouthDelhi', '#HauzKhas', '#AestheticFail'],
    fireCount: 6120,
    listenCount: 22100,
    category: 'du_vibe',
    voicePitch: 1.2,
    voiceRate: 1.08,
  },
  {
    id: 'snip_4',
    title: 'North Campus Fest Gate Crash Drama 😂🎸',
    creator: 'Aarav Mehta',
    creatorHandle: '@aarav_stephens',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    location: 'North Campus, DU',
    audioDuration: '0:19',
    transcript: 'Bhai fest mein pass kisi ke paas nahi tha, poori D-School ki janta gate kood ke andar ghus gayi! Security guard bhi bol raha tha "Theek hai bhai pehle concert dekh lo baad mein fine denge"!',
    tags: ['#DUFest', '#NorthCampus', '#DelhiUniversity'],
    fireCount: 5430,
    listenCount: 19800,
    category: 'humor',
    voicePitch: 1.05,
    voiceRate: 1.15,
  },
];

interface TrendingVoiceFeedProps {
  onRemixInStudio?: (text: string) => void;
  onCallPersona?: (personaId: string) => void;
}

export const TrendingVoiceFeed: React.FC<TrendingVoiceFeedProps> = ({
  onRemixInStudio,
  onCallPersona,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ [id: string]: number }>(() => {
    const initial: { [id: string]: number } = {};
    TRENDING_POSTS.forEach((p) => {
      initial[p.id] = p.fireCount;
    });
    return initial;
  });
  const [hasLiked, setHasLiked] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeStoryCard, setActiveStoryCard] = useState<TrendingSnippet | null>(null);

  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const categories = [
    { id: 'all', label: '🔥 All Trending' },
    { id: 'rant', label: '🚗 Delhi Rants' },
    { id: 'upsc', label: '📚 Aspirant Reality' },
    { id: 'du_vibe', label: '✨ DU & South Ex' },
    { id: 'humor', label: '😂 Desi Humor' },
  ];

  const handlePlayVoice = (snippet: TrendingSnippet) => {
    if (playingId === snippet.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(snippet.transcript);
      utterance.rate = snippet.voiceRate;
      utterance.pitch = snippet.voicePitch;
      utterance.lang = 'hi-IN';

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) utterance.voice = hindiVoice;

      utterance.onend = () => {
        setPlayingId(null);
      };
      utterance.onerror = () => {
        setPlayingId(null);
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setPlayingId(snippet.id);
    }
  };

  const handleLike = (id: string) => {
    if (hasLiked[id]) return;
    setLikes((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    setHasLiked((prev) => ({ ...prev, [id]: true }));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleShareDirect = (snippet: TrendingSnippet) => {
    const shareText = `🔥 Listen to this Delhi voice bite: "${snippet.title}"\n\n"${snippet.transcript}"\n\n👉 Generated with Talking Terms Audio AI: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: snippet.title,
        text: shareText,
        url: window.location.origin,
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        setCopiedId(snippet.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyText = (snippet: TrendingSnippet) => {
    navigator.clipboard.writeText(snippet.transcript);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts =
    activeCategory === 'all'
      ? TRENDING_POSTS
      : TRENDING_POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER WITH REAL-TIME VIBE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/40 border border-orange-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-orange-400 font-mono">
              Live Delhi NCR Audio Feed
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Trending Voice Bites & Reels 🔥
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Raw, unfiltered voice snippets from Cyber Hub, Mukherjee Nagar PGs, DU North Campus & Hauz Khas. Tap to listen, remix, or create social audiogram stories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-orange-500/30 text-center">
            <div className="text-xl sm:text-2xl font-black text-orange-400">128.4k</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Daily Listens</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">99.8%</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Real Delhi Vibe</div>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/25 scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* VOICE BITES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ perspective: 1200 }}>
        {filteredPosts.map((post) => {
          const isPlaying = playingId === post.id;
          return (
            <div
              key={post.id}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className={`bg-gradient-to-b from-[#0f172a]/95 via-[#0b0f19]/95 to-[#07090e]/95 border-2 rounded-3xl p-5 sm:p-6 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_20px_50px_rgba(255,107,0,0.15)] hover:-translate-y-1 ${
                isPlaying
                  ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.3)]'
                  : 'border-slate-800 hover:border-orange-500/60'
              }`}
            >
              {/* Top Creator Info */}
              <div className="flex items-start justify-between gap-3 mb-4" style={{ transform: 'translateZ(20px)' }}>
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={post.avatar}
                      alt={post.creator}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500/60 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    {isPlaying && (
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border border-slate-950" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5 font-display">
                      <span>{post.creator}</span>
                      <span className="text-[10px] text-orange-400 font-mono font-normal">
                        {post.creatorHandle}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{post.location}</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>{post.audioDuration}</span>
                </span>
              </div>

              {/* Title & Transcript */}
              <div className="space-y-2 mb-4" style={{ transform: 'translateZ(15px)' }}>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-orange-300 transition-colors font-display">
                  {post.title}
                </h3>
                <div className="p-4 rounded-2xl bg-[#070a12]/80 border border-slate-800/90 text-xs sm:text-sm text-slate-200 italic leading-relaxed font-sans shadow-inner">
                  "{post.transcript}"
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold text-orange-300/90 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20 hover:text-orange-200 transition-colors font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audio Visualizer Waves when active */}
              {isPlaying && (
                <div
                  style={{ transform: 'translateZ(25px)' }}
                  className="flex items-center justify-center gap-1 py-2.5 mb-3.5 bg-slate-950/90 rounded-2xl border border-orange-500/40 shadow-inner"
                >
                  <span className="text-[10px] font-mono text-orange-400 mr-2 flex items-center gap-1 font-bold">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>Spatial Audio Active</span>
                  </span>
                  {[35, 70, 95, 40, 85, 100, 60, 90, 45, 75, 95, 50, 80, 65, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(6, (h / 100) * 24)}px`,
                        animationDuration: `${0.3 + (i % 5) * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons Footer */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="flex items-center justify-between pt-3 border-t border-slate-800/80"
              >
                {/* Play Button & Likes */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(post)}
                    className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 ${
                      isPlaying
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-400'
                        : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-md shadow-orange-500/20'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Listen ({post.audioDuration})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`p-2 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      hasLiked[post.id]
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm shadow-orange-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-orange-400'
                    }`}
                    title="Send Fire"
                  >
                    <Flame className={`w-3.5 h-3.5 ${hasLiked[post.id] ? 'fill-orange-400 text-orange-400' : ''}`} />
                    <span>{likes[post.id]}</span>
                  </button>
                </div>

                {/* Social Share & Studio Transfer */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleShareDirect(post)}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                    title="Share Voice Note"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStoryCard(post)}
                    className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-300 hover:bg-fuchsia-500/20 border border-fuchsia-500/30 transition-all"
                    title="Create Visual Story Audiogram"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {onRemixInStudio && (
                    <button
                      type="button"
                      onClick={() => onRemixInStudio(post.transcript)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-orange-300 text-[11px] font-bold border border-orange-500/30 transition-all flex items-center gap-1"
                      title="Remix script in AI Voice Studio"
                    >
                      <Mic2 className="w-3 h-3" />
                      <span>Dub</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VISUAL STORY AUDIOGRAM MODAL */}
      {activeStoryCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0e1322] border border-orange-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-orange-400 font-mono uppercase tracking-wider">
                Visual Story Audiogram
              </span>
              <button
                type="button"
                onClick={() => setActiveStoryCard(null)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Story Card Canvas Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-black border border-orange-500/30 space-y-4 shadow-inner">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                  TT
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">Talking Terms Audio</div>
                  <div className="text-[10px] text-orange-400 font-mono">{activeStoryCard.location}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 italic font-medium leading-relaxed">
                "{activeStoryCard.transcript}"
              </div>

              {/* Animated Equalizer Visual */}
              <div className="flex items-center justify-center gap-1 py-1">
                {[40, 70, 90, 50, 85, 100, 60, 95, 45, 80, 95, 50, 75, 40].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-orange-500 to-amber-400 rounded-full"
                    style={{ height: `${(h / 100) * 32}px` }}
                  />
                ))}
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                🔥 {activeStoryCard.fireCount.toLocaleString()} Aspirants Echoed This
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleShareDirect(activeStoryCard);
                  setActiveStoryCard(null);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Voice Note Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `🔥 "${activeStoryCard.title}"\n${activeStoryCard.transcript}\n\nListen on Talking Terms: ${window.location.origin}`
                  );
                  alert('Story Caption & Audio link copied to clipboard!');
                  setActiveStoryCard(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-orange-400" />
                <span>Copy Story Captions & Tags</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
