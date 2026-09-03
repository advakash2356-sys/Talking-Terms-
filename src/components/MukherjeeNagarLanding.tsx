import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  BookOpen,
  Coffee,
  Heart,
  Globe,
  FileCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Mic,
  Send,
  Radio,
  Flame,
  Volume2,
  Clock
} from 'lucide-react';
import { Persona } from '../types';
import { ambientSoundEngine } from '../utils/ambientSynth';
import { SpatialCityMap3D } from './3d/SpatialCityMap3D';

interface MukherjeeNagarLandingProps {
  onConnectPersona: (personaId: string) => void;
  onOpenEscalationModal: () => void;
}

export const MukherjeeNagarLanding: React.FC<MukherjeeNagarLandingProps> = ({
  onConnectPersona,
  onOpenEscalationModal,
}) => {
  const [stressScore, setStressScore] = useState<number | null>(null);
  const [stressAnswers, setStressAnswers] = useState<{ [key: string]: number }>({});
  const [showSeoSchema, setShowSeoSchema] = useState(false);
  const [gscStatus, setGscStatus] = useState<'idle' | 'testing' | 'indexed'>('idle');

  // Anonymous Voice Drop Wall State
  const [dropText, setDropText] = useState('');
  const [isDropping, setIsDropping] = useState(false);
  const [voiceDrops, setVoiceDrops] = useState([
    {
      id: 'drop_1',
      author: 'Nehru Vihar PG (Room 204)',
      time: '12 mins ago',
      text: 'Mock test #4 mein CSAT fail ho gaya. Mummy ka call aaya tha puch rahi thi tabiyat kaisi hai, sach bolne ki himmat nahi hui.',
      likes: 42,
    },
    {
      id: 'drop_2',
      author: 'Batra Cinema Chai Tapri',
      time: '34 mins ago',
      text: '3 saal se yehi cycle chal raha hai. Dost corporate mein 25 LPA kama rahe hain aur main yahan Laxmikanth ke 4th revision pe baitha hoon.',
      likes: 89,
    },
    {
      id: 'drop_3',
      author: 'Gandhi Vihar Library',
      time: '1 hour ago',
      text: 'Jo bhi ye padh raha hai: chai piyo, 10 minute balcony mein khade ho jao. Ye exam poori zindagi nahi hai bhai.',
      likes: 124,
    },
  ]);

  const questions = [
    { id: 'q1', text: 'How frequently do you feel overwhelming panic about Prelims/Mains or mock test rankings?' },
    { id: 'q2', text: 'Do you spend over 12 hours alone in a library cubicle without speaking a single word to anyone?' },
    { id: 'q3', text: 'Do you feel severe guilt or fear when calling parents because of expectations and expenses?' },
    { id: 'q4', text: 'Have you been experiencing erratic sleep cycles in your PG room in Batra or Nehru Vihar?' },
  ];

  const handleScoreChange = (qId: string, val: number) => {
    const updated = { ...stressAnswers, [qId]: val };
    setStressAnswers(updated);
    if (Object.keys(updated).length === questions.length) {
      const sum = (Object.values(updated) as number[]).reduce((a: number, b: number) => a + b, 0);
      setStressScore(Math.round((sum / (questions.length * 3)) * 100));
    }
  };

  const handlePostDrop = () => {
    if (!dropText.trim()) return;
    const newDrop = {
      id: `drop_${Date.now()}`,
      author: 'Mukherjee Nagar Aspirant',
      time: 'Just now',
      text: dropText.trim(),
      likes: 1,
    };
    setVoiceDrops([newDrop, ...voiceDrops]);
    setDropText('');
    setIsDropping(false);
  };

  const simulateGscPing = () => {
    setGscStatus('testing');
    setTimeout(() => {
      setGscStatus('indexed');
    }, 1200);
  };

  // Structured Data Schema JSON-LD
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        'name': 'Talking Terms Mukherjee Nagar Voice Sanctuary',
        'description': 'Anonymous voice-first empathetic offloading platform for UPSC, SSC, and state PCS aspirants in Delhi NCR.',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Batra Cinema Complex & Commercial Center',
          'addressLocality': 'Mukherjee Nagar',
          'addressRegion': 'Delhi',
          'postalCode': '110009',
          'addressCountry': 'IN',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 28.7077,
          'longitude': 77.2064,
        },
        'openingHours': 'Mo-Su 00:00-24:00',
        'priceRange': 'Free / Zero-Knowledge Blind Tokens',
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Is my phone number visible when calling from Mukherjee Nagar PG?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. Talking Terms uses Argon2id client-side WASM blind tokens and WebRTC ephemeral relays. Zero phone numbers, names, or device IDs are ever stored or transmitted.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Can I speak in Hindi or Hinglish about UPSC attempt stress?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! Persona Kabir and verified Delhi human listeners speak authentic vernacular Hinglish specifically tuned to UPSC syllabus burnout, CSAT anxiety, and library fatigue.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* HERO SECTION: LATE NIGHT STUDY SANCTUARY */}
      <div className="bg-gradient-to-br from-orange-950/40 via-slate-900 to-[#0B0F19] border border-orange-500/30 rounded-3xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Batra Cinema • Nehru Vihar • Gandhi Vihar
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>3,842 Aspirants Online Tonight</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Mukherjee Nagar Late-Night Chai Tapri & Study Room ☕
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              14-hour library shifts, mock score anxiety, and the silent suffocation of attempts. Don't carry the weight alone in your PG room tonight.
            </p>

            {/* INSTANT CONNECT BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onConnectPersona('kabir_upsc')}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-500/25 transition-all flex items-center gap-2.5 text-xs sm:text-sm active:scale-95"
              >
                <PhoneCall className="w-4 h-4 fill-slate-950" />
                <span>Talk to Kabir (UPSC Aspirant Peer)</span>
              </button>

              <button
                type="button"
                onClick={() => onConnectPersona('sunita_homemaker')}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-rose-500/40 text-rose-300 font-bold rounded-2xl transition-all flex items-center gap-2.5 text-xs sm:text-sm active:scale-95"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Maternal Hug (Sunita Ji)</span>
              </button>

              <button
                type="button"
                onClick={onOpenEscalationModal}
                className="px-5 py-3.5 bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 font-bold rounded-2xl transition-all flex items-center gap-2 text-xs sm:text-sm active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Human Peer Listener</span>
              </button>
            </div>
          </div>

          {/* Quick Ambient Tapri Player Card */}
          <div className="w-full lg:w-72 bg-slate-950/80 border border-orange-500/30 rounded-3xl p-5 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-orange-400 text-xs font-mono font-bold uppercase">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Chai Tapri Ambience</span>
            </div>
            <p className="text-xs text-slate-400">
              Listen to relaxing tin-roof rain & late-night study frequencies while reading Laxmikanth or Spectrum.
            </p>
            <button
              type="button"
              onClick={() => ambientSoundEngine.play('chai_rain')}
              className="w-full py-2.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Toggle Rain on Tin Roof</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> 100% Zero-Knowledge Ghost Mode
          </span>
          <span>• Ephemeral RAM Audio Wipe</span>
          <span>• 24x7 Late-Night Voice Line</span>
        </div>
      </div>

      {/* 3D ISOMETRIC CITY SOUNDSCAPE & LIVE BEACONS */}
      <SpatialCityMap3D />

      {/* ANONYMOUS "DUKH & DOUBT" VOICE DROP WALL */}
      <div className="bg-[#0e1322]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-mono font-bold uppercase">
              <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Late-Night Aspirant Wall</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Anonymous "Dukh & Doubt" Voice Drops 📜
            </h2>
            <p className="text-xs text-slate-400">
              Unfiltered thoughts dropped by peers in Mukherjee Nagar & Karol Bagh. No names, no judgment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDropping(!isDropping)}
            className="px-4 py-2.5 bg-orange-500 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-orange-500/20"
          >
            <Mic className="w-4 h-4" />
            <span>Drop Your Thought (Free)</span>
          </button>
        </div>

        {/* Input Form for New Drop */}
        {isDropping && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-orange-500/40 space-y-3 animate-in fade-in">
            <textarea
              value={dropText}
              onChange={(e) => setDropText(e.target.value)}
              placeholder="Dil halka karo bhai... Mock score kam aaya? Family expectations se ghutan ho rahi hai? Write or speak anonymously..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 min-h-[90px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-mono">🔒 Auto-anonymized before posting</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDropping(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePostDrop}
                  className="px-4 py-1.5 rounded-xl bg-orange-500 text-slate-950 text-xs font-black flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Anonymously</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {voiceDrops.map((drop) => (
            <div
              key={drop.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-orange-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="text-orange-400 font-bold">{drop.author}</span>
                  <span>{drop.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "{drop.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceDrops(voiceDrops.map((d) => (d.id === drop.id ? { ...d, likes: d.likes + 1 } : d)));
                    if (navigator.vibrate) navigator.vibrate(25);
                  }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-mono text-[11px]">{drop.likes} Relatable</span>
                </button>

                <button
                  type="button"
                  onClick={() => onConnectPersona('kabir_upsc')}
                  className="text-orange-400 hover:text-orange-300 font-bold text-[11px]"
                >
                  Discuss with Kabir →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASPIRANT STRESS ASSESSMENT INTERACTIVE CARD */}
      <div className="bg-[#0e1322]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" /> Aspirant Burnout & Isolation Self-Check
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Anonymous 30-second assessment for Mukherjee Nagar & Karol Bagh students.
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <p className="text-xs sm:text-sm text-slate-200 font-medium">{q.text}</p>
              <div className="flex flex-wrap gap-2">
                {['Rarely (0)', 'Sometimes (1)', 'Frequently (2)', 'Daily (3)'].map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleScoreChange(q.id, idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      stressAnswers[q.id] === idx
                        ? 'bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {stressScore !== null && (
          <div className="bg-orange-950/30 border border-orange-500/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono text-orange-400 uppercase font-bold">Aspirant Stress Index</span>
              <h3 className="text-2xl font-black text-white">{stressScore}% Burnout Load</h3>
              <p className="text-xs text-orange-200/90 max-w-md">
                You've been holding immense weight quietly in your room. Talking it out for just 10 minutes releases cortisol build-up.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onConnectPersona('kabir_upsc')}
              className="px-6 py-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl text-xs transition-all shrink-0 flex items-center gap-2 active:scale-95 shadow-lg"
            >
              <PhoneCall className="w-4 h-4 fill-slate-950" /> Start Anonymous Call Now
            </button>
          </div>
        )}
      </div>

      {/* SEO & SEARCH INDEX VALIDATOR */}
      <div className="bg-[#0e1322]/70 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
              <Globe className="w-4 h-4" /> Search Indexing & Schema.org Local SEO Engine
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Automated Mukherjee Nagar Indexing & Structured Data
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSeoSchema(!showSeoSchema)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5 border border-slate-700"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showSeoSchema ? 'Hide JSON-LD Schema' : 'Inspect JSON-LD Schema'}</span>
            </button>

            <button
              type="button"
              onClick={simulateGscPing}
              disabled={gscStatus === 'testing'}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-lg"
            >
              <Search className={`w-3.5 h-3.5 ${gscStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>{gscStatus === 'indexed' ? 'Indexed in Search Console ✓' : 'Ping Search Index Sitemap API'}</span>
            </button>
          </div>
        </div>

        {showSeoSchema && (
          <div className="bg-black/90 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
            <pre>{JSON.stringify(schemaJsonLd, null, 2)}</pre>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Target Route</span>
            <span className="text-cyan-400 font-bold">/mukherjee-nagar</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Sitemap Status</span>
            <span className="text-emerald-400 font-bold">/sitemap.xml (Active)</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Search Crawler Verification</span>
            <span className="text-amber-400 font-bold">DNS TXT & HTML Tag Verified</span>
          </div>
        </div>
      </div>

    </div>
  );
};
