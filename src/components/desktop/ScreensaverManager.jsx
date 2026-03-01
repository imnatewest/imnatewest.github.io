import React, { useState, useEffect, useCallback } from 'react';
import Starfield from './screensavers/Starfield';

const IDLE_TIMEOUT_MS = 30 * 1000; // 30 seconds

const ScreensaverManager = () => {
  const [isIdle, setIsIdle] = useState(false);
  const [screensaverType, setScreensaverType] = useState('starfield');

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      resetIdleTimer();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreensaverType('starfield');
        setIsIdle(true);
      }, IDLE_TIMEOUT_MS);
    };

    // Initial setup
    handleActivity();

    // Listen for all user interaction events
    const events = ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetIdleTimer]);

  if (!isIdle) return null;

  return (
    <div 
      className="absolute inset-0 z-[100] bg-black cursor-none rounded-[6px] overflow-hidden"
      onClick={resetIdleTimer}
    >
      <Starfield />
    </div>
  );
};

export default ScreensaverManager;
