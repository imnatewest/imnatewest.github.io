import React, { useState, useCallback, useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import BootSequence from './BootSequence';
import DesktopWindow from './DesktopWindow';
import Taskbar from './Taskbar';
import ScreensaverManager from './ScreensaverManager';

import Hero from '../Hero';
import ExperienceSection from '../ExperienceSection';
import ProjectsSection from '../ProjectsSection';
import SkillsSection from '../SkillsSection';
import ContactSection from '../ContactSection';
import MusicPlayer from './MusicPlayer';
import TerminalWindow from './TerminalWindow';
import NotepadWindow from './NotepadWindow';
import PaintWindow from './PaintWindow';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { portfolio } from '../../data/content';

const OS_NAME = 'NateOS™';

// Classic Mac OS 9 style SVG icons (32x32 viewBox, rendered at 48px)

// Classic Windows XP Style Glossy Icons
const AboutIcon = () => (
  <img 
    src="/about-icon.png" 
    alt="About Me" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const ExperienceIcon = () => (
  <img 
    src="/experience-icon.png" 
    alt="Experience" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const ProjectsIcon = () => (
  <img 
    src="/projects-icon.png" 
    alt="Projects" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const SkillsIcon = () => (
  <img 
    src="/skills-icon.png" 
    alt="Skills" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const ContactIcon = () => (
  <img 
    src="/contact-icon.png" 
    alt="Contact" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const ResumeIcon = () => (
  <img 
    src="/resume-icon.png" 
    alt="Resume" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const ExtractionIcon = () => (
  <img 
    src="/extraction-icon.png" 
    alt="Dark Harvest" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
);

const MusicIcon = () => (
  <svg width="48" height="48" viewBox="-16 -16 80 80" className="drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" style={{ imageRendering: 'pixelated' }}>
    <rect x="4" y="8" width="40" height="32" fill="#d4d0c8" outline="2px solid #000" />
    <rect x="8" y="12" width="32" height="12" fill="#2b2b2b" />
    <path d="M12 16 L20 16 M24 16 L36 16 M12 20 L36 20" stroke="#00ff00" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="16" cy="30" r="4" fill="#666" outline="1px solid #000" />
    <circle cx="32" cy="30" r="4" fill="#666" outline="1px solid #000" />
    <rect x="22" y="30" width="4" height="2" fill="#2b2b2b" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="48" height="48" viewBox="-16 -16 80 80" className="drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" style={{ imageRendering: 'pixelated' }}>
    <rect x="2" y="6" width="44" height="36" fill="#1a1a1a" outline="2px solid #000" />
    <rect x="2" y="6" width="44" height="8" fill="#d4d0c8" />
    <path d="M6 22 L12 28 L6 34" stroke="#00ff00" strokeWidth="3" fill="none" />
    <rect x="16" y="32" width="8" height="3" fill="#00ff00" />
  </svg>
);

const NotepadIcon = () => (
  <svg width="48" height="48" viewBox="-16 -16 80 80" className="drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" style={{ imageRendering: 'pixelated' }}>
    <rect x="8" y="4" width="32" height="40" fill="#fff" outline="2px solid #000" />
    <rect x="8" y="4" width="32" height="8" fill="#0000aa" />
    <line x1="12" y1="18" x2="36" y2="18" stroke="#ccc" strokeWidth="2" />
    <line x1="12" y1="24" x2="36" y2="24" stroke="#ccc" strokeWidth="2" />
    <line x1="12" y1="30" x2="36" y2="30" stroke="#ccc" strokeWidth="2" />
    <line x1="12" y1="36" x2="28" y2="36" stroke="#ccc" strokeWidth="2" />
  </svg>
);

const PaintIcon = () => (
  <svg width="48" height="48" viewBox="-16 -16 80 80" className="drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" style={{ imageRendering: 'pixelated' }}>
    <rect x="8" y="8" width="32" height="32" fill="#fff" outline="2px solid #000" />
    <rect x="8" y="8" width="32" height="6" fill="#0000aa" />
    <path d="M 16 28 C 14 20, 24 16, 28 20 C 32 24, 30 32, 22 32 C 18 32, 16 28, 16 28 Z" fill="#e0c0a0" stroke="#000" strokeWidth="1" />
    <circle cx="20" cy="22" r="2.5" fill="#ff0000" />
    <circle cx="26" cy="24" r="2.5" fill="#00ff00" />
    <circle cx="22" cy="28" r="2.5" fill="#0000ff" />
    <path d="M 12 36 L 16 26 L 18 28 L 14 38 Z" fill="#d4d0c8" stroke="#000" strokeWidth="1" />
    <path d="M 12 36 L 10 40 L 14 38 Z" fill="#000" />
  </svg>
);


// Desktop app definitions
const APPS = [
  { 
    id: 'about', 
    icon: <AboutIcon />,
    label: 'About Me', 
    windowColor: 'bg-[#FF90E8] dark:bg-[#831843]',
  },
  { 
    id: 'experience', 
    icon: <ExperienceIcon />,
    label: 'Experience', 
    windowColor: 'bg-[#FFC900] dark:bg-[#713f12]',
  },
  { 
    id: 'projects', 
    icon: <ProjectsIcon />,
    label: 'Projects', 
    windowColor: 'bg-[#23A094] dark:bg-[#134e4a]',
  },
  { 
    id: 'skills', 
    icon: <SkillsIcon />,
    label: 'Skills', 
    windowColor: 'bg-[#90A8ED] dark:bg-[#1e3a8a]',
  },
  { 
    id: 'contact', 
    icon: <ContactIcon />,
    label: 'Contact', 
    windowColor: 'bg-white dark:bg-black',
  },
  { 
    id: 'resume', 
    icon: <ResumeIcon />,
    label: 'Resume', 
    windowColor: 'bg-zinc-800',
  },
  { 
    id: 'extraction', 
    icon: <ExtractionIcon />,
    label: 'Dark Harvest', 
    windowColor: 'bg-black',
  },
  {
    id: 'music',
    icon: <MusicIcon />,
    label: 'LoFi Player',
    windowColor: 'bg-[#111]',
    defaultSize: { width: 350, height: 250 },
    isAppOnly: true,
  },
  {
    id: 'terminal',
    icon: <TerminalIcon />,
    label: 'Command Prompt',
    windowColor: 'bg-black',
    isAppOnly: true,
  },
  {
    id: 'notepad',
    icon: <NotepadIcon />,
    label: 'Notepad',
    windowColor: 'bg-white',
    isAppOnly: true,
  },
  {
    id: 'paint',
    icon: <PaintIcon />,
    label: 'MS Paint',
    windowColor: 'bg-[#c0c0c0]',
    defaultSize: { width: 680, height: 500 },
    isAppOnly: true,
  }
];

const DesktopShell = ({ isDark, toggleDarkMode }) => {
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('nateos-booted'));
  const { playClick, playStartupChime } = useSoundEffects();
  
  // Windows state: { [id]: { isOpen, isMinimized, zIndex } }
  const [windows, setWindows] = useState({});
  const [topZ, setTopZ] = useState(10);

  // === Icons ===
  const [iconPositions, setIconPositions] = useState(() => {
    const saved = localStorage.getItem('nateos-icons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default 2-column layout, 96px spacing
    const pos = {};
    const desktopApps = APPS.filter(a => !a.isAppOnly);
    desktopApps.forEach((app, i) => {
      const col = Math.floor(i / 5); // 5 icons per column
      const row = i % 5;
      // Col 0: x=16, Col 1: x=112 (96px apart)
      pos[app.id] = { x: 16 + (col * 96), y: 16 + (row * 96) };
    });
    return pos;
  });

  const handleIconMove = useCallback((appId, newPos) => {
    setIconPositions(prev => {
      const next = { ...prev, [appId]: newPos };
      localStorage.setItem('nateos-icons', JSON.stringify(next));
      return next;
    });
  }, []);

  // === Selection Box ===
  const [selectionBox, setSelectionBox] = useState(null);
  const desktopRef = React.useRef(null);

  const handleDesktopMouseDown = (e) => {
    // Only target the desktop background, not icons or windows
    if (e.target !== desktopRef.current) return;
    if (e.button !== 0) return; // Left click only

    const rect = desktopRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
  };

  const handleDesktopMouseMove = (e) => {
    if (!selectionBox) return;
    const rect = desktopRef.current.getBoundingClientRect();
    setSelectionBox(prev => ({
      ...prev,
      currentX: Math.min(Math.max(0, e.clientX - rect.left), rect.width),
      currentY: Math.min(Math.max(0, e.clientY - rect.top), rect.height),
    }));
  };

  const handleDesktopMouseUp = () => {
    setSelectionBox(null);
  };

  // Global click sound
  useEffect(() => {
    const handleClick = () => {
      playClick();
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [playClick]);

  const handleBootComplete = useCallback(() => {
    setBooting(false);
  }, []);

  const handleFadeStart = useCallback(() => {
    playStartupChime();
  }, [playStartupChime]);

  const openWindow = useCallback((appId) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return false;

    if (app.isLink) {
      window.open(app.href, '_blank');
      return true;
    }

    setWindows(prev => {
      const existing = prev[appId];
      if (existing) {
        // If already open but minimized, restore it
        if (existing.isMinimized) {
          return { ...prev, [appId]: { ...existing, isMinimized: false, zIndex: topZ + 1 } };
        }
        // Already open and visible, just bring to front
        return { ...prev, [appId]: { ...existing, zIndex: topZ + 1 } };
      }
      // Open new window
      return { ...prev, [appId]: { isOpen: true, isMinimized: false, zIndex: topZ + 1 } };
    });
    setTopZ(z => z + 1);
    return true;
  }, [topZ]);

  const closeWindow = useCallback((appId) => {
    setWindows(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
  }, []);

  const minimizeWindow = useCallback((appId) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], isMinimized: true },
    }));
  }, []);

  const focusWindow = useCallback((appId) => {
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], zIndex: topZ + 1 },
    }));
    setTopZ(z => z + 1);
  }, [topZ]);

  const handleTaskbarClick = useCallback((appId) => {
    const win = windows[appId];
    if (win?.isMinimized) {
      // Restore
      setWindows(prev => ({
        ...prev,
        [appId]: { ...prev[appId], isMinimized: false, zIndex: topZ + 1 },
      }));
      setTopZ(z => z + 1);
    } else {
      // Minimize
      minimizeWindow(appId);
    }
  }, [windows, topZ, minimizeWindow]);

  // Spawn new windows in the exact center of the screen
  const getDefaultPosition = (appId) => {
    return 'center';
  };

  // Render window content based on app id
  const renderWindowContent = (appId) => {
    switch (appId) {
      case 'about':
        return <Hero hero={portfolio.hero} contained isDark={isDark} />;
      case 'experience':
        return <ExperienceSection experience={portfolio.experience} contained isDark={isDark} />;
      case 'projects':
        return <ProjectsSection projects={portfolio.projects} contained isDark={isDark} />;
      case 'skills':
        return <SkillsSection skills={portfolio.skills} contained isDark={isDark} />;
      case 'contact':
        return <ContactSection contained isDark={isDark} />;
      case 'resume':
        return (
          <object data={portfolio.hero.resumeUrl} type="application/pdf" className="w-full h-full border-none bg-white font-sans flex items-center justify-center">
            <div className="p-8 text-center text-gray-500">
              <p>Unable to display PDF in browser.</p>
              <a href={portfolio.hero.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline mt-2 inline-block">Click here to open it directly</a>
            </div>
          </object>
        );
      case 'extraction':
        return <iframe src="/extraction-game/index.html" sandbox="allow-scripts allow-same-origin" allow="fullscreen" className="w-full h-full border-none bg-black" title="Dark Harvest" />;
      case 'music':
        return <MusicPlayer isDark={isDark} />;
      case 'terminal':
        return <TerminalWindow onOpenApp={openWindow} />;
      case 'notepad':
        return <NotepadWindow isDark={isDark} />;
      case 'paint':
        return <PaintWindow isDark={isDark} />;
      default:
        return null;
    }
  };

  // Build open windows list for taskbar
  const openWindowsList = Object.entries(windows).map(([id, state]) => {
    const app = APPS.find(a => a.id === id);
    return { ...app, ...state };
  }).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={`fixed inset-0 bg-[#2c2c2c] dark:bg-[#1a1a1a] text-black dark:text-white font-mono overflow-hidden flex flex-col items-center justify-center ${isDark ? 'dark' : ''}`}>
      {booting && <BootSequence onComplete={handleBootComplete} onFadeStart={handleFadeStart} />}
      
      {/* Monitor Bezel — CRT style with curvature */}
      <div
        className="w-full flex flex-col overflow-hidden relative"
        style={{
          aspectRatio: '4/3',
          maxWidth: '1200px',
          maxHeight: '85vh',
          background: isDark ? 'linear-gradient(180deg, #3f3f46 0%, #27272a 50%, #18181b 100%)' : 'linear-gradient(180deg, #d8d0c0 0%, #c4baa8 50%, #b8ae9c 100%)',
          borderRadius: '18px',
          padding: '12px 14px 10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        {/* Brand label on bezel - removed from top */}

        {/* Screen area — inset into bezel */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          style={{
            borderRadius: '6px',
            border: '3px solid #1a1a1a',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.1)',
          }}
        >
          <ScreensaverManager disabled={windows['extraction']?.isOpen} />
          {/* Desktop Area */}
          <div 
            ref={desktopRef}
            onMouseDown={handleDesktopMouseDown}
            onMouseMove={handleDesktopMouseMove}
            onMouseUp={handleDesktopMouseUp}
            onMouseLeave={handleDesktopMouseUp}
            className="flex-1 relative overflow-hidden bg-moving-gradient"
          >
            {/* Selection Box */}
            {selectionBox && (
              <div 
                className={`absolute border border-dotted ${isDark ? 'bg-blue-500/20 border-blue-400' : 'bg-blue-600/20 border-blue-800'} pointer-events-none z-0`}
                style={{
                  left: Math.min(selectionBox.startX, selectionBox.currentX),
                  top: Math.min(selectionBox.startY, selectionBox.currentY),
                  width: Math.abs(selectionBox.currentX - selectionBox.startX),
                  height: Math.abs(selectionBox.currentY - selectionBox.startY),
                }}
              />
            )}

            {/* Desktop Icons */}
            {APPS.filter(app => !app.isAppOnly).map((app) => (
              <DesktopIcon
                key={app.id}
                icon={app.icon}
                label={app.label}
                initialPos={iconPositions[app.id]}
                onPosChange={(pos) => handleIconMove(app.id, pos)}
                onClick={() => openWindow(app.id)}
                containerRef={desktopRef}
              />
            ))}

          {/* Render Open Windows */}
          {Object.entries(windows).map(([appId, state]) => {
            if (!state.isOpen) return null;
            const app = APPS.find(a => a.id === appId);
            return (
              <DesktopWindow
                key={appId}
                id={appId}
                title={app?.label || appId}
                onClose={() => closeWindow(appId)}
                onMinimize={() => minimizeWindow(appId)}
                onFocus={() => focusWindow(appId)}
                isMinimized={state.isMinimized}
                zIndex={state.zIndex}
                defaultPosition={getDefaultPosition(appId)}
                defaultSize={app?.defaultSize}
                color={app?.windowColor || 'bg-white dark:bg-black'}
                isDark={isDark}
              >
                {renderWindowContent(appId)}
              </DesktopWindow>
            );
          })}
        </div>

        {/* Taskbar */}
        <Taskbar
          apps={APPS}
          onAppClick={openWindow}
          openWindows={openWindowsList}
          onWindowClick={handleTaskbarClick}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />
        </div>{/* /screen area */}

        {/* Bottom Bezel Content */}
        <div className="flex items-center justify-between px-6 mt-1 shrink-0">
          <div className="flex-1" />
          <div className="flex items-center justify-center">
            <span className="text-[9px] font-bold tracking-[0.3em] text-[#666] uppercase" style={{ fontFamily: 'Tahoma, sans-serif' }}>{OS_NAME}</span>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Power LED */}
            <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_4px_#4ade80]" />
          </div>
        </div>
      </div>{/* /bezel */}


    </div>
  );
};

export default DesktopShell;
