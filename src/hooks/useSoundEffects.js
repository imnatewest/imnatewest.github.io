import { useCallback, useRef } from 'react';

export const useSoundEffects = () => {
  const audioCtxRef = useRef(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // A soft, low-frequency synthetic mechanical click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Ignore if user hasn't interacted with page yet
    }
  }, []);

  const playStartupChime = useCallback(() => {
    try {
      const ctx = getCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        // Drop the chime if the browser is blocking autoplay. 
        // This prevents the chime from queueing up and playing 5 seconds late when the user finally clicks the desktop.
        return;
      }
      
      const playFreq = (freq, delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 2.0);
      };

      // F major 9 arpeggio for that nostalgic retro chord
      playFreq(349.23, 0.0); // F4
      playFreq(440.00, 0.1); // A4
      playFreq(523.25, 0.2); // C5
      playFreq(659.25, 0.3); // E5
      playFreq(783.99, 0.4); // G5 
    } catch(e) {
      // Ignore
    }
  }, []);

  return { playClick, playStartupChime };
};
