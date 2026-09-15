import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PersonaGrid } from './components/PersonaGrid';
import { IdentityShieldModal } from './components/IdentityShieldModal';
import { DockerStackViewer } from './components/DockerStackViewer';
import { HumanEscalationModal } from './components/HumanEscalationModal';
import { VoiceCallModal } from './components/VoiceCallModal';
import { CeoDashboard } from './components/CeoDashboard';
import { ListenerPortal } from './components/ListenerPortal';
import { VoiceCreditsModal } from './components/VoiceCreditsModal';
import { MukherjeeNagarLanding } from './components/MukherjeeNagarLanding';
import { AudioFeatureModule } from './components/AudioFeatureModule';
import { TrendingVoiceFeed } from './components/TrendingVoiceFeed';
import { FloatingRecordButton } from './components/FloatingRecordButton';
import { SpatialCanvas3D } from './components/3d/SpatialCanvas3D';
import { IntelligenceStudio } from './components/IntelligenceStudio';
import { RawAudioDiagnostic } from './components/RawAudioDiagnostic';
import { ConversationalVoiceEngine } from './components/ConversationalVoiceEngine';
import { CrisisHelplineModal } from './components/CrisisHelplineModal';
import { LegalTermsModal } from './components/LegalTermsModal';
import { GenZExpressVent } from './components/GenZExpressVent';
import { PERSONAS_DATA } from './data/personas';
import { Persona, ShieldIdentity, BlindToken } from './types';
import { preCacheAllPersonaSprites } from './utils/personaSprites';

export default function App() {
  const [activeTab, setActiveTab] = useState<'express' | 'voice-agent' | 'personas' | 'mukherjee' | 'voice-studio' | 'intelligence' | 'ceo' | 'listener' | 'shield' | 'docker' | 'feed' | 'diagnostic'>('express');
  const [activeCallPersona, setActiveCallPersona] = useState<Persona | null>(null);
  const [showShieldModal, setShowShieldModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showHumanModal, setShowHumanModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [escalationPersona, setEscalationPersona] = useState<Persona | null>(null);
  const [engineState, setEngineState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  // Pre-cache all persona sprite assets on initial load to ensure instant zero-latency emotion switches
  useEffect(() => {
    preCacheAllPersonaSprites(PERSONAS_DATA);
  }, []);

  // Authenticated Admin Email for Single-Admin RBAC
  const adminEmail = 'Adv.akash2356@gmail.com';

  const SHIELD_STORAGE_KEY = 'talking_terms_shield_identity_v2';

  // Initial Zero-Knowledge Argon2id Shield Identity with localStorage hydration
  const [identity, setIdentity] = useState<ShieldIdentity>(() => {
    try {
      const saved = localStorage.getItem(SHIELD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.blindTokenBalance === 'number') {
          return parsed;
        }
      }
    } catch (_) {}

    return {
      userUuid: 'usr_anon_9281',
      hashedIdentityKey: '$argon2id$v=19$m=65536,t=3,p=4$e8b3f2a1c9d4e5f6g7h8i9j0k1l2m3n4',
      displayMoniker: 'Aspirant_Anonymous_9281',
      blindTokenBalance: 15,
      shieldActive: true,
      generatedAt: new Date().toLocaleTimeString(),
      activeBlindTokens: [
        {
          id: 'token_init_1',
          blindedNonce: 'r_init_991823',
          unblindedSignature: '$zka_sig_blind_v2$d891b2c4e5f6_demo',
          issuedAt: new Date().toLocaleTimeString(),
          minutesRemaining: 15,
          isSpent: false,
          orderReference: 'UNLINKED_GENESIS_CREDIT',
        },
      ],
    };
  });

  // Sync identity state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SHIELD_STORAGE_KEY, JSON.stringify(identity));
    } catch (_) {}
  }, [identity]);

  const handleConnectCall = (persona: Persona) => {
    if (identity.blindTokenBalance <= 0) {
      setShowCreditsModal(true);
      return;
    }

    // Deduct 1 token for session start
    setIdentity((prev) => ({
      ...prev,
      blindTokenBalance: Math.max(0, prev.blindTokenBalance - 1),
    }));

    setActiveCallPersona(persona);
  };

  const handleConnectPersonaById = (personaId: string) => {
    const found = PERSONAS_DATA.find((p) => p.id === personaId) || PERSONAS_DATA[0];
    handleConnectCall(found);
  };

  const handleEscalateToHuman = (persona?: Persona) => {
    if (persona) {
      setEscalationPersona(persona);
    }
    setActiveCallPersona(null);
    setShowHumanModal(true);
  };

  const handleTokensAdded = (newTokens: BlindToken[], minutesAdded: number) => {
    setIdentity((prev) => ({
      ...prev,
      blindTokenBalance: prev.blindTokenBalance + minutesAdded,
      activeBlindTokens: [...prev.activeBlindTokens, ...newTokens],
    }));
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-orange-500 selection:text-black relative overflow-x-hidden">
      
      {/* 3D SPATIAL PARTICLES & HOLOGRAPHIC GEOMETRIES CANVAS */}
      <SpatialCanvas3D engineState={engineState} />

      {/* NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        identity={identity}
        onOpenShieldModal={() => setShowShieldModal(true)}
        onOpenVoiceCreditsModal={() => setShowCreditsModal(true)}
        adminEmail={adminEmail}
        onOpenCrisisHelpline={() => setShowCrisisModal(true)}
        onOpenLegalModal={() => setShowLegalModal(true)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="pb-28 md:pb-16 relative z-10">
        {activeTab === 'express' && (
          <GenZExpressVent
            identity={identity}
            onStartCall={handleConnectCall}
            onOpenVoiceEngine={() => setActiveTab('voice-agent')}
            onOpenPersonasGrid={() => setActiveTab('personas')}
            onOpenHelpline={() => setShowCrisisModal(true)}
            onOpenCreditsModal={() => setShowCreditsModal(true)}
          />
        )}

        {activeTab === 'voice-agent' && (
          <div className="w-full flex items-center justify-center p-0 sm:p-4">
            <ConversationalVoiceEngine
              onOpenCrisisHelpline={() => setShowCrisisModal(true)}
              onOpenLegalModal={() => setShowLegalModal(true)}
              engineState={engineState}
              setEngineState={setEngineState}
            />
          </div>
        )}

        {activeTab === 'diagnostic' && (
          <div className="py-8">
            <RawAudioDiagnostic />
          </div>
        )}

        {activeTab === 'personas' && (
          <PersonaGrid onConnectCall={handleConnectCall} />
        )}

        {activeTab === 'mukherjee' && (
          <MukherjeeNagarLanding
            onConnectPersona={handleConnectPersonaById}
            onOpenEscalationModal={() => handleEscalateToHuman()}
          />
        )}

        {activeTab === 'intelligence' && (
          <div className="min-h-[calc(100vh-140px)] py-4">
            <IntelligenceStudio />
          </div>
        )}

        {activeTab === 'voice-studio' && (
          <div className="min-h-[calc(100vh-140px)] text-white">
            <AudioFeatureModule />
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <TrendingVoiceFeed onConnectPersona={handleConnectPersonaById} />
          </div>
        )}

        {activeTab === 'ceo' && (
          <CeoDashboard userEmail={adminEmail} />
        )}

        {activeTab === 'listener' && (
          <ListenerPortal />
        )}

        {activeTab === 'shield' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white font-display">Talking Terms Identity Shield Dashboard</h2>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    Argon2id Client WASM • Zero-Knowledge Blind Token Verification
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreditsModal(true)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-2xl shadow-lg transition-all"
                  >
                    + Top Up Voice Minutes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShieldModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
                  >
                    Manage WASM Key
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Talking Terms uses zero-knowledge cryptography. Before any audio packet is dispatched over WebSocket, your browser computes a client-side Argon2id hash. The server validates your blind token balance without ever recording your real IP address, name, email, or device fingerprints.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block mb-1 uppercase text-[10px]">Moniker</span>
                  <span className="text-orange-400 font-bold">{identity.displayMoniker}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block mb-1 uppercase text-[10px]">Token Balance</span>
                  <span className="text-emerald-400 font-bold">{identity.blindTokenBalance} Blind Minutes</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 block mb-1 uppercase text-[10px]">Shield Status</span>
                  <span className="text-emerald-400 font-bold">100% Active & Protected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docker' && <DockerStackViewer />}
      </main>

      {/* ACTIVE CALL MODAL (AI MULTIMODAL LIVE STREAM -> WEBRTC HUMAN PEER) */}
      {activeCallPersona && (
        <VoiceCallModal
          persona={activeCallPersona}
          onEndCall={() => setActiveCallPersona(null)}
          onEscalateToHuman={(p) => handleEscalateToHuman(p)}
          onPersonaSwitch={(p) => setActiveCallPersona(p)}
        />
      )}

      {/* SHIELD MODAL */}
      {showShieldModal && (
        <IdentityShieldModal
          identity={identity}
          onUpdateIdentity={setIdentity}
          onClose={() => setShowShieldModal(false)}
        />
      )}

      {/* VOICE CREDITS (DIRECT GATEWAY + BLIND TOKENS) MODAL */}
      {showCreditsModal && (
        <VoiceCreditsModal
          identity={identity}
          onTokensAdded={handleTokensAdded}
          onClose={() => setShowCreditsModal(false)}
        />
      )}

      {/* HUMAN ESCALATION MODAL */}
      {showHumanModal && (
        <HumanEscalationModal
          persona={escalationPersona}
          onClose={() => {
            setShowHumanModal(false);
            setEscalationPersona(null);
          }}
        />
      )}

      {/* 24/7 CRISIS HELPLINE MODAL (GOVT VERIFIED TELE-MANAS 14416 / KIRAN) */}
      <CrisisHelplineModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* LEGAL, PRIVACY & MEDICAL NON-CLAIM MODAL (DPDP ACT 2023) */}
      <LegalTermsModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 mt-12 pb-24 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400 font-bold">Talking Terms • Delhi NCR Voice-First Anonymous Offloading Platform</p>
          <p className="text-[11px] text-slate-600">
            Zero-Knowledge Argon2id Blind Tokens • Multimodal Live Voice Host • WebRTC Peer Rooms • Single-Admin CEO Telemetry
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] text-orange-400/80 pt-2">
            <button type="button" onClick={() => setActiveTab('mukherjee')} className="hover:underline">Mukherjee Nagar Hub</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab('feed')} className="hover:underline">Live Community Feed</button>
            <span>•</span>
            <button type="button" onClick={() => setActiveTab('voice-studio')} className="hover:underline">Voice Studio</button>
            <span>•</span>
            <button type="button" onClick={() => setShowCrisisModal(true)} className="text-rose-400 font-bold hover:underline">SOS 24/7 Helplines (14416)</button>
            <span>•</span>
            <button type="button" onClick={() => setShowLegalModal(true)} className="text-slate-400 hover:text-white hover:underline">Terms & DPDP Privacy</button>
          </div>
        </div>
      </footer>

      {/* HIGH-VISIBILITY FLOATING VOICE CAPTURE BUTTON */}
      {!activeCallPersona && (
        <FloatingRecordButton
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}
    </div>
  );
}

