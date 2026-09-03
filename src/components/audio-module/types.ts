export interface MockVoice {
  id: string | number;
  name: string;
  type: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  description: string;
  sampleAudio?: string;
  pitch?: number;
  rate?: number;
}

export interface MockFeatureCard {
  id: string;
  title: string;
  description: string;
  category: 'creation' | 'agent' | 'api';
  tag: string;
  iconName: 'mic' | 'copy' | 'sparkles' | 'sliders' | 'cpu' | 'waveform' | 'bot' | 'code' | 'shield';
  metrics?: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  code: string;
}
