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
import StarChaserWindow from './StarChaserWindow';
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

const StarChaserIcon = () => (
  <svg width="96" height="96" viewBox="-8 -8 64 64" className="drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" style={{ imageRendering: 'pixelated' }}>
    <rect x="8" y="8" width="32" height="32" fill="#050510" outline="2px solid #000" />
    <rect x="12" y="12" width="2" height="2" fill="#fff" />
    <rect x="34" y="24" width="2" height="2" fill="#fff" />
    <rect x="14" y="32" width="2" height="2" fill="#fff" />
    <rect x="28" y="14" width="2" height="2" fill="#fff" />
    <polygon points="24,14 16,36 24,28 32,36" fill="#e2e8f0" stroke="#000" strokeWidth="1" />
    <polygon points="18,22 12,30 18,34" fill="#3b82f6" stroke="#000" strokeWidth="1" />
    <polygon points="30,22 36,30 30,34" fill="#3b82f6" stroke="#000" strokeWidth="1" />
    <circle cx="24" cy="30" r="2" fill="#ef4444" />
  </svg>
);

// Small icon for taskbar to avoid overflow (24x24)
const StarChaserSmallIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" style={{ imageRendering: 'pixelated' }}>
    <rect x="8" y="8" width="32" height="32" fill="#050510" />
    <polygon points="24,14 18,34 24,26 30,34" fill="#e2e8f0" />
    <polygon points="20,22 14,28 20,32" fill="#3b82f6" />
    <polygon points="28,22 34,28 28,32" fill="#3b82f6" />
    <circle cx="24" cy="28" r="2" fill="#ef4444" />
  </svg>
);

const GamesFolderIcon = () => (
  <svg width="96" height="96" viewBox="-8 -8 64 64" className="drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" style={{ imageRendering: 'pixelated' }}>
    {/* Folder body */}
    <rect x="4" y="14" width="40" height="28" rx="2" fill="#f0c040" stroke="#b08820" strokeWidth="1" />
    {/* Folder tab */}
    <rect x="4" y="10" width="16" height="6" rx="1" fill="#f0c040" stroke="#b08820" strokeWidth="1" />
    {/* Gamepad icon on folder */}
    <rect x="16" y="22" width="16" height="10" rx="3" fill="#333" />
    <rect x="20" y="24" width="2" height="6" fill="#888" />
    <rect x="18" y="26" width="6" height="2" fill="#888" />
    <circle cx="30" cy="25" r="1.5" fill="#ef4444" />
    <circle cx="28" cy="28" r="1.5" fill="#3b82f6" />
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
    id: 'games',
    icon: <GamesFolderIcon />,
    label: 'Games',
    isFolder: true,
  },
  { 
    id: 'extraction', 
    icon: <ExtractionIcon />,
    label: 'Dark Harvest', 
    windowColor: 'bg-black',
    isHidden: true,
  },
  {
    id: 'starfox',
    icon: <StarChaserIcon />,
    taskbarIcon: <StarChaserSmallIcon />,
    label: 'Star Chaser 3D',
    windowColor: 'bg-black',
    defaultSize: { width: 800, height: 600 },
    isHidden: true,
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
    const desktopApps = APPS.filter(a => !a.isAppOnly && !a.isHidden);
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
  const [showGamesFolder, setShowGamesFolder] = useState(false);
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

    if (app.isFolder) {
      setShowGamesFolder(prev => !prev);
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
      case 'starfox':
        return <StarChaserWindow />;
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
            {APPS.filter(app => !app.isAppOnly && !app.isHidden).map((app) => (
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

            {/* Games Folder Popup */}
            {showGamesFolder && (
              <div
                className="absolute z-[60]"
                style={{
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                  background: isDark ? '#2b2b2b' : '#c0c0c0',
                  borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
                  borderLeft: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
                  borderRight: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
                  borderBottom: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
                  minWidth: 280, fontFamily: 'Tahoma, sans-serif',
                }}
              >
                {/* Title bar */}
                <div className="flex items-center justify-between px-2 py-1" style={{ background: isDark ? 'linear-gradient(90deg, #18181b, #3f3f46)' : 'linear-gradient(90deg, #000080, #1084d0)' }}>
                  <span className="text-white text-[12px] font-bold">📁 Games</span>
                  <button onClick={() => setShowGamesFolder(false)} className="w-4 h-4 flex items-center justify-center text-[10px] font-bold" style={{ background: isDark ? '#3f3f46' : '#c0c0c0', border: '1px outset #ccc' }}>✕</button>
                </div>
                {/* Folder contents */}
                <div className="flex gap-4 p-4 items-start">
                  {APPS.filter(a => a.isHidden).map(app => (
                    <button key={app.id} onClick={() => { openWindow(app.id); setShowGamesFolder(false); }} className="flex flex-col items-center gap-1 w-[80px] hover:bg-white/10 p-1 rounded">
                      <div className="w-[48px] h-[48px] flex items-center justify-center overflow-hidden" style={{ imageRendering: 'pixelated' }}>
                        <div className="w-[48px] h-[48px] [&>*]:w-full [&>*]:h-full [&>*]:object-contain">{app.icon}</div>
                      </div>
                      <span className={`text-[11px] font-bold text-center leading-tight ${isDark ? 'text-white' : 'text-black'}`}>{app.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
