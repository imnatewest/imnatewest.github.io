import React, { useState, useEffect } from "react";

import Nav from "./Nav";
import { containerClass } from "../constants/layout";

const Layout = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      <Nav isDark={isDark} toggleDarkMode={toggleDarkMode} />
      {/* Add top padding to account for fixed nav */}
      <div className={`${containerClass} pt-24 pb-12 md:pt-32 md:pb-20 relative`}>

        {children}

        <footer className="mt-24 pt-8 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <div>© 2026 Nathan West</div>
          <div className="flex gap-4">
            <a
              href="https://github.com/imnatewest"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/nathan-west-b0260124b/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
