let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    (window as any).__harmonica_audio_ctx = audioCtx;
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export interface PlaybackNode {
  stop: () => void;
}

/**
 * Plays a rich harmonica-like tone at the specified frequency.
 * Uses a combination of a fundamental triangle wave and secondary square/sine waves
 * to simulate the reedy, bright harmonic profile of a harmonica, plus a subtle vibrato.
 */
export function playHarmonicaTone(
  frequency: number,
  durationSeconds: number,
  volume: number = 0.3,
  startTime?: number
): PlaybackNode {
  const ctx = getAudioContext();
  const now = startTime !== undefined && startTime >= ctx.currentTime ? startTime : ctx.currentTime;

  // Master Gain node for envelope
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  
  // Attack (soft blow start)
  masterGain.gain.linearRampToValueAtTime(volume, now + 0.05);
  // Sustain
  masterGain.gain.setValueAtTime(volume, now + durationSeconds - 0.08);
  // Release
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

  // Fundamental Oscillator (Triangle)
  const osc1 = ctx.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(frequency, now);

  // 2nd Harmonic (Sine, adds warmth)
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(frequency * 2, now);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(volume * 0.4, now);

  // 3rd Harmonic (Square, adds reedy nasal buzz)
  const osc3 = ctx.createOscillator();
  osc3.type = "sine"; // Use sine but high gain for safety, or soft triangle
  osc3.frequency.setValueAtTime(frequency * 3, now);
  const gain3 = ctx.createGain();
  gain3.gain.setValueAtTime(volume * 0.25, now);

  // Vibrato (LFO) to simulate breath vibrato
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(6, now); // 6 Hz vibrato
  lfoGain.gain.setValueAtTime(frequency * 0.015, now); // Vibrato depth

  // Connect Vibrato to Fundamental
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfoGain.connect(osc2.frequency);

  // Connections
  osc1.connect(masterGain);
  
  osc2.connect(gain2);
  gain2.connect(masterGain);

  osc3.connect(gain3);
  gain3.connect(masterGain);

  masterGain.connect(ctx.destination);

  // Start oscillators
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  lfo.start(now);

  // Stop oscillators
  const stopTime = now + durationSeconds;
  osc1.stop(stopTime);
  osc2.stop(stopTime);
  osc3.stop(stopTime);
  lfo.stop(stopTime);

  return {
    stop: () => {
      try {
        const stopNow = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(stopNow);
        masterGain.gain.setValueAtTime(masterGain.gain.value, stopNow);
        masterGain.gain.exponentialRampToValueAtTime(0.001, stopNow + 0.05);
        setTimeout(() => {
          try {
            osc1.stop();
          } catch (e) {}
          try {
            osc2.stop();
          } catch (e) {}
          try {
            osc3.stop();
          } catch (e) {}
          try {
            lfo.stop();
          } catch (e) {}
        }, 60);
      } catch (e) {
        // Already stopped or context closed
      }
    },
  };
}

/**
 * Play a quick success / notification chime
 */
export function playChimeSuccess(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
  osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
}

/**
 * Play a soft warning / click tone
 */
export function playTapClick(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1000, now);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Play a high-quality metronome click
 */
export function playMetronomeTick(isDownbeat: boolean = false, startTime?: number): void {
  try {
    const ctx = getAudioContext();
    const now = startTime !== undefined && startTime >= ctx.currentTime ? startTime : ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, now);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    console.error("Failed to play metronome tick:", err);
  }
}

