import { MockVoice, MockFeatureCard, LanguageOption } from './types';

export const MOCK_LANGUAGES: LanguageOption[] = [
  { id: 'en', name: 'English', nativeName: 'English', code: 'en-US' },
  { id: 'multi', name: 'Multilingual', nativeName: 'Global AI', code: 'multi-v2' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', code: 'es-ES' },
  { id: 'fr', name: 'French', nativeName: 'Français', code: 'fr-FR' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', code: 'de-DE' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語', code: 'ja-JP' },
];

export const MOCK_VOICES: MockVoice[] = [
  {
    id: 1,
    name: 'Marcus',
    type: 'Narration',
    gender: 'male',
    accent: 'Deep & Authoritative',
    description: 'Rich baritone suitable for audiobooks, documentaries, and executive presentations.',
    pitch: 0.9,
    rate: 1.0,
  },
  {
    id: 2,
    name: 'Aria',
    type: 'Conversational',
    gender: 'female',
    accent: 'Warm & Empathetic',
    description: 'Natural inflection with dynamic pauses, ideal for virtual assistants and customer support.',
    pitch: 1.05,
    rate: 1.05,
  },
  {
    id: 3,
    name: 'Kabir',
    type: 'Conversational',
    gender: 'male',
    accent: 'Hinglish Urban',
    description: 'Bilingual nuance with localized pacing tailored for peer conversations and venting hotlines.',
    pitch: 1.0,
    rate: 1.0,
  },
  {
    id: 4,
    name: 'Elena',
    type: 'Expressive',
    gender: 'female',
    accent: 'Melodic & Inspiring',
    description: 'Vibrant emotional range for creative storytelling, meditation, and podcast host roles.',
    pitch: 1.1,
    rate: 0.95,
  },
];

export const MOCK_CREATION_FEATURES: MockFeatureCard[] = [
  {
    id: 'feat-tts',
    title: 'Text-to-Speech',
    description: 'Generate hyper-realistic speech in 32+ languages with granular pitch, stability, and speed controls.',
    category: 'creation',
    tag: 'Ultra-Low Latency',
    iconName: 'waveform',
  },
  {
    id: 'feat-clone',
    title: 'Instant Voice Cloning',
    description: 'Clone any speaker from a 15-second clean audio sample with precise emotional inflection matching.',
    category: 'creation',
    tag: 'Zero-Shot Latent',
    iconName: 'copy',
  },
  {
    id: 'feat-sfx',
    title: 'Sound Effects & Ambience',
    description: 'Create procedural ambient backgrounds, Foley effects, and acoustic soundscapes from natural text prompts.',
    category: 'creation',
    tag: 'Generative Audio',
    iconName: 'sparkles',
  },
  {
    id: 'feat-isolator',
    title: 'Voice Isolator & Denoising',
    description: 'Strip background traffic, reverb, and microphone hum to produce crystal-clear studio acoustic isolation.',
    category: 'creation',
    tag: 'Acoustic DSP',
    iconName: 'sliders',
  },
];

export const MOCK_AGENT_TELEMETRY = {
  resolutionRate: '98.4%',
  averageLatencyMs: '280ms',
  concurrentCalls: '1,420',
  satisfactionScore: '4.95 / 5.0',
  sampleTranscript: [
    { sender: 'user', text: 'Hey, I need to check my current account status and verify if my last payment cleared.' },
    { sender: 'agent', text: 'Certainly! I verified your transaction ID #TK-9021. It completed 4 minutes ago with zero errors.', sentiment: 'positive' },
    { sender: 'user', text: 'Awesome, thanks for the fast update!' },
    { sender: 'agent', text: 'You’re very welcome! Have a productive afternoon ahead.', sentiment: 'reassuring' },
  ],
};

export const MOCK_API_SNIPPETS: Record<string, string> = {
  javascript: `// Initialize Voice AI Client
import { VoiceAI } from '@voice-ai/sdk';

const client = new VoiceAI({
  apiKey: process.env.VOICE_AI_API_KEY,
});

// Stream synthesized speech in sub-300ms chunks
async function generateSpeechStream() {
  const audioStream = await client.textToSpeech.stream({
    voiceId: "marcus_narration_v2",
    text: "Voice AI brings human nuance, dynamic cadence, and realistic emotion to every interactive agent.",
    model: "sonic-multilingual-preview",
    voiceSettings: {
      stability: 0.75,
      similarityBoost: 0.88,
      speed: 1.0
    }
  });

  audioStream.pipe(process.stdout);
}

generateSpeechStream();`,

  curl: `curl -X POST "https://api.voiceai.internal/v1/audio/speech" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "sonic-multilingual-preview",
    "voice_id": "marcus_narration_v2",
    "input": "Voice AI brings human nuance, dynamic cadence, and realistic emotion to every interactive agent.",
    "response_format": "mp3",
    "speed": 1.0
  }' \\
  --output synthesized_voice.mp3`,

  python: `from voice_ai import VoiceAI

client = VoiceAI(api_key="YOUR_API_KEY")

# Generate low-latency speech stream
audio = client.generate(
    text="Voice AI brings human nuance, dynamic cadence, and realistic emotion to every interactive agent.",
    voice="Aria (Conversational)",
    model="sonic-multilingual-preview"
)

with open("speech.mp3", "wb") as f:
    f.write(audio)`,
};
