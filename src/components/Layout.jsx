import React, { useState, useEffect } from "react";

import Nav from "./Nav";
import { containerClass } from "../constants/layout";

import { Moon, Sun } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fdfaf6] dark:bg-gray-900 text-black dark:text-white font-mono selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">



      <div className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        
        {/* Main Column */}
        <main className="flex flex-col gap-12">
          {children}
        </main>

        <footer className="mt-24 pt-8 text-center text-sm font-bold border-t-4 border-black dark:border-white">
          <div>© {new Date().getFullYear()} NATHAN WEST</div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
