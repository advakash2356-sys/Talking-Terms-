# Talking-Terms-

A voice-first anonymous offloading engine featuring AI personas, zero-knowledge identity protection, real-time voice call interaction, and self-hosted stack tooling.

## Features

- **Voice Interaction & Diagnostics**: Real-time voice call interface (`VoiceCallModal`, `ConversationalVoiceEngine`, `RawAudioDiagnostic`, `VoicePitchModulator`, `streamingSTT`).
- **3D Spatial Interfaces**: Three.js-powered visual components including `SpatialCanvas3D`, `AudioRibbon3D`, `Avatar3DFrame`, `HeroFloating3D`, `SpatialCityMap3D`, and `VoiceOrb3D`.
- **Identity Shield**: Argon2id zero-knowledge identity protection mechanisms (`IdentityShieldModal`, `localVault`).
- **Personas & Feed**: Multi-persona selection and interaction (`PersonaGrid`, `PersonaCard`, `PersonaDisplay`, `TrendingVoiceFeed`, Mukherjee Nagar-focused landing experience).
- **Multi-Model AI Service**: Resilient model orchestration using `@google/genai` (supporting `gemini-3.1-flash-lite`, `gemini-flash-latest`, and `gemini-3.7-flash`) with fallback capabilities via OpenRouter.
- **Support & Safety Portals**: Crisis helpline access, human escalation triggers, decompression dialogs, and legal terms review (`CrisisHelplineModal`, `HumanEscalationModal`, `LegalTermsModal`).
- **Telemetry & Infrastructure**: In-memory telemetry matrix tracking distress metrics and empathy scores, along with an integrated viewer for Docker stack definitions (`DockerStackViewer`, `TelemetryMatrixModal`).

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Motion, Lucide React, Recharts
- **3D Graphics**: Three.js (`three`, `@types/three`)
- **Backend**: Node.js, Express, tsx, esbuild, dotenv
- **AI Integration**: `@google/genai`, OpenRouter API

## Setup

### Prerequisites

- Node.js
- npm

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables by copying `.env.example` to `.env` and setting the necessary keys:
   - `GEMINI_API_KEY`
   - `OPENROUTER_API_KEY` (optional, for secondary model routing)

## Usage

Run the local development server (Express server wrapped with Vite via `tsx` on port 3000):
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run the production build:
```bash
npm run start
```

Preview the build:
```bash
npm run preview
```

Run type-checking:
```bash
npm run lint
```

Clean build artifacts:
```bash
npm run clean
```

## Project Structure

```text
├── assets/
├── public/
│   └── manifest.json
├── server/
│   └── aiService.ts
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── AudioRibbon3D.tsx
│   │   │   ├── Avatar3DFrame.tsx
│   │   │   ├── HeroFloating3D.tsx
│   │   │   ├── SpatialCanvas3D.tsx
│   │   │   ├── SpatialCityMap3D.tsx
│   │   │   └── VoiceOrb3D.tsx
│   │   ├── audio-module/
│   │   │   ├── FeatureTabs.tsx
│   │   │   ├── InteractiveDemoWidget.tsx
│   │   │   ├── ShowcaseGrid.tsx
│   │   │   ├── index.ts
│   │   │   ├── mockData.ts
│   │   │   └── types.ts
│   │   ├── AmbientOrb.tsx
│   │   ├── AudioFeatureModule.tsx
│   │   ├── CeoDashboard.tsx
│   │   ├── ConversationalVoiceEngine.tsx
│   │   ├── CrisisHelplineModal.tsx
│   │   ├── DelhiAmbientPlayer.tsx
│   │   ├── DockerStackViewer.tsx
│   │   ├── EnergyPointsBar.tsx
│   │   ├── FloatingRecordButton.tsx
│   │   ├── GenZExpressVent.tsx
│   │   ├── HumanEscalationModal.tsx
│   │   ├── IdentityShieldModal.tsx
│   │   ├── IntelligenceStudio.tsx
│   │   ├── LegalTermsModal.tsx
│   │   ├── ListenerPortal.tsx
│   │   ├── LocalCallHistoryView.tsx
│   │   ├── MukherjeeNagarLanding.tsx
│   │   ├── Navbar.tsx
│   │   ├── PersonaCard.tsx
│   │   ├── PersonaDisplay.tsx
│   │   ├── PersonaGrid.tsx
│   │   ├── PersonaVisuals.tsx
│   │   ├── PostCallDecompressionModal.tsx
│   │   ├── QuickStartBar.tsx
│   │   ├── RawAudioDiagnostic.tsx
│   │   ├── TelemetryMatrixModal.tsx
│   │   ├── TrendingVoiceFeed.tsx
│   │   ├── VibeQuizModal.tsx
│   │   ├── VoiceCallModal.tsx
│   │   ├── VoiceCreditsModal.tsx
│   │   └── VoicePitchModulator.tsx
│   ├── data/
│   │   ├── dockerFiles.ts
│   │   └── personas.ts
│   ├── utils/
│   │   ├── ContextMemoryEngine.ts
│   │   ├── IntelligenceRouter.ts
│   │   ├── TelemetryMatrix.ts
│   │   ├── ambientSynth.ts
│   │   ├── audioStream.ts
│   │   ├── audioSynth.ts
│   │   ├── dailyAllowance.ts
│   │   ├── localCallHistoryDb.ts
│   │   ├── localVault.ts
│   │   ├── personaSprites.ts
│   │   ├── serverSyncQueue.ts
│   │   ├── streamingSTT.ts
│   │   └── voiceSnippetDB.ts
│   ├── App.tsx
│   ├── IntelligenceRouter.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
