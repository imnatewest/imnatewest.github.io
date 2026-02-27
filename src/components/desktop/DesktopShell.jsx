import React, { useState, useCallback } from 'react';
import { User, Briefcase, Code, Cpu, Mail, FileText } from 'lucide-react';
import DesktopIcon from './DesktopIcon';
import DesktopWindow from './DesktopWindow';
import Taskbar from './Taskbar';

import Hero from '../Hero';
import ExperienceSection from '../ExperienceSection';
import ProjectsSection from '../ProjectsSection';
import SkillsSection from '../SkillsSection';
import ContactSection from '../ContactSection';
import { portfolio } from '../../data/content';

// Icon style for brutalist weight
const iconClass = "w-8 h-8 stroke-[3]";

// Desktop app definitions
const APPS = [
  { 
    id: 'about', 
    icon: <User className={iconClass} />,
    label: 'About Me', 
    color: 'bg-[#FF90E8]',
    windowColor: 'bg-[#FF90E8] dark:bg-[#831843]',
  },
  { 
    id: 'experience', 
    icon: <Briefcase className={iconClass} />,
    label: 'Experience', 
    color: 'bg-[#FFC900]',
    windowColor: 'bg-[#FFC900] dark:bg-[#713f12]',
  },
  { 
    id: 'projects', 
    icon: <Code className={iconClass} />,
    label: 'Projects', 
    color: 'bg-[#23A094]',
    windowColor: 'bg-[#23A094] dark:bg-[#134e4a]',
  },
  { 
    id: 'skills', 
    icon: <Cpu className={iconClass} />,
    label: 'Skills', 
    color: 'bg-[#90A8ED]',
    windowColor: 'bg-[#90A8ED] dark:bg-[#1e3a8a]',
  },
  { 
    id: 'contact', 
    icon: <Mail className={iconClass} />,
    label: 'Contact', 
    color: 'bg-white dark:bg-gray-800',
    windowColor: 'bg-white dark:bg-black',
  },
  { 
    id: 'resume', 
    icon: <FileText className={iconClass} />,
    label: 'Resume', 
    color: 'bg-yellow-300',
    isLink: true,
    href: portfolio.hero.resumeUrl,
  },
];

const DesktopShell = ({ isDark, toggleDarkMode }) => {
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

  // Generate staggered positions for windows
  const getDefaultPosition = (appId) => {
    const index = APPS.findIndex(a => a.id === appId);
    return {
      x: 100 + (index * 40),
      y: 60 + (index * 30),
    };
  };

  // Render window content based on app id
  const renderWindowContent = (appId) => {
    switch (appId) {
      case 'about':
        return <Hero hero={portfolio.hero} />;
      case 'experience':
        return <ExperienceSection experience={portfolio.experience} />;
      case 'projects':
        return <ProjectsSection projects={portfolio.projects} contained />;
      case 'skills':
        return <SkillsSection skills={portfolio.skills} />;
      case 'contact':
        return <ContactSection />;
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
    <div className="fixed inset-0 bg-[#fdfaf6] dark:bg-gray-900 text-black dark:text-white font-mono selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden">
      {/* Monitor Bezel */}
      <div className="absolute inset-4 lg:inset-8 xl:inset-12 border-[6px] border-black dark:border-white shadow-[inset_0_0_0_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_0_4px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden bg-gradient-to-br from-[#fdfaf6] via-[#f0ebe3] to-[#e8e0d4] dark:from-gray-900 dark:via-gray-850 dark:to-gray-800">
        
        {/* Bezel Top Bar (monitor brand) */}
        <div className="h-8 bg-black dark:bg-white flex items-center justify-between px-4 shrink-0">
          <span className="text-[10px] font-bold tracking-[0.3em] text-white dark:text-black uppercase">NateOS™ v1.0</span>
        </div>

        {/* Desktop Area */}
        <div className="flex-1 relative p-8 overflow-hidden retro-aqua-bg border-t-[3px] border-b-[3px] border-black dark:border-white">
          {/* Icon Grid */}
          <div className="grid grid-cols-2 gap-4 w-fit">
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
          openWindows={openWindowsList}
          onWindowClick={handleTaskbarClick}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
    </div>
  );
};

export default DesktopShell;
