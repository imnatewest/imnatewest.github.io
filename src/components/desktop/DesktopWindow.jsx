import React, { useState, useRef, useEffect, useCallback } from 'react';

const MIN_WIDTH = 350;
const MIN_HEIGHT = 250;

const DesktopWindow = ({ 
  id,
  title, 
  children, 
  onClose, 
  onMinimize,
  onFocus,
  isMinimized,
  zIndex = 10,
  defaultPosition,
  color = 'bg-white dark:bg-black'
}) => {
  const windowRef = useRef(null);
  const [position, setPosition] = useState(defaultPosition || { x: 120, y: 80 });
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState(null);

  // ── Dragging ──────────────────────────────────────────
  const handleTitleMouseDown = useCallback((e) => {
    if (isMaximized) return;
    onFocus?.();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [isMaximized, position, onFocus]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // ── Resizing ──────────────────────────────────────────
  const startResize = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) return;
    onFocus?.();
    setIsResizing(true);
    setResizeDir(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    });
  }, [isMaximized, size, position, onFocus]);

  useEffect(() => {
    if (!isResizing || !resizeDir) return;

    const handleMouseMove = (e) => {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.posX;
      let newY = resizeStart.posY;

      // Horizontal
      if (resizeDir.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width + dx);
      }
      if (resizeDir.includes('w')) {
        const proposedWidth = resizeStart.width - dx;
        if (proposedWidth >= MIN_WIDTH) {
          newWidth = proposedWidth;
          newX = resizeStart.posX + dx;
        }
      }

      // Vertical
      if (resizeDir.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height + dy);
      }
      if (resizeDir.includes('n')) {
        const proposedHeight = resizeStart.height - dy;
        if (proposedHeight >= MIN_HEIGHT) {
          newHeight = proposedHeight;
          newY = resizeStart.posY + dy;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDir(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDir, resizeStart]);

  // ── Maximize ──────────────────────────────────────────
  const handleMaximize = () => {
    if (isMaximized) {
      if (preMaxState) {
        setPosition(preMaxState.position);
        setSize(preMaxState.size);
      }
      setIsMaximized(false);
    } else {
      setPreMaxState({ position, size });
      setIsMaximized(true);
    }
  };

  if (isMinimized) return null;

  const windowStyle = isMaximized 
    ? { top: 0, left: 0, right: 0, bottom: 48, zIndex } 
    : { left: position.x, top: position.y, width: size.width, height: size.height, zIndex };

  // Resize handle definitions: position classes + cursor
  const resizeHandles = [
    // Edges
    { dir: 'n',  className: 'absolute -top-1 left-2 right-2 h-2 cursor-n-resize z-10' },
    { dir: 's',  className: 'absolute -bottom-1 left-2 right-2 h-2 cursor-s-resize z-10' },
    { dir: 'w',  className: 'absolute top-2 -left-1 bottom-2 w-2 cursor-w-resize z-10' },
    { dir: 'e',  className: 'absolute top-2 -right-1 bottom-2 w-2 cursor-e-resize z-10' },
    // Corners
    { dir: 'nw', className: 'absolute -top-1 -left-1 w-4 h-4 cursor-nw-resize z-20' },
    { dir: 'ne', className: 'absolute -top-1 -right-1 w-4 h-4 cursor-ne-resize z-20' },
    { dir: 'sw', className: 'absolute -bottom-1 -left-1 w-4 h-4 cursor-sw-resize z-20' },
    { dir: 'se', className: 'absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize z-20' },
  ];

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] ${isDragging ? 'cursor-grabbing' : ''} ${isResizing ? 'select-none' : ''}`}
      style={windowStyle}
      onMouseDown={() => onFocus?.()}
    >
      {/* Resize Handles (hidden when maximized) */}
      {!isMaximized && resizeHandles.map(({ dir, className }) => (
        <div
          key={dir}
          className={className}
          onMouseDown={(e) => startResize(e, dir)}
        />
      ))}

      {/* Title Bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        className="flex items-center justify-between bg-black dark:bg-white text-white dark:text-black px-4 py-2 cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <span className="text-sm font-black uppercase tracking-widest truncate">{title}</span>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          {/* Minimize */}
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
            className="w-7 h-7 bg-yellow-300 border-2 border-white dark:border-black flex items-center justify-center hover:bg-yellow-400 transition-colors"
            aria-label="Minimize"
          >
            <span className="text-black font-black text-xs leading-none">—</span>
          </button>
          {/* Maximize */}
          <button
            onClick={(e) => { e.stopPropagation(); handleMaximize(); }}
            className="w-7 h-7 bg-green-400 border-2 border-white dark:border-black flex items-center justify-center hover:bg-green-500 transition-colors"
            aria-label="Maximize"
          >
            <span className="text-black font-black text-xs leading-none">{isMaximized ? '❐' : '□'}</span>
          </button>
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="w-7 h-7 bg-red-500 border-2 border-white dark:border-black flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Close"
          >
            <span className="text-white font-black text-xs leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className={`${color} overflow-y-auto flex-1 p-6`}>
        {children}
      </div>

      {/* Bottom-right resize grip indicator */}
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-30 flex items-end justify-end pr-1 pb-1"
          onMouseDown={(e) => startResize(e, 'se')}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-black dark:text-white">
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="2" />
            <line x1="9" y1="5" x2="5" y2="9" stroke="currentColor" strokeWidth="2" />
            <line x1="9" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DesktopWindow;
