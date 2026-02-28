import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Nav from './components/Nav';
import Hero from './components/Hero';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import ContactSection from './components/ContactSection';
import DesktopShell from './components/desktop/DesktopShell';
import { portfolio } from './data/content';

// Custom hook for desktop breakpoint detection
function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isDesktop;
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setTimeout(() => setIsDark(true), 0);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Desktop: render the XP-style desktop environment
  if (isDesktop) {
    return <DesktopShell isDark={isDark} toggleDarkMode={toggleDarkMode} />;
  }

  // Mobile / Tablet: render current scrollable brutalist layout
  const brutalistBlockClass = "border-[3px] sm:border-4 border-black dark:border-gray-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(229,231,235,1)] dark:sm:shadow-[8px_8px_0px_0px_rgba(229,231,235,1)] p-5 sm:p-10 transition-transform";

  return (
    <Layout>
      {/* 1. Hero / Intro */}
      <section id="home" className={`${brutalistBlockClass} bg-[#FF90E8] dark:bg-[#500f29]`}>
        <Hero hero={portfolio.hero} />
        <Nav isDark={isDark} toggleDarkMode={toggleDarkMode} />
      </section>

      {/* 2. Experience */}
      <section id="experience" className={`${brutalistBlockClass} bg-[#FFC900] dark:bg-[#45260c]`}>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight border-b-[3px] sm:border-b-4 border-black dark:border-gray-200 pb-3 sm:pb-4 mb-6 sm:mb-8 dark:text-gray-100">Work Experience</h2>
        <ExperienceSection experience={portfolio.experience} />
      </section>

      {/* 3. Projects */}
      <section id="projects" className={`${brutalistBlockClass} bg-[#23A094] dark:bg-[#0b2f2d]`}>
        <h2 className="text-2xl sm:text-3xl font-black text-white dark:text-gray-100 uppercase tracking-tight border-b-[3px] sm:border-b-4 border-white dark:border-gray-200 pb-3 sm:pb-4 mb-6 sm:mb-8">Featured Projects</h2>
        <ProjectsSection projects={portfolio.projects} />
      </section>

      {/* 4. Skills */}
      <section id="skills" className={`${brutalistBlockClass} bg-[#90A8ED] dark:bg-[#11214d]`}>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight border-b-[3px] sm:border-b-4 border-black dark:border-gray-200 pb-3 sm:pb-4 mb-6 sm:mb-8 dark:text-gray-100">Tech Stack</h2>
        <SkillsSection skills={portfolio.skills} />
      </section>

      {/* 5. Contact */}
      <section id="contact" className={`${brutalistBlockClass} bg-white dark:bg-neutral-900`}>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight border-b-[3px] sm:border-b-4 border-black dark:border-gray-200 pb-3 sm:pb-4 mb-6 sm:mb-8 dark:text-gray-100">Let's Connect</h2>
        <ContactSection />
      </section>

    </Layout>
  );
}

export default App;

