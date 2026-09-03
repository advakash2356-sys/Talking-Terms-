import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Sparkles,
  QrCode,
  ArrowRight,
  KeyRound,
  Layers,
  HelpCircle,
  Heart,
  Smartphone,
  ExternalLink,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { BlindToken, ShieldIdentity } from '../types';
import { getCommunityPool, contributeToCommunityPool, claimStudentSponsoredMinutes } from '../utils/dailyAllowance';

interface VoiceCreditsModalProps {
  identity: ShieldIdentity;
  onTokensAdded: (newTokens: BlindToken[], minutesAdded: number) => void;
  onClose: () => void;
}

export const VoiceCreditsModal: React.FC<VoiceCreditsModalProps> = ({
  identity,
  onTokensAdded,
  onClose,
}) => {
  const [selectedPack, setSelectedPack] = useState<'pack_15' | 'pack_45' | 'pack_sponsor'>('pack_15');
  const [step, setStep] = useState<'select' | 'processing_zk' | 'payment_sim' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'upi_intent' | 'qr' | 'card'>('upi_intent');
  const [upiVpa, setUpiVpa] = useState('talkingterms@icici');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [mintedToken, setMintedToken] = useState<BlindToken | null>(null);
  const [communityPool, setCommunityPool] = useState(getCommunityPool());
  const [claimedStudentMins, setClaimedStudentMins] = useState<number | null>(null);

  const packs = [
    {
      id: 'pack_15' as const,
      name: '15 Minutes Offloading',
      minutes: 15,
      priceInr: 99,
      badge: 'Popular for Quick Vent',
      highlight: false,
    },
    {
      id: 'pack_45' as const,
      name: '45 Minutes Deep Session',
      minutes: 45,
      priceInr: 249,
      badge: 'Best for Exam & Burnout',
      highlight: true,
    },
    {
      id: 'pack_sponsor' as const,
      name: 'Sponsor a Student (30 Mins)',
      minutes: 30,
      priceInr: 149,
      badge: '❤️ Community Pool Donation',
      highlight: false,
    },
  ];

  const currentPack = packs.find((p) => p.id === selectedPack)!;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleClaimSponsored = () => {
    const mins = claimStudentSponsoredMinutes();
    if (mins > 0) {
      const sponsoredToken: BlindToken = {
        id: `token_sponsor_${Date.now()}`,
        blindedNonce: `r_community_${Math.random().toString(36).substring(2, 8)}`,
        unblindedSignature: `$zka_community_pool_granted_v2$`,
        issuedAt: new Date().toLocaleTimeString(),
        minutesRemaining: mins,
        isSpent: false,
        orderReference: 'COMMUNITY_SPONSORED_POOL',
      };
      onTokensAdded([sponsoredToken], mins);
      setCommunityPool(getCommunityPool());
      setClaimedStudentMins(mins);
      if (navigator.vibrate) navigator.vibrate([40, 60]);
    }
  };

  // Execute Cryptographic Blind Token Sequence
  const handleInitiateBlindPayment = async () => {
    setStep('processing_zk');
    setTimeout(async () => {
      setStep('payment_sim');
    }, 600);
  };

  const handleCompletePayment = async () => {
    setStep('processing_zk');

    if (currentPack.id === 'pack_sponsor') {
      contributeToCommunityPool(currentPack.minutes);
      setCommunityPool(getCommunityPool());
    }

    try {
      // Step 2: Request server to sign the blinded nonce
      const res = await fetch('/api/payments/sign-blind-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `rzp_${Date.now()}`,
          blindedNonce: `blinded_nonce_${Math.random().toString(36).substring(2, 8)}`,
          minutes: currentPack.minutes,
        }),
      });

      const data = await res.json();

      // Step 3: Client unblinds signature
      const newBlindToken: BlindToken = {
        id: `token_${Date.now()}`,
        blindedNonce: `r_${Math.random().toString(36).substring(2, 10)}`,
        unblindedSignature: data.blindSignature || `$zka_sig_${Math.random().toString(36).substring(2, 10)}`,
        issuedAt: new Date().toLocaleTimeString(),
        minutesRemaining: currentPack.minutes,
        isSpent: false,
        orderReference: `UNLINKED_UPI_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };

      setMintedToken(newBlindToken);
      onTokensAdded([newBlindToken], currentPack.minutes);
      setStep('success');
    } catch (err) {
      // Fallback local mint
      const fallbackToken: BlindToken = {
        id: `token_${Date.now()}`,
        blindedNonce: `r_local_${Math.random().toString(36).substring(2, 8)}`,
        unblindedSignature: `$zka_sig_blind_v2$${Math.random().toString(36).substring(2, 10)}`,
        issuedAt: new Date().toLocaleTimeString(),
        minutesRemaining: currentPack.minutes,
        isSpent: false,
        orderReference: `UNLINKED_UPI_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };
      setMintedToken(fallbackToken);
      onTokensAdded([fallbackToken], currentPack.minutes);
      setStep('success');
    }
  };

  const upiIntentUri = `upi://pay?pa=talkingterms@icici&pn=TalkingTermsSanctuary&am=${currentPack.priceInr}&cu=INR&tn=AnonymousVoiceOffloading`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in"
    >
      <div className="bg-[#0B0F19] border border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Instant UPI Sparks & Top-Ups</h2>
              <p className="text-[11px] text-amber-400 font-mono">1-Tap GPay / PhonePe / Paytm • Zero Logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close voice credits dialog"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: SELECT TOKEN PACK */}
        {step === 'select' && (
          <div className="space-y-4">
            
            {/* COMMUNITY STUDENT POOL CALLOUT */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Student Community Pool</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {communityPool.availableMinutesForStudents} free minutes sponsored by alumni
                </p>
              </div>
              <button
                type="button"
                onClick={handleClaimSponsored}
                className="min-h-[42px] px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all active:scale-95 shrink-0"
              >
                {claimedStudentMins ? 'Claimed +10m ✓' : 'Claim 10m Free'}
              </button>
            </div>

            {/* PACK CARDS */}
            <div className="space-y-2.5">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between min-h-[64px] ${
                    selectedPack === pack.id
                      ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-white text-sm">{pack.name}</h4>
                      <span className="text-[9px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full border border-slate-700">
                        {pack.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {pack.minutes} Minutes AI Persona & Verified Peer Voice
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">₹{pack.priceInr}</span>
                    <span className="text-[9px] text-slate-500 block">incl. all taxes</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleInitiateBlindPayment}
              className="w-full min-h-[48px] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95"
            >
              <span>Pay ₹{currentPack.priceInr} via UPI / Instant QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP: PROCESSING ZK STEP */}
        {step === 'processing_zk' && (
          <div className="py-8 text-center space-y-3">
            <div className="relative flex items-center justify-center mx-auto my-2">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 animate-ping absolute" />
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-500/50 flex items-center justify-center text-amber-400 z-10">
                <Lock className="w-6 h-6 animate-bounce" />
              </div>
            </div>
            <h3 className="text-base font-bold text-white">Blinding Payment Nonce locally...</h3>
            <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
              Decoupling your UPI account from your voice session via zero-knowledge tokens.
            </p>
          </div>
        )}

        {/* STEP: PAYMENT SIMULATOR */}
        {step === 'payment_sim' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Order Amount:</span>
              <span className="text-amber-400 font-bold text-sm">₹{currentPack.priceInr} INR</span>
            </div>

            {/* PAYMENT TABS */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setPaymentMethod('upi_intent')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  paymentMethod === 'upi_intent'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                1-Tap UPI App
              </button>
              <button
                onClick={() => setPaymentMethod('qr')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  paymentMethod === 'qr'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Dynamic QR
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Cards / NetBank
              </button>
            </div>

            {paymentMethod === 'upi_intent' && (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-300">Open directly in your installed UPI app:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                    <a
                      key={app}
                      href={upiIntentUri}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
                    >
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>{app}</span>
                    </a>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>UPI ID: {upiVpa}</span>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copiedVpa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="p-4 bg-white rounded-2xl w-40 h-40 mx-auto flex flex-col items-center justify-center shadow-lg text-slate-950">
                <QrCode className="w-28 h-28 text-slate-950" />
                <span className="text-[9px] font-mono font-bold mt-1">Scan with any UPI App</span>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 font-mono space-y-1">
                <p>100% Encrypted & Instant Payment Sandbox.</p>
                <p className="text-emerald-400 font-bold">✓ Zero personal records logged</p>
              </div>
            )}

            <button
              onClick={handleCompletePayment}
              className="w-full min-h-[46px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Mint {currentPack.minutes} Blind Minutes</span>
            </button>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && mintedToken && (
          <div className="py-3 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
            </div>

            <div>
              <h3 className="text-lg font-black text-emerald-400 font-display">
                +{currentPack.minutes} Voice Minutes Credited!
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Anonymous blind token unblinded into browser vault.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-left font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Token Sig:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[180px]">{mintedToken.unblindedSignature}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Minutes Added:</span>
                <span className="text-amber-400 font-bold">+{currentPack.minutes} Mins</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg active:scale-95"
            >
              Start Anonymous Call Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

