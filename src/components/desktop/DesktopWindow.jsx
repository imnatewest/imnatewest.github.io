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
  color = 'bg-white dark:bg-black',
  isDark = false
}) => {
  const windowRef = useRef(null);
  const [position, setPosition] = useState(
    typeof defaultPosition === 'object' ? defaultPosition : { x: 0, y: 0 }
  );
  const positionRef = useRef(position);
  
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [isReady, setIsReady] = useState(typeof defaultPosition === 'object');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState(null);

  // ── Auto-center on mount ─────────────────────────────
  useEffect(() => {
    if (defaultPosition === 'center' && windowRef.current) {
      const parent = windowRef.current.parentElement;
      if (parent) {
        const pw = parent.clientWidth;
        const ph = parent.clientHeight;
        
        // Ensure default size is not larger than screen
        let newW = Math.min(700, pw - 40);
        let newH = Math.min(500, ph - 40);
        
        setSize({ width: newW, height: newH });
        setPosition({
          x: Math.max(0, (pw - newW) / 2),
          y: Math.max(0, (ph - newH) / 2)
        });
        
        // Slight delay to ensure paint happens with correct dimensions
        requestAnimationFrame(() => setIsReady(true));
      } else {
        setIsReady(true);
      }
    }
  }, [defaultPosition]);

  // ── Dragging ──────────────────────────────────────────
  const handleTitleMouseDown = useCallback((e) => {
    if (isMaximized) return;
    onFocus?.();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    });
  }, [isMaximized, onFocus]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      positionRef.current = { x: newX, y: newY };
      if (windowRef.current) {
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setPosition(positionRef.current);
    };
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
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: positionRef.current.x,
      posY: positionRef.current.y,
    };
  }, [isMaximized, size, onFocus]);

  useEffect(() => {
    if (!isResizing || !resizeDir) return;

    const handleMouseMove = (e) => {
      const rs = resizeStartRef.current;
      const dx = e.clientX - rs.x;
      const dy = e.clientY - rs.y;

      let newWidth = rs.width;
      let newHeight = rs.height;
      let newX = rs.posX;
      let newY = rs.posY;

      // Horizontal
      if (resizeDir.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, rs.width + dx);
      }
      if (resizeDir.includes('w')) {
        const proposedWidth = rs.width - dx;
        if (proposedWidth >= MIN_WIDTH) {
          newWidth = proposedWidth;
          newX = rs.posX + dx;
        }
      }

      // Vertical
      if (resizeDir.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, rs.height + dy);
      }
      if (resizeDir.includes('n')) {
        const proposedHeight = rs.height - dy;
        if (proposedHeight >= MIN_HEIGHT) {
          newHeight = proposedHeight;
          newY = rs.posY + dy;
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
  }, [isResizing, resizeDir]);

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
    ? { top: 0, left: 0, right: 0, bottom: 0, zIndex } 
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
      className={`absolute flex flex-col bg-[#c0c0c0] dark:bg-[#2b2b2b] ${isDragging ? 'cursor-grabbing' : ''} ${isResizing ? 'select-none' : ''}`}
      style={{
        ...windowStyle,
        borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
        borderLeft: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
        borderRight: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
        borderBottom: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
        boxShadow: isDark 
          ? 'inset 1px 1px 0 #3f3f46, inset -1px -1px 0 #18181b, 3px 3px 0 rgba(0,0,0,0.6)'
          : 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080, 3px 3px 0 rgba(0,0,0,0.3)',
        visibility: isReady ? 'visible' : 'hidden',
      }}
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

      {/* Title Bar — XP gradient */}
      <div
        onMouseDown={handleTitleMouseDown}
        className="flex items-center justify-between px-2 py-1 cursor-grab active:cursor-grabbing select-none shrink-0"
        style={{ background: isDark ? 'linear-gradient(180deg, #3f3f46 0%, #27272a 50%, #18181b 100%)' : 'linear-gradient(180deg, #0997ff 0%, #0053ee 50%, #0044cc 100%)' }}
      >
        <span className="text-[13px] font-bold text-white truncate drop-shadow-[1px_1px_0px_rgba(0,0,0,0.4)]" style={{ fontFamily: 'Tahoma, Geneva, sans-serif' }}>{title}</span>
        <div className="flex items-center gap-[2px] shrink-0 ml-4">
          {/* Minimize */}
          <button
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); onMinimize?.(); }}
            className="w-[21px] h-[21px] flex items-center justify-center"
            style={{
              background: isDark ? 'linear-gradient(180deg, #5a5a5a 0%, #2b2b2b 100%)' : 'linear-gradient(180deg, #3c8fe8 0%, #2663c1 100%)',
              borderTop: isDark ? '1px solid #7a7a7a' : '1px solid #ffffff80',
              borderLeft: isDark ? '1px solid #7a7a7a' : '1px solid #ffffff80',
              borderRight: isDark ? '1px solid #00000080' : '1px solid #00000040',
              borderBottom: isDark ? '1px solid #00000080' : '1px solid #00000040',
              borderRadius: '3px',
            }}
            aria-label="Minimize"
          >
            <span className="text-white text-[11px] font-bold leading-none mt-[2px]">_</span>
          </button>
          {/* Maximize */}
          <button
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); handleMaximize(); }}
            className="w-[21px] h-[21px] flex items-center justify-center"
            style={{
              background: isDark ? 'linear-gradient(180deg, #5a5a5a 0%, #2b2b2b 100%)' : 'linear-gradient(180deg, #3c8fe8 0%, #2663c1 100%)',
              borderTop: isDark ? '1px solid #7a7a7a' : '1px solid #ffffff80',
              borderLeft: isDark ? '1px solid #7a7a7a' : '1px solid #ffffff80',
              borderRight: isDark ? '1px solid #00000080' : '1px solid #00000040',
              borderBottom: isDark ? '1px solid #00000080' : '1px solid #00000040',
              borderRadius: '3px',
            }}
            aria-label="Maximize"
          >
            <span className="text-white text-[10px] font-bold leading-none">{isMaximized ? '❐' : '□'}</span>
          </button>
          {/* Close */}
          <button
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); onClose?.(); }}
            className="w-[21px] h-[21px] flex items-center justify-center ml-[2px]"
            style={{
              background: isDark ? 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)' : 'linear-gradient(180deg, #e87961 0%, #c7321a 100%)',
              borderTop: isDark ? '1px solid #991b1b' : '1px solid #ffffff80',
              borderLeft: isDark ? '1px solid #991b1b' : '1px solid #ffffff80',
              borderRight: isDark ? '1px solid #00000080' : '1px solid #00000040',
              borderBottom: isDark ? '1px solid #00000080' : '1px solid #00000040',
              borderRadius: '3px',
            }}
            aria-label="Close"
          >
            <span className="text-white font-bold text-[11px] leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* Window Content — inset panel */}
      <div className="mx-1 mb-1 flex-1 overflow-hidden" style={{ 
        borderTop: isDark ? '2px solid #0a0a0a' : '2px solid #808080', 
        borderLeft: isDark ? '2px solid #0a0a0a' : '2px solid #808080', 
        borderRight: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff', 
        borderBottom: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff' 
      }}>
        <div className={`${color} overflow-y-auto h-full p-6`}>
          {children}
        </div>
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
