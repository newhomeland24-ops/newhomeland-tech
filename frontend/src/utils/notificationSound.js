// Web Audio API Synthesizer for Lead Notification Chime
// Generates a clean, pleasant multi-tone chime without external audio assets

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a pleasant luxury chime alert for incoming leads.
 * @param {string} type - 'enquiry' | 'appointment' | 'test'
 */
export function playLeadNotificationChime(type = 'enquiry') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Frequencies for a bright, professional melodic chord
    // Enquiry: E5 (659.25Hz) -> G#5 (830.61Hz) -> B5 (987.77Hz)
    // Appointment: D5 (587.33Hz) -> F#5 (739.99Hz) -> A5 (880Hz)
    const tones = type === 'appointment' 
      ? [587.33, 739.99, 880.00]
      : [659.25, 830.61, 987.77];

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);

      // Volume envelope: quick attack and smooth exponential decay
      const startTime = now + idx * 0.11;
      const duration = 0.55;

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.warn('Audio chime playback was restricted or failed:', err);
  }
}
