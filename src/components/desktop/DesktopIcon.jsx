import React from 'react';

const DesktopIcon = ({ icon, label, onClick, color = 'bg-[#FF90E8]' }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 p-3 rounded-none select-none focus:outline-none transition-all w-24"
      aria-label={`Open ${label}`}
    >
      {/* Icon Container */}
      <div className={`w-16 h-16 ${color} border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:group-hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] group-active:translate-x-[4px] group-active:translate-y-[4px] group-active:shadow-none transition-all`}>
        <span className="pointer-events-none">{icon}</span>
      </div>
      {/* Label */}
      <span className="text-xs font-black uppercase tracking-tight text-black dark:text-white text-center leading-tight bg-white/80 dark:bg-black/80 px-2 py-0.5 border-2 border-black dark:border-white">
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;
