import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPopup = ({ onClose, clockRef }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const calRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (
        calRef.current && !calRef.current.contains(e.target) &&
        clockRef?.current && !clockRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  const isToday = (day) => {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  return (
    <div
      ref={calRef}
      className="absolute bottom-14 right-0 w-72 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[6px_-6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_-6px_0px_0px_rgba(255,255,255,1)] z-[100] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b-4 border-black dark:border-white bg-[#FFC900] dark:bg-[#713f12]">
        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-4 h-4 stroke-[3] text-black dark:text-white" />
        </button>
        <button onClick={goToToday} className="text-xs font-black uppercase tracking-wide text-black dark:text-white">
          {MONTHS[viewMonth]} {viewYear}
        </button>
        <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <ChevronRight className="w-4 h-4 stroke-[3] text-black dark:text-white" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b-2 border-black dark:border-white">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase py-1 text-black dark:text-white">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 p-1 gap-px">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={`text-center text-xs py-1.5 font-bold transition-colors
              ${cell.current 
                ? 'text-black dark:text-white' 
                : 'text-gray-300 dark:text-gray-700'}
              ${cell.current && isToday(cell.day) 
                ? 'bg-[#FFC900] text-black font-black border-2 border-black' 
                : ''}
            `}
          >
            {cell.day}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black dark:border-white px-3 py-1.5 text-center">
        <button onClick={goToToday} className="text-[10px] font-black uppercase tracking-wide text-black dark:text-white hover:underline">
          Today: {MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
        </button>
      </div>
    </div>
  );
};

const Taskbar = ({ openWindows, onWindowClick, isDark, toggleDarkMode }) => {
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const clockRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-white dark:bg-black border-t-4 border-black dark:border-white flex items-center justify-between px-2 z-50 select-none">
      {/* Start / Branding */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="h-8 px-4 bg-[#FF90E8] dark:bg-[#831843] border-4 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs font-black uppercase tracking-tight text-black dark:text-white">
          NW
        </button>
      </div>

      {/* Open Window Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 mx-2 no-scrollbar">
        {openWindows.map((win) => (
          <button
            key={win.id}
            onClick={() => onWindowClick(win.id)}
            className={`h-8 px-3 border-2 border-black dark:border-white text-xs font-bold uppercase tracking-tight truncate max-w-[150px] transition-all ${
              win.isMinimized 
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400' 
                : 'bg-[#FFC900] dark:bg-[#713f12] text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
            }`}
          >
            {win.title}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-2 shrink-0 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="h-8 w-8 bg-yellow-300 dark:bg-blue-600 border-2 border-black dark:border-white flex items-center justify-center hover:opacity-80 transition-all"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4 stroke-[3]" /> : <Moon className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Clock — click to toggle calendar */}
        <button
          ref={clockRef}
          onClick={() => setShowCalendar(prev => !prev)}
          className="h-8 px-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900 flex flex-col items-end justify-center leading-none hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-[10px] font-bold text-black dark:text-white">{formattedTime}</span>
          <span className="text-[8px] font-medium text-gray-500 dark:text-gray-400">{formattedDate}</span>
        </button>

        {/* Calendar Popup */}
        {showCalendar && (
          <CalendarPopup onClose={() => setShowCalendar(false)} clockRef={clockRef} />
        )}
      </div>
    </div>
  );
};

export default Taskbar;
