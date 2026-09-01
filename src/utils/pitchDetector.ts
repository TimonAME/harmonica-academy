/**
 * Autocorrelation algorithm for pitch detection
 * Adapted for standard vocal and instrument ranges (especially harmonica notes ~150Hz - ~2200Hz)
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  let rms = 0;

  // Calculate Root Mean Square (RMS) to determine volume
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // If signal is too quiet, do not attempt pitch detection
  if (rms < 0.008) {
    return -1;
  }

  // Find range of interest (zero-crossing clipping)
  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = SIZE - 1; i >= SIZE / 2; i--) {
    if (Math.abs(buffer[i]) < thres) {
      r2 = i;
      break;
    }
  }

  const trimmedBuffer = buffer.subarray(r1, r2);
  const len = trimmedBuffer.length;

  // Calculate autocorrelation values
  const correlations = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i; j++) {
      correlations[i] += trimmedBuffer[j] * trimmedBuffer[j + i];
    }
  }

  // Find the first zero-crossing peak to skip self-correlation at offset 0
  let d = 0;
  while (d < len - 1 && correlations[d] > correlations[d + 1]) {
    d++;
  }

  // Find the absolute highest peak after the zero-crossing
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < len; i++) {
    if (correlations[i] > maxval) {
      maxval = correlations[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // Validate the peak
  if (T0 < 0 || T0 >= len) return -1;

  // Parabolic interpolation for sub-sample accuracy
  const x1 = correlations[T0 - 1] || 0;
  const x2 = correlations[T0];
  const x3 = correlations[T0 + 1] || 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a !== 0) {
    T0 = T0 - b / (2 * a);
  }

  const detectedFrequency = sampleRate / T0;

  // Guard against octave errors or out-of-bounds harmonica range
  if (detectedFrequency > 150 && detectedFrequency < 3000) {
    return detectedFrequency;
  }

  return -1;
}

/**
 * Custom React Hook interface or direct audio manager to capture microphone
 */
export class PitchDetectionSession {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array = new Float32Array(0);
  private rafId: number | null = null;
  private onPitchDetected: (frequency: number) => void;

  constructor(onPitchDetected: (frequency: number) => void) {
    this.onPitchDetected = onPitchDetected;
  }

  async start(): Promise<boolean> {
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      
      this.source.connect(this.analyser);
      this.buffer = new Float32Array(this.analyser.frequencyBinCount);

      this.tick();
      return true;
    } catch (err) {
      console.error("Failed to start microphone:", err);
      return false;
    }
  }

  private tick = () => {
    if (!this.analyser || !this.audioCtx) return;

    this.analyser.getFloatTimeDomainData(this.buffer);
    const frequency = autoCorrelate(this.buffer, this.audioCtx.sampleRate);
    
    this.onPitchDetected(frequency);
    this.rafId = requestAnimationFrame(this.tick);
  };

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
