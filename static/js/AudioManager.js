/**
 * AudioManager.js
 * Handles ambient soundscapes, procedural Web Audio chimes, and the birthday song.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmAudio = null;
    this.isBgmPlaying = false;
    this.hasUserInteracted = false;
    this.songSrc = 'static/audio/birthday_song.mp3';

    this.initAudioElements();
  }

  initAudioElements() {
    if (window.PRELOADED_AUDIO_URI && window.PRELOADED_AUDIO_URI.length > 50) {
      this.songSrc = window.PRELOADED_AUDIO_URI;
    }
    this.bgmAudio = new Audio();
    this.bgmAudio.src = this.songSrc;
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.75;
    this.bgmAudio.preload = 'auto';

    // Catch errors gracefully if audio is missing or format unsupported
    this.bgmAudio.addEventListener('error', (e) => {
      console.warn("AudioManager: Could not load birthday song audio:", e);
    });
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.hasUserInteracted = true;
  }

  playBgm() {
    this.ensureContext();
    if (!this.bgmAudio) return;

    if (this.isMuted) return;

    this.bgmAudio.play().then(() => {
      this.isBgmPlaying = true;
      this.updateHudButton(true);
    }).catch(err => {
      console.log("Audio autoplay prevented, awaiting user gesture:", err);
    });
  }

  pauseBgm() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
      this.updateHudButton(false);
    }
  }

  toggleBgm() {
    this.ensureContext();
    if (this.isBgmPlaying) {
      this.pauseBgm();
    } else {
      this.playBgm();
    }
  }

  updateHudButton(isPlaying) {
    const btn = document.getElementById('music-toggle-btn');
    if (btn) {
      btn.innerHTML = isPlaying 
        ? '<span>🎵</span> <span>Music Playing</span>' 
        : '<span>🔇</span> <span>Play Music</span>';
      if (isPlaying) {
        btn.classList.add('playing');
      } else {
        btn.classList.remove('playing');
      }
    }
  }

  /**
   * Procedural chime / sparkle sound effect using Web Audio API
   */
  playChime(pitchModifier = 1.0) {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 523.25 * pitchModifier; // C5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural celebratory magical harp arpeggio
   */
  playMagicHarp() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C, E, G, C, E, G
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.9);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.9);
        }, idx * 90);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural gentle deep bass swell for portals and doors
   */
  playDeepResonance() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural magical key unlocking sound (mechanical tumbler clicks + crystal shimmer)
   */
  playKeyUnlockSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;

      // 1. Two crisp mechanical tumbler clicks
      [0, 0.08].forEach(offset => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now + offset);
        osc.frequency.exponentialRampToValueAtTime(320, now + offset + 0.05);

        gain.gain.setValueAtTime(0.22, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });

      // 2. Harmonic crystalline unlock shimmer
      [587.33, 880.0, 1174.66, 1760.0].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.12 + i * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.9);

        gain.gain.setValueAtTime(0.12, now + 0.12 + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.12 + i * 0.04);
        osc.stop(now + 1.2);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural celestial portal appearance sound (warm resonant swell + sparkling sweep)
   */
  playPortalOpenSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;

      // Warm E-G-B celestial chord swell
      [164.81, 246.94, 329.63, 493.88].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.16, now + 0.8 + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 3.2);
      });

      // Shimmering upward chime cascade
      const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (!this.ctx || this.isMuted) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.1);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 1.1);
        }, 300 + i * 140);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural crystal wind chime when a gift begins descending
   */
  playGiftChime(index = 0) {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const scale = [587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
      const baseFreq = scale[index % scale.length];
      const now = this.ctx.currentTime;

      // Dual oscillator for rich bell overtone
      [baseFreq, baseFreq * 2.76].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const vol = (i === 0) ? 0.12 : 0.05;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.1);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural gentle cushioned thud with sparkling harmonic tail on gift landing
   */
  playGiftLanding() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;

      // Soft cushioned bass contact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // Delicate high sparkle tap
      const sOsc = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      sOsc.type = 'triangle';
      sOsc.frequency.setValueAtTime(2093.0, now + 0.02); // C7
      sGain.gain.setValueAtTime(0.09, now + 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      sOsc.connect(sGain);
      sGain.connect(this.ctx.destination);
      sOsc.start(now + 0.02);
      sOsc.stop(now + 0.5);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural magical flutter & harp glissando when touching a butterfly
   */
  playButterflyTouchSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Rapid upward pentatonic crystal sparkle
      const notes = [659.25, 880.0, 987.77, 1318.51, 1760.0, 2093.0];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.7);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural smooth box lid opening whoosh + harmonic chime
   */
  playBoxOpenSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;

      // Soft air whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);

      // Resonant chime chord (Major 7th)
      [523.25, 659.25, 783.99, 987.77].forEach((f, i) => {
        const cOsc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(f, now + 0.15);

        cGain.gain.setValueAtTime(0.09, now + 0.15);
        cGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        cOsc.connect(cGain);
        cGain.connect(this.ctx.destination);
        cOsc.start(now + 0.15);
        cOsc.stop(now + 1.4);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural mysterious golden rune clue chime
   */
  playClueRevealSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      [440.0, 554.37, 659.25, 830.61].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(0.14, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + 1.6);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural grand celestial royal kingdom unlock fanfare
   */
  playKingdomUnlockSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Majestic chord progression: C -> F -> G -> C high
      const fanfare = [
        { t: 0.0, notes: [523.25, 659.25, 783.99] },
        { t: 0.35, notes: [587.33, 698.46, 880.0] },
        { t: 0.70, notes: [659.25, 783.99, 987.77] },
        { t: 1.10, notes: [1046.5, 1318.5, 1567.98] }
      ];

      fanfare.forEach(step => {
        step.notes.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + step.t);

          gain.gain.setValueAtTime(0.12, now + step.t);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + step.t + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + step.t);
          osc.stop(now + step.t + 1.2);
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural soft gentle error chime for incorrect password
   */
  playIncorrectPasswordSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Two gentle soft descending sines
      [440, 370].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0.12, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.35);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural cosmic portal fly-through whoosh & swirling vortex sound
   */
  playPortalWhooshSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      // 1. Resonant swirling wind filter
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 1.5);
      osc.frequency.exponentialRampToValueAtTime(220, now + 3.0);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.2);

      // 2. Sparkling crystalline light rings
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const sOsc = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        sOsc.type = 'sine';
        sOsc.frequency.setValueAtTime(freq, now + idx * 0.25);
        sGain.gain.setValueAtTime(0.08, now + idx * 0.25);
        sGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 0.8);
        sOsc.connect(sGain);
        sGain.connect(this.ctx.destination);
        sOsc.start(now + idx * 0.25);
        sOsc.stop(now + idx * 0.25 + 0.8);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Procedural friendly greeting chime when Queen Panda waves
   */
  playPandaGreetingSound() {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Sweet 3-note cheerful arpeggio (F5 -> A5 -> C6)
      [698.46, 880.0, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.75);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.75);
      });
    } catch (e) {
      console.error(e);
    }
  }
}

window.audioManager = new AudioManager();
