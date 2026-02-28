import React from 'react';

const DesktopIcon = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-0 p-1 rounded select-none focus:outline-none transition-all hover:bg-white/10 active:bg-white/20"
      aria-label={`Open ${label}`}
    >
      {/* Icon — 96x96 pixel-art style */}
      <div className="w-24 h-24 flex items-center justify-center pointer-events-none" style={{ imageRendering: 'pixelated' }}>
        {icon}
      </div>
      {/* Label */}
      <span
        className="text-[14px] text-white text-center leading-snug px-1 -mt-2"
        style={{
          fontFamily: "'Tahoma', 'Segoe UI', sans-serif",
          textShadow: '1px 1px 1px #000, 0px 1px 1px rgba(0,0,0,0.5)',
        }}
      >
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;
