/**
 * Custom Web Audio API Mechanical Keyboard Switch Synthesizer
 * Generates crisp, real-time audio clicks without loading external files.
 */
class AudioEngine {
  constructor() {
    this.audioCtx = null;
  }

  // Lazy initialize the audio context to comply with browser Autoplay policies
  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playClick(profile) {
    this.init();
    if (!profile || profile === "off" || !this.audioCtx) return;

    const time = this.audioCtx.currentTime;

    switch (profile) {
      case "blue":
        this.synthesizeCherryBlue(time);
        break;
      case "red":
        this.synthesizeCherryRed(time);
        break;
      case "brown":
        this.synthesizeCherryBrown(time);
        break;
      default:
        break;
    }
  }

  /**
   * Synthesize Cherry MX Blue - High pitch, crisp double-tactile click
   */
  synthesizeCherryBlue(time) {
    // 1. Tactile click spike (High Pitch)
    const clickOsc = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();
    const clickFilter = this.audioCtx.createBiquadFilter();

    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(3200, time);
    clickOsc.frequency.exponentialRampToValueAtTime(1800, time + 0.005);

    clickGain.gain.setValueAtTime(0.08, time);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.006);

    clickFilter.type = "highpass";
    clickFilter.frequency.setValueAtTime(1500, time);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.audioCtx.destination);

    clickOsc.start(time);
    clickOsc.stop(time + 0.01);

    // 2. Bottoming out thump (Low Pitch)
    const thumpOsc = this.audioCtx.createOscillator();
    const thumpGain = this.audioCtx.createGain();

    thumpOsc.type = "sine";
    thumpOsc.frequency.setValueAtTime(180, time);
    thumpOsc.frequency.exponentialRampToValueAtTime(80, time + 0.02);

    thumpGain.gain.setValueAtTime(0.12, time);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.audioCtx.destination);

    thumpOsc.start(time);
    thumpOsc.stop(time + 0.04);
  }

  /**
   * Synthesize Cherry MX Red - Dampened, soft thock
   */
  synthesizeCherryRed(time) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Triangle wave gives a softer, warmer profile suitable for linear switches
    osc.type = "triangle";
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.03);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  /**
   * Synthesize Cherry MX Brown - Tactile, mid-pitch pop
   */
  synthesizeCherryBrown(time) {
    // 1. Soft click contact
    const clickOsc = this.audioCtx.createOscillator();
    const clickGain = this.audioCtx.createGain();

    clickOsc.type = "sine";
    clickOsc.frequency.setValueAtTime(1200, time);
    clickOsc.frequency.exponentialRampToValueAtTime(400, time + 0.008);

    clickGain.gain.setValueAtTime(0.04, time);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.01);

    clickOsc.connect(clickGain);
    clickGain.connect(this.audioCtx.destination);

    clickOsc.start(time);
    clickOsc.stop(time + 0.012);

    // 2. Thump body
    const bodyOsc = this.audioCtx.createOscillator();
    const bodyGain = this.audioCtx.createGain();
    const bodyFilter = this.audioCtx.createBiquadFilter();

    bodyOsc.type = "triangle";
    bodyOsc.frequency.setValueAtTime(220, time);
    bodyOsc.frequency.exponentialRampToValueAtTime(110, time + 0.025);

    bodyGain.gain.setValueAtTime(0.2, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    bodyFilter.type = "lowpass";
    bodyFilter.frequency.setValueAtTime(600, time);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(this.audioCtx.destination);

    bodyOsc.start(time);
    bodyOsc.stop(time + 0.045);
  }
}

export default new AudioEngine();
