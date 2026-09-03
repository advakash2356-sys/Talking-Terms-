/**
 * Web Audio Synthesizer for Authentic Delhi Ambient Soundscapes & Lo-Fi
 * Generates continuous soothing procedural audio without external network assets.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: string | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach((node) => {
        if (typeof node === 'number') {
          clearInterval(node);
        } else {
          try {
            (node as any).stop?.();
            node.disconnect();
          } catch {}
        }
      });
      this.activeNodes = [];
    }
    this.currentTrack = null;
  }

  public play(trackId: 'chai_rain' | 'metro_lofi' | 'theta_432' | 'late_night_cp') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.currentTrack === trackId) {
      this.stop();
      return;
    }

    this.stop();
    this.currentTrack = trackId;

    if (trackId === 'chai_rain') {
      this.generateRainChai();
    } else if (trackId === 'metro_lofi') {
      this.generateMetroLofi();
    } else if (trackId === 'theta_432') {
      this.generateTheta432();
    } else if (trackId === 'late_night_cp') {
      this.generateLateNightAmbience();
    }
  }

  public getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  // Pink noise + gentle filter for rain on tin roof (Chai tapri)
  private generateRainChai() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, rainGain);
  }

  // 432Hz pure grounding tone with gentle binaural 6Hz theta pulse
  private generateTheta432() {
    if (!this.ctx || !this.masterGain) return;

    // Carrier 432Hz
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(432, this.ctx.currentTime);

    // Left Binaural Beat 438Hz (6Hz Theta)
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(438, this.ctx.currentTime);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);

    oscLeft.connect(gainNode);
    oscRight.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight, gainNode);
  }

  // Metro yellow line gentle hum & distant lo-fi chords
  private generateMetroLofi() {
    if (!this.ctx || !this.masterGain) return;

    // Deep sub hum
    const drone = this.ctx.createOscillator();
    drone.type = 'triangle';
    drone.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone.start();
    this.activeNodes.push(drone, droneFilter, droneGain);

    // Lo-fi chord sequence generator (Cmaj7 -> Am7 progression)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G7
    ];

    let chordIdx = 0;
    const intervalId = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        g.gain.setValueAtTime(0.001, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.8);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.0);
      });
    }, 3200);

    this.activeNodes.push(intervalId as any);
  }

  // Late night CP breeze + warm rhodes chime
  private generateLateNightAmbience() {
    if (!this.ctx || !this.masterGain) return;

    const baseOsc = this.ctx.createOscillator();
    baseOsc.type = 'sine';
    baseOsc.frequency.setValueAtTime(174, this.ctx.currentTime); // Solfeggio 174Hz pain reliever

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(15, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(baseOsc.frequency);

    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    baseOsc.connect(mainGain);
    mainGain.connect(this.masterGain);

    baseOsc.start();
    lfo.start();
    this.activeNodes.push(baseOsc, lfo, lfoGain, mainGain);
  }
}

export const ambientSoundEngine = new AmbientSoundEngine();
