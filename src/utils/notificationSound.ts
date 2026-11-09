/**
 * Plays a soft ~6-second chime using the Web Audio API.
 *
 * Three layered sine-wave tones form a gentle major chord (C5, E5, G5)
 * with a slow tremolo. The sound fades in over 0.4s, sustains gently,
 * then fades out over the last 1.5s — producing a pleasant, bell-like
 * ambient tone that is noticeable without being jarring.
 *
 * Volume is kept low (~10% master gain).
 */
export function playNotificationChime(): void {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  let ctx: AudioContext;
  try {
    ctx = new AudioContextClass();
  } catch {
    return;
  }

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const duration = 6;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.10, now + 0.4);
  masterGain.gain.setValueAtTime(0.10, now + duration - 1.5);
  masterGain.gain.linearRampToValueAtTime(0, now + duration);
  masterGain.connect(ctx.destination);

  // Tremolo for a gentle pulsing effect
  const tremolo = ctx.createGain();
  tremolo.gain.setValueAtTime(1, now);
  const lfo = ctx.createOscillator();
  lfo.frequency.setValueAtTime(3.5, now);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.18, now);
  lfo.connect(lfoGain);
  lfoGain.connect(tremolo.gain);
  tremolo.connect(masterGain);
  lfo.start(now);
  lfo.stop(now + duration);

  const tones = [
    { freq: 523.25, gain: 0.6, delay: 0 },      // C5
    { freq: 659.25, gain: 0.45, delay: 0.08 },  // E5
    { freq: 783.99, gain: 0.40, delay: 0.16 },  // G5
  ];

  let lastOsc: OscillatorNode | null = null;

  tones.forEach(({ freq, gain, delay }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now + delay);
    env.gain.linearRampToValueAtTime(gain, now + delay + 0.1);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(env);
    env.connect(tremolo);
    osc.start(now + delay);
    osc.stop(now + duration);
    lastOsc = osc;
  });

  // Soft sub-octave for warmth
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(261.63, now); // C4
  const subEnv = ctx.createGain();
  subEnv.gain.setValueAtTime(0, now);
  subEnv.gain.linearRampToValueAtTime(0.25, now + 0.2);
  subEnv.gain.exponentialRampToValueAtTime(0.001, now + duration);
  subOsc.connect(subEnv);
  subEnv.connect(tremolo);
  subOsc.start(now);
  subOsc.stop(now + duration);

  // Auto-close the audio context after the sound finishes
  if (lastOsc) {
    lastOsc.onended = () => {
      ctx.close().catch(() => {});
    };
  }
}
