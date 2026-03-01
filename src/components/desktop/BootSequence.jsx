import React, { useState, useEffect } from 'react';

const BootSequence = ({ onComplete, onFadeStart }) => {
  const [phase, setPhase] = useState('black'); // 'black' → 'logo' → 'fade'

  useEffect(() => {
    if (sessionStorage.getItem('nateos-booted')) {
      onComplete();
      return;
    }

    // Brief black screen → show logo → fade out
    const logoTimer = setTimeout(() => setPhase('logo'), 200);
    const fadeTimer = setTimeout(() => {
      setPhase('fade');
      if (onFadeStart) onFadeStart(); // Trigger chime exactly as fade begins
    }, 1400);
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem('nateos-booted', 'true');
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, onFadeStart]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: '#000000' }}
    >
      {phase !== 'black' && (
        <>
          {/* Classic "Happy Mac" style pixel art face */}
          <div style={{ imageRendering: 'pixelated' }}>
            <svg width="96" height="96" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Monitor outline */}
              <rect x="2" y="1" width="12" height="10" rx="1" fill="#c0c0c0" stroke="#808080" strokeWidth="0.5" />
              {/* Screen */}
              <rect x="3" y="2" width="10" height="7" fill="#1a1a2e" />
              {/* Happy face on screen */}
              <rect x="5" y="3" width="1" height="2" fill="#33ff33" /> {/* Left eye */}
              <rect x="9" y="3" width="1" height="2" fill="#33ff33" /> {/* Right eye */}
              <rect x="5" y="6" width="1" height="1" fill="#33ff33" /> {/* Mouth left */}
              <rect x="6" y="7" width="3" height="1" fill="#33ff33" /> {/* Mouth bottom */}
              <rect x="9" y="6" width="1" height="1" fill="#33ff33" /> {/* Mouth right */}
              {/* Stand */}
              <rect x="6" y="11" width="4" height="1" fill="#808080" />
              <rect x="5" y="12" width="6" height="1" fill="#808080" />
            </svg>
          </div>

          {/* Startup chime text */}
          <div
            className="mt-6"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '20px',
              color: '#c0c0c0',
              letterSpacing: '3px',
            }}
          >
            NateOS™
          </div>

          {/* Spinning wait indicator */}
          <div className="mt-6 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: '#808080',
                  animation: `bootDot 1.2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes bootDot {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); background-color: #c0c0c0; }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default BootSequence;
