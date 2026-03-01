import React, { useState, useRef, useEffect, useCallback } from 'react';

const GRID_SIZE = 96;
const GRID_MARGIN = 16;

const DesktopIcon = ({ icon, label, onClick, initialPos, onPosChange, containerRef }) => {
  const [position, setPosition] = useState(initialPos || { x: 0, y: 0 });
  const positionRef = useRef(position);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    setPosition(initialPos || { x: 0, y: 0 });
    positionRef.current = initialPos || { x: 0, y: 0 };
  }, [initialPos]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    e.stopPropagation();
    
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = Math.max(0, e.clientX - dragOffset.current.x);
      const newY = Math.max(0, e.clientY - dragOffset.current.y);
      positionRef.current = { x: newX, y: newY };
      
      if (btnRef.current) {
        btnRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        btnRef.current.style.zIndex = 50;
      }
    };

    const handleMouseUp = (e) => {
      setIsDragging(false);
      if (btnRef.current) {
        btnRef.current.style.zIndex = 10;
      }

      const dx = Math.abs(e.clientX - dragStart.current.x);
      const dy = Math.abs(e.clientY - dragStart.current.y);
      const isClick = dx < 3 && dy < 3;

      if (isClick && onClick) {
        // Was a simple click, open the app
        // Return to original position in state to avoid drifting from tiny clicks
        if (btnRef.current) {
            btnRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
        onClick();
      } else {
        // Was a drag, snap and save
        const snappedX = Math.round((positionRef.current.x - GRID_MARGIN) / GRID_SIZE) * GRID_SIZE + GRID_MARGIN;
        const snappedY = Math.round((positionRef.current.y - GRID_MARGIN) / GRID_SIZE) * GRID_SIZE + GRID_MARGIN;
        
        let maxX = Infinity;
        let maxY = Infinity;
        if (containerRef && containerRef.current) {
          maxX = Math.max(0, containerRef.current.clientWidth - 88); 
          maxY = Math.max(0, containerRef.current.clientHeight - 88);
        }

        const finalPos = { 
          x: Math.min(Math.max(GRID_MARGIN, snappedX), maxX), 
          y: Math.min(Math.max(GRID_MARGIN, snappedY), maxY) 
        };
        setPosition(finalPos);
        positionRef.current = finalPos;
        
        if (btnRef.current) {
          btnRef.current.style.transform = `translate(${finalPos.x}px, ${finalPos.y}px)`;
        }
        onPosChange?.(finalPos);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onClick, position, onPosChange]);

  return (
    <div
      ref={btnRef}
      onMouseDown={handleMouseDown}
      className={`absolute group flex flex-col items-center gap-0 p-1 rounded select-none hover:bg-white/10 ${isDragging ? 'bg-white/20' : ''}`}
      style={{
        width: '88px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 10,
      }}
      title={label}
    >
      {/* Icon — 96x96 pixel-art style */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center pointer-events-none" style={{ imageRendering: 'pixelated' }}>
        {icon}
      </div>
      {/* Label */}
      <span
        className="text-[12px] text-white text-center leading-snug px-1 -mt-1 sm:-mt-2 pointer-events-none"
        style={{
          fontFamily: "'Tahoma', 'Segoe UI', sans-serif",
          textShadow: '1px 1px 1px #000, 0px 1px 1px rgba(0,0,0,0.5)',
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;
