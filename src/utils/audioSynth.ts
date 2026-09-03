// Web Audio API Soothing Ambient Hold Tone & Rain Frequency Generator
export type SoundscapeType = 'none' | 'monsoon_rain' | 'binaural_432' | 'gurudwara_tanpura' | 'night_dhabha';

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;

  // Soundscape mixer nodes
  private soundscapeGain: GainNode | null = null;
  private soundscapeOsc: OscillatorNode | null = null;
  private soundscapeNoise: AudioBufferSourceNode | null = null;
  private activeSoundscape: SoundscapeType = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set & Mix Ambient Background Soundscape
  public setSoundscape(type: SoundscapeType, volume: number = 0.15) {
    try {
      this.initContext();
      if (!this.ctx) return;

      // Stop existing soundscape if any
      this.stopSoundscape();

      if (type === 'none' || volume <= 0) {
        this.activeSoundscape = 'none';
        return;
      }

      this.soundscapeGain = this.ctx.createGain();
      this.soundscapeGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.soundscapeGain.gain.exponentialRampToValueAtTime(Math.min(0.3, volume), this.ctx.currentTime + 1.5);
      this.soundscapeGain.connect(this.ctx.destination);

      if (type === 'binaural_432') {
        this.soundscapeOsc = this.ctx.createOscillator();
        this.soundscapeOsc.type = 'sine';
        this.soundscapeOsc.frequency.setValueAtTime(432, this.ctx.currentTime);
        this.soundscapeOsc.connect(this.soundscapeGain);
        this.soundscapeOsc.start();
      } else if (type === 'gurudwara_tanpura') {
        this.soundscapeOsc = this.ctx.createOscillator();
        this.soundscapeOsc.type = 'triangle';
        this.soundscapeOsc.frequency.setValueAtTime(136.1, this.ctx.currentTime); // Om/Cosmic frequency
        this.soundscapeOsc.connect(this.soundscapeGain);
        this.soundscapeOsc.start();
      } else {
        // Rain / night textures
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.96 * b1 + white * 0.12;
          b2 = 0.85 * b2 + white * 0.25;
          output[i] = (b0 + b1 + b2) * 0.04;
        }
        this.soundscapeNoise = this.ctx.createBufferSource();
        this.soundscapeNoise.buffer = noiseBuffer;
        this.soundscapeNoise.loop = true;
        this.soundscapeNoise.connect(this.soundscapeGain);
        this.soundscapeNoise.start();
      }

      this.activeSoundscape = type;
    } catch (e) {
      console.warn('Soundscape generator issue:', e);
    }
  }

  public setSoundscapeVolume(volume: number) {
    if (this.soundscapeGain && this.ctx) {
      this.soundscapeGain.gain.setValueAtTime(Math.min(0.4, Math.max(0, volume)), this.ctx.currentTime);
    }
  }

  public stopSoundscape() {
    try {
      if (this.soundscapeGain && this.ctx) {
        this.soundscapeGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }
      this.soundscapeOsc?.stop();
      this.soundscapeNoise?.stop();
      this.soundscapeOsc?.disconnect();
      this.soundscapeNoise?.disconnect();
      this.soundscapeGain?.disconnect();
      this.activeSoundscape = 'none';
    } catch (_) {}
  }

  // Play a soft soothing hold drone (432Hz harmonic soothing chord)
  public startSoothingHoldTone() {
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.isPlaying) return;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 2);
      this.gainNode.connect(this.ctx.destination);

      // 432Hz root note
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(432, this.ctx.currentTime);
      this.osc1.connect(this.gainNode);
      this.osc1.start();

      // 216Hz grounding sub-harmonic
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(216, this.ctx.currentTime);
      this.osc2.connect(this.gainNode);
      this.osc2.start();

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio synthesis not available or blocked', e);
    }
  }

  public stopSoothingHoldTone() {
    try {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.noiseNode?.stop();
          this.osc1?.disconnect();
          this.osc2?.disconnect();
          this.noiseNode?.disconnect();
          this.gainNode?.disconnect();
          this.isPlaying = false;
        } catch (_) {}
      }, 600);
    } catch (_) {
      this.isPlaying = false;
    }
  }

  public unlockAudioContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playConnectedChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      chimeGain.connect(this.ctx.destination);

      const chimeOsc = this.ctx.createOscillator();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(528, this.ctx.currentTime); // 528Hz Solfeggio Transformation Tone
      chimeOsc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.4);
      chimeOsc.connect(chimeGain);
      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 1.2);
    } catch (_) {}
  }

  public playMicToggleChime(active: boolean) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      gain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const startFreq = active ? 440 : 660;
      const endFreq = active ? 660 : 330;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (_) {}
  }

  public playEndCallTone() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      gain.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.45);
      osc.connect(gain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (_) {}
  }
}

export const audioSynth = new AudioSynthesizer();
