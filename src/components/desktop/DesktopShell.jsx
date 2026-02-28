import React, { useState, useCallback } from 'react';
import DesktopIcon from './DesktopIcon';
import BootSequence from './BootSequence';
import DesktopWindow from './DesktopWindow';
import Taskbar from './Taskbar';

import Hero from '../Hero';
import ExperienceSection from '../ExperienceSection';
import ProjectsSection from '../ProjectsSection';
import SkillsSection from '../SkillsSection';
import ContactSection from '../ContactSection';
import { portfolio } from '../../data/content';

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
    alt="Extraction Game" 
    width="96" 
    height="96" 
    className="object-contain drop-shadow-[1px_2px_3px_rgba(0,0,0,0.4)]" 
    style={{ imageRendering: 'pixelated' }} 
  />
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
    isLink: true,
    href: portfolio.hero.resumeUrl,
  },
  { 
    id: 'extraction', 
    icon: <ExtractionIcon />,
    label: 'Dark Harvest', 
    isLink: true,
    href: '/extraction-game/index.html',
  },
];

const DesktopShell = ({ isDark, toggleDarkMode }) => {
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('nateos-booted'));
  // Windows state: { [id]: { isOpen, isMinimized, zIndex } }
  const [windows, setWindows] = useState({});
  const [topZ, setTopZ] = useState(10);

  const openWindow = useCallback((appId) => {
    const app = APPS.find(a => a.id === appId);
    if (app?.isLink) {
      window.open(app.href, '_blank');
      return;
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
        return <Hero hero={portfolio.hero} contained />;
      case 'experience':
        return <ExperienceSection experience={portfolio.experience} contained />;
      case 'projects':
        return <ProjectsSection projects={portfolio.projects} contained />;
      case 'skills':
        return <SkillsSection skills={portfolio.skills} contained />;
      case 'contact':
        return <ContactSection contained />;
      default:
        return null;
    }
  };

  // Build open windows list for taskbar
  const openWindowsList = Object.entries(windows).map(([id, state]) => {
    const app = APPS.find(a => a.id === id);
    return {
      id,
      title: app?.label || id,
      icon: app?.icon || '📁',
      isMinimized: state.isMinimized,
    };
  });

  return (
    <div className="fixed inset-0 bg-[#2c2c2c] dark:bg-[#1a1a1a] text-black dark:text-white font-mono overflow-hidden flex flex-col items-center justify-center">
      {booting && <BootSequence onComplete={() => setBooting(false)} />}
      {/* Monitor Bezel — CRT style with curvature */}
      <div
        className="w-full flex flex-col overflow-hidden"
        style={{
          aspectRatio: '4/3',
          maxWidth: '1200px',
          maxHeight: '85vh',
          background: 'linear-gradient(180deg, #d8d0c0 0%, #c4baa8 50%, #b8ae9c 100%)',
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
          {/* Desktop Area */}
          <div className="flex-1 relative p-8 overflow-hidden bg-moving-gradient">
          {/* Icon Grid */}
          <div className="grid grid-cols-2 flex-col gap-1 w-fit">
            {APPS.map((app) => (
              <DesktopIcon
                key={app.id}
                icon={app.icon}
                label={app.label}
                color={app.color}
                onClick={() => openWindow(app.id)}
              />
            ))}
          </div>

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
                color={app?.windowColor || 'bg-white dark:bg-black'}
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
            <span className="text-[9px] font-bold tracking-[0.3em] text-[#666] uppercase" style={{ fontFamily: 'Tahoma, sans-serif' }}>NateOS™</span>
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
