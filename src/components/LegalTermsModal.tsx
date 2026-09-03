import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, AlertTriangle, Phone, CheckCircle2, X, Scale, UserCheck, HardDrive } from 'lucide-react';
import { VERIFIED_HELPLINES } from './CrisisHelplineModal';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'medical';
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'medical'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div className="bg-[#090D16] border border-slate-700/80 rounded-3xl max-w-3xl w-full p-4 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* TOP HEADER */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg sm:text-xl font-black text-white font-display">
                Talking Terms Legal & Privacy Governance
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                DPDP Act 2023 (India) • Zero-Knowledge Architecture • Mental Healthcare Act 2017 Disclaimers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS HEADER */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all min-h-[44px] ${
              activeTab === 'terms'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all min-h-[44px] ${
              activeTab === 'privacy'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & DPDP Act 2023</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all min-h-[44px] ${
              activeTab === 'medical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Non-Medical Disclaimer</span>
          </button>
        </div>

        {/* TAB CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 text-xs text-slate-300 leading-relaxed space-y-4">
          
          {/* TAB 1: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider block mb-1">
                  Effective Date: September 2026 • Version 2.4 (Production Hardened)
                </span>
                <p className="text-slate-200">
                  By accessing or utilizing Talking Terms (&quot;the Platform&quot;), you acknowledge and irrevocably agree to be bound by these Terms of Service. If you do not agree with any provision herein, you must immediately discontinue use of the platform.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">1. Scope of the Service</h3>
                <p>
                  Talking Terms is an anonymous, voice-first peer emotional offloading platform designed primarily for students, young professionals, and aspirants navigating everyday exam pressure, workplace stress, and urban burnout. The service includes conversational AI personas, peer voice channels, and self-hosted open-source software packages.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">2. Non-Commercial & Peer Sanctuary Nature</h3>
                <p>
                  The platform operates as a community sanctuary. AI personas simulate empathetic, colloquial cultural peers (e.g., UPSC aspirants, tech workers, elders). They are algorithmic conversational entities powered by machine intelligence. They do NOT provide advice with legal, medical, psychiatric, financial, or institutional authority.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">3. User Code of Conduct</h3>
                <p>
                  You agree to use Talking Terms responsibly. You are strictly prohibited from:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li>Engaging in harassment, hate speech, defamation, or threatening violence against any human being or community.</li>
                  <li>Attempting to deanonymize, dox, or reverse-engineer peer listeners or other platform participants.</li>
                  <li>Broadcasting non-consensual sexually explicit or unlawful audio content.</li>
                  <li>Attempting to attack, inject exploit vectors into, or flood the platform&apos;s WebRTC or WebSocket relays.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">4. Zero-Knowledge Blind Tokens & Payments</h3>
                <p>
                  Voice call allowances are verified using cryptographic blind tokens (unblinded client signatures). Talking Terms does not link user payment instruments (e.g., UPI IDs or card details) with voice session contents or session IDs. All micro-contributions and token purchases are processed via authorized third-party gateways (e.g., UPI, Razorpay) and are non-refundable once the blind token has been signed and credited.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">5. Limitation of Liability</h3>
                <p>
                  To the maximum extent permissible under applicable law, Talking Terms, its contributors, authors, and maintainers disclaim any liability for indirect, incidental, or consequential damages resulting from user reliance on conversational persona statements. Users bear full responsibility for their personal decisions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY & DPDP ACT 2023 */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 mb-0.5">
                    Zero-Knowledge & Ephemeral RAM Processing Guarantee
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Talking Terms was architected from ground zero to respect privacy by design under the Digital Personal Data Protection Act, 2023 (India) and international privacy frameworks.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">1. Categories of Data Handled</h3>
                <p>
                  We adhere to strict data minimization. Here is exactly what is and is not collected:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <span className="text-rose-400 font-bold block mb-1">❌ What We NEVER Collect:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
                      <li>Personal names, phone numbers, or emails (except CEO admin login)</li>
                      <li>Government IDs or Aadhaar numbers</li>
                      <li>Permanent audio/voice recording archives</li>
                      <li>Persistent IP address tracking records</li>
                    </ul>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <span className="text-emerald-400 font-bold block mb-1">✓ What Is Processed Ephemerally:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
                      <li>Client-side Argon2id hash (blind moniker)</li>
                      <li>Real-time ephemeral voice packets (buffered in RAM only)</li>
                      <li>Immediate session sentiment & distress score</li>
                      <li>Blind token balance counter in your browser storage</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">2. RAM Zeroization Protocol</h3>
                <p>
                  When an active call or voice session terminates, the client and server immediately execute a memory zeroization routine (<code>zeroizeAudioBuffer</code> &amp; <code>purgeClientAudioCaches</code>). Session transcripts stored in volatile memory for conversational context are purged upon room closure or when you click &quot;Scrub RAM&quot;.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">3. User Rights under DPDP Act 2023</h3>
                <p>
                  As a data principal, you have full sovereignty over your local browser vault:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li><strong>Right to Erasure:</strong> You can purge your browser identity key, stored blind tokens, and cached audio diagnostic traces at any time with 1 click via the Identity Shield dashboard.</li>
                  <li><strong>Right to Information:</strong> All client-side cryptography algorithms (Argon2id WASM, blind signature verification) are visible and inspectable in the open-source codebase.</li>
                  <li><strong>Right to Grievance Redressal:</strong> Questions or security reports can be submitted to our administrative compliance contact at <code>Adv.akash2356@gmail.com</code>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: NON-MEDICAL DISCLAIMER */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <div className="bg-rose-950/40 border-2 border-rose-500/50 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Mandatory Statutory Mental Health Disclaimer</span>
                </div>
                <p className="text-xs text-rose-100 font-medium leading-relaxed">
                  Talking Terms is NOT a licensed healthcare establishment, psychiatric clinic, hospital, or mental health therapy provider. The conversational AI models and peer listeners do NOT provide clinical diagnoses, psychiatric assessments, psychotherapy, crisis triage, or prescription of psychiatric pharmaceuticals under the Mental Healthcare Act, 2017 (India) or any international medical jurisdiction.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-display mb-1">Emergency Situations & Acute Crisis</h3>
                <p>
                  If you, a family member, or a friend are experiencing thoughts of self-harm, suicidal ideation, psychotic distress, severe clinical depression, or any acute medical emergency, please do NOT rely on Talking Terms. Discontinue use immediately and contact certified national emergency infrastructure:
                </p>
              </div>

              {/* DIRECT HELPLINE CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {VERIFIED_HELPLINES.map((line) => (
                  <div key={line.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{line.name}</span>
                        {line.verifiedGov && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                            Govt
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">{line.focus}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{line.hours} • {line.languages}</p>
                    </div>

                    <a
                      href={line.telUri}
                      className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs transition-colors min-h-[40px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {line.number}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-mono text-center sm:text-left">
            <span>Admin Contact: </span>
            <span className="text-orange-400">Adv.akash2356@gmail.com</span>
            <span className="mx-2">•</span>
            <span>Zero-Knowledge Blind Verification</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono min-h-[44px] transition-colors"
          >
            I Acknowledge & Understand
          </button>
        </div>

      </div>
    </div>
  );
};
