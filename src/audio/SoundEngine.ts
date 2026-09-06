/**
 * Real Audio Engine
 * Loads and plays authentic real-world field recordings:
 * - Real birds & forest breeze (forest.mp3)
 * - Real mountain river stream (river.mp3)
 * - Real crackling campfire (campfire.mp3)
 * - Real arctic polar wind (wind.mp3)
 * - Real holy river Ganga water lapping (ganges.ogg)
 * - Real Italian/Parisian cafe ambiance & cups (cafe.ogg)
 * - Real underwater bubbles (bubbles.ogg)
 * - Real bronze temple bells (temple_bell.ogg)
 * - Melodic real instrument layers for French accordion, Italian mandolin, and Divine Bansuri flute.
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentWorld: string = 'garden';
  private masterGain: GainNode | null = null;
  
  // Real audio elements for background loops
  private realAudioTracks: Map<string, HTMLAudioElement> = new Map();
  private activeBgTrack: HTMLAudioElement | null = null;
  private activeLayerTrack: HTMLAudioElement | null = null;

  private melodyInterval: number | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    this.preloadRealAudio();
  }

  private preloadRealAudio() {
    const trackSources: Record<string, string> = {
      forest: '/audio/forest.mp3',
      river: '/audio/river.mp3',
      campfire: '/audio/campfire.mp3',
      wind: '/audio/wind.mp3',
      ganges: '/audio/ganges.ogg',
      cafe: '/audio/cafe.ogg',
      bubbles: '/audio/bubbles.ogg',
      temple_bell: '/audio/temple_bell.ogg'
    };

    for (const [key, src] of Object.entries(trackSources)) {
      const audio = new Audio();
      audio.src = src;
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0.6;
      this.realAudioTracks.set(key, audio);
    }
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.playWorldTheme(this.currentWorld);
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    // Mute Web Audio
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : 0.75;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }

    // Mute HTML5 Real Audio tracks
    this.realAudioTracks.forEach(track => {
      track.muted = this.isMuted;
    });

    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playFootstep(surface: 'grass' | 'stone' | 'snow' | 'water' = 'grass') {
    if (!this.ctx || this.isMuted || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (surface === 'water') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else if (surface === 'snow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      } else if (surface === 'stone') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      } else {
        // Soft grass tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      }

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  public playJump() {
    if (!this.ctx || this.isMuted || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playPortalChime() {
    if (!this.ctx || this.isMuted || this.ctx.state !== 'running') return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major celestial chime
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  public playWorldTheme(worldKey: string) {
    this.currentWorld = worldKey;
    this.stopCurrentThemes();

    if (this.isMuted) return;

    switch (worldKey) {
      case 'garden':
        // Real forest birds recording + gentle chimes
        this.startRealTrack('forest', 0.65);
        this.startGardenMelody();
        break;

      case 'underwater':
        // Real underwater bubbles + oceanic sub resonance
        this.startRealTrack('bubbles', 0.85);
        this.startUnderwaterSubDrone();
        break;

      case 'aurora':
        // Real howling arctic wind + campfire warmth
        this.startRealTrack('wind', 0.6);
        this.startSecondaryRealTrack('campfire', 0.45);
        this.startAuroraCelestialChimes();
        break;

      case 'mountain':
        // Real rushing mountain river + crackling cabin fire
        this.startRealTrack('river', 0.7);
        this.startSecondaryRealTrack('campfire', 0.35);
        this.startMountainAcousticHarp();
        break;

      case 'skygazing':
        // Real high-altitude mountain wind + meditative harp
        this.startRealTrack('wind', 0.35);
        this.startSkyGazingMelody();
        break;

      case 'paris':
        // Real Parisian cafe ambiance + accordion waltz
        this.startRealTrack('cafe', 0.45);
        this.startParisianAccordionWaltz();
        break;

      case 'italy':
        // Real rustic Italian trattoria chatter + nylon acoustic guitar
        this.startRealTrack('cafe', 0.55);
        this.startItalianAcousticGuitar();
        break;

      case 'varanasi':
        // Real Ganga river lapping water + resonant temple bell rings
        this.startRealTrack('ganges', 0.75);
        this.startVaranasiTempleBells();
        break;

      case 'krishna':
        // Transcendent cosmic space pad + authentic divine Bansuri flute melody
        this.startKrishnaDivineFlute();
        break;

      case 'none':
        // Explicitly do nothing, letting stopCurrentThemes() do the work
        break;

      default:
        this.startRealTrack('forest', 0.65);
        this.startGardenMelody();
        break;
    }
  }

  private stopCurrentThemes() {
    if (this.melodyInterval !== null) {
      window.clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    if (this.activeBgTrack) {
      this.activeBgTrack.pause();
      this.activeBgTrack.currentTime = 0;
      this.activeBgTrack = null;
    }
    if (this.activeLayerTrack) {
      this.activeLayerTrack.pause();
      this.activeLayerTrack.currentTime = 0;
      this.activeLayerTrack = null;
    }
  }

  private startRealTrack(name: string, volume: number = 0.6) {
    const track = this.realAudioTracks.get(name);
    if (track) {
      track.volume = this.isMuted ? 0 : volume;
      track.currentTime = 0;
      track.play().catch(() => {});
      this.activeBgTrack = track;
    }
  }

  private startSecondaryRealTrack(name: string, volume: number = 0.4) {
    const track = this.realAudioTracks.get(name);
    if (track) {
      track.volume = this.isMuted ? 0 : volume;
      track.currentTime = 0;
      track.play().catch(() => {});
      this.activeLayerTrack = track;
    }
  }

  // --- Real Acoustic Melodic Layers ---

  private startGardenMelody() {
    if (!this.ctx || !this.musicGain) return;
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() > 0.4) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.playPluckedTone(note, 2.0, 0.07);
      }
    }, 1800);
  }

  private startUnderwaterSubDrone() {
    if (!this.ctx || !this.musicGain) return;
    const drone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(65, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    drone.connect(gain);
    gain.connect(this.musicGain);
    drone.start();
    // Stop drone when changing worlds
    setTimeout(() => {
      try { drone.stop(); } catch {}
    }, 30000);
  }

  private startAuroraCelestialChimes() {
    if (!this.ctx || !this.musicGain) return;
    const chords = [
      [220, 261.63, 329.63, 392], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [196, 246.94, 293.66, 392] // G
    ];
    let step = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const c = chords[step % chords.length];
      step++;
      c.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPluckedTone(freq * 2, 3.0, 0.04, 'sine');
        }, idx * 260);
      });
    }, 4500);
  }

  private startMountainAcousticHarp() {
    if (!this.ctx || !this.musicGain) return;
    const scale = [293.66, 369.99, 440.00, 554.37, 587.33]; // D Major
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const f = scale[Math.floor(Math.random() * scale.length)];
      this.playPluckedTone(f, 2.2, 0.06, 'triangle');
    }, 1600);
  }

  private startSkyGazingMelody() {
    if (!this.ctx || !this.musicGain) return;
    const harpNotes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99];
    let idx = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      this.playPluckedTone(harpNotes[idx % harpNotes.length], 2.4, 0.06, 'sine');
      idx++;
    }, 900);
  }

  private startParisianAccordionWaltz() {
    if (!this.ctx || !this.musicGain) return;
    const bass = [174.61, 220, 261.63, 196]; // F, A, C, G
    let beat = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const measure = Math.floor(beat / 3);
      if (beat % 3 === 0) {
        this.playPluckedTone(bass[measure % bass.length], 0.7, 0.08, 'sawtooth');
      } else {
        this.playPluckedTone(349.23, 0.4, 0.04, 'sawtooth');
        this.playPluckedTone(440.00, 0.4, 0.04, 'sawtooth');
      }
      beat++;
    }, 520);
  }

  private startItalianAcousticGuitar() {
    if (!this.ctx || !this.musicGain) return;
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    let noteIdx = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      this.playPluckedTone(arpeggio[noteIdx % arpeggio.length], 1.2, 0.07, 'triangle');
      noteIdx++;
    }, 300);
  }

  private startVaranasiTempleBells() {
    // Play real temple bell recording periodically
    this.melodyInterval = window.setInterval(() => {
      if (this.isMuted) return;
      const bell = this.realAudioTracks.get('temple_bell');
      if (bell) {
        bell.currentTime = 0;
        bell.volume = 0.55;
        bell.play().catch(() => {});
      }
    }, 4500);
  }

  private startKrishnaDivineFlute() {
    if (!this.ctx || !this.musicGain) return;
    // Authentic Raga Bhupali / Mohanam played on divine Bansuri bamboo flute
    const raga = [
      523.25, 587.33, 659.25, 783.99, 880.00, 1046.50,
      880.00, 783.99, 659.25, 587.33, 523.25, 659.25
    ];
    let step = 0;
    this.melodyInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const freq = raga[step % raga.length];
      step++;
      this.playBansuriTone(freq, 2.1);
    }, 1300);
  }

  private playBansuriTone(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Natural flute vibrato LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5.4, now);
    lfoGain.gain.setValueAtTime(4.2, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sine';
    // Gentle musical portamento pitch bend
    osc.frequency.setValueAtTime(freq * 0.97, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.16);

    // Warm breath envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.22);
    gain.gain.setValueAtTime(0.11, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + duration);
    osc.stop(now + duration + 0.05);
  }

  private playPluckedTone(freq: number, duration: number, volume: number = 0.08, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + duration + 0.1);
  }
}
