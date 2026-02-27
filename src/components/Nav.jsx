import React, { useState, useEffect, useRef } from 'react';
import { portfolio } from '../data/content';

const Nav = ({ isDark, toggleDarkMode }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'experience', 'projects', 'skills', 'contact'];
      const scrollPosition = window.scrollY + 100; // offset

      let currentSection = sections[0];
      let minDistance = Infinity;
      const viewportMid = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          // Calculate distance from middle of screen to middle of section
          const elementMid = element.offsetTop + element.offsetHeight / 2;
          const distance = Math.abs(viewportMid - elementMid);

          if (distance < minDistance) {
            minDistance = distance;
            currentSection = section;
          }
        }
      }

      setActiveSection(currentSection);

      // Check if we hit the bottom of the page, forcefully switch to contact
      if (window.innerHeight + Math.round(window.scrollY) >= document.documentElement.scrollHeight - 50) {
        setActiveSection('contact');
      }

      // Check if original Nav has been scrolled past
      if (navRef.current) {
        setIsSticky(window.scrollY > navRef.current.offsetTop + navRef.current.offsetHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // header offset
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {/* Desktop Inline Table of Contents */}
      <nav ref={navRef} className="hidden lg:block mt-12 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-8">
        <h3 className="text-xl font-black uppercase tracking-tight text-black dark:text-white mb-6 border-b-4 border-black dark:border-white pb-2 inline-block">Table of Contents</h3>
        <ul className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className="group flex flex-col items-start text-left w-full transition-all"
              >
                <div className={`flex items-center gap-4 text-2xl font-black uppercase tracking-tight ${
                  activeSection === item.id
                    ? 'text-black dark:text-white'
                    : 'text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white'
                }`}>
                  <span className={`w-4 h-4 border-4 border-black dark:border-white transition-colors ${
                    activeSection === item.id ? 'bg-[#FF90E8] dark:bg-[#FF90E8]' : 'bg-transparent group-hover:bg-[#FFC900] dark:group-hover:bg-[#FFC900]'
                  }`}></span>
                  <span className="group-hover:translate-x-2 transition-transform">{item.label}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsMenuOpen(prev => !prev)}
        className="mobile-nav-toggle fixed top-6 right-6 z-40 p-3 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        aria-label="Open menu"
      >
        <div className="w-6 h-1 bg-black dark:bg-white mb-1.5"></div>
        <div className="w-6 h-1 bg-black dark:bg-white mb-1.5"></div>
        <div className="w-6 h-1 bg-black dark:bg-white"></div>
      </button>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="mobile-nav-toggle fixed top-20 right-6 z-50 w-64 bg-white dark:bg-black flex flex-col items-stretch border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] animate-in slide-in-from-top-4 duration-200">
          <ul className="flex flex-col w-full text-left">
            {navItems.map((item) => (
              <li key={`mobile-${item.id}`} className="border-b-4 border-black dark:border-white last:border-b-0">
                <button
                  onClick={() => {
                    scrollTo(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-xl font-black uppercase tracking-tight transition-all p-4 text-left active:bg-gray-200 dark:active:bg-gray-800 ${
                    activeSection === item.id 
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-white dark:bg-black text-black dark:text-white'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
            
            <li className="border-t-4 border-black dark:border-white">
               {/* Dark mode toggle rendered in Nav for mobile */}
               <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-yellow-300 dark:bg-blue-600 text-black dark:text-white transition-all uppercase font-black text-lg tracking-tight active:bg-yellow-400 dark:active:bg-blue-700 hover:opacity-90"
                >
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  {isDark ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  )}
                </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Nav;
