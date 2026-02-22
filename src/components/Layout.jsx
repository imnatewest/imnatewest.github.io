import React from "react";
import { containerClass } from "../constants/layout";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <div className={`${containerClass} py-12 md:py-20`}>
        {children}

        <footer className="mt-24 pt-8 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
          <div>© 2026 Nathan West</div>
          <div className="flex gap-4">
            <a
              href="https://github.com/imnatewest"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/nathan-west-b0260124b/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition-colors"
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
