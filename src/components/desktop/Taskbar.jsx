import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPopup = ({ onClose, clockRef, isDark }) => {
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
      className="absolute bottom-12 right-0 w-64 z-[100] select-none"
      style={{
        background: isDark ? '#2b2b2b' : '#d4d0c8',
        borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
        borderLeft: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
        borderRight: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
        borderBottom: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
        boxShadow: isDark ? '2px 2px 6px rgba(0,0,0,0.6)' : '2px 2px 6px rgba(0,0,0,0.3)',
        fontFamily: 'Tahoma, Geneva, sans-serif',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-2 py-1"
        style={{ background: isDark ? 'linear-gradient(90deg, #3f3f46, #27272a)' : 'linear-gradient(90deg, #0058e6, #3a8df5)' }}
      >
        <button
          onClick={prevMonth}
          className="w-5 h-5 flex items-center justify-center text-white hover:opacity-80"
          style={{
            background: 'transparent',
            borderTop: '1px solid rgba(255,255,255,0.4)',
            borderLeft: '1px solid rgba(255,255,255,0.4)',
            borderRight: '1px solid rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(0,0,0,0.3)',
            fontSize: '10px',
          }}
        >
          ◀
        </button>
        <button onClick={goToToday} className="text-[11px] font-bold text-white">
          {MONTHS[viewMonth]} {viewYear}
        </button>
        <button
          onClick={nextMonth}
          className="w-5 h-5 flex items-center justify-center text-white hover:opacity-80"
          style={{
            background: 'transparent',
            borderTop: '1px solid rgba(255,255,255,0.4)',
            borderLeft: '1px solid rgba(255,255,255,0.4)',
            borderRight: '1px solid rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(0,0,0,0.3)',
            fontSize: '10px',
          }}
        >
          ▶
        </button>
      </div>

      {/* Calendar body — sunken inset */}
      <div
        className="mx-2 mt-2 mb-1"
        style={{
          background: isDark ? '#1a1a1a' : '#ffffff',
          borderTop: isDark ? '2px solid #0a0a0a' : '2px solid #808080',
          borderLeft: isDark ? '2px solid #0a0a0a' : '2px solid #808080',
          borderRight: isDark ? '2px solid #5a5a5a' : '2px solid #dfdfdf',
          borderBottom: isDark ? '2px solid #5a5a5a' : '2px solid #dfdfdf',
        }}
      >
        {/* Day Headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: isDark ? '1px solid #404040' : '1px solid #c0c0c0' }}>
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold py-0.5" style={{ color: d === 'Su' || d === 'Sa' ? (isDark ? '#ef4444' : '#cc0000') : (isDark ? '#e5e7eb' : '#000') }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => (
            <div
              key={i}
              className="text-center text-[11px] py-[3px]"
              style={{
                color: !cell.current ? (isDark ? '#555' : '#aaa') : isToday(cell.day) ? '#fff' : (isDark ? '#e5e7eb' : '#000'),
                background: cell.current && isToday(cell.day) ? (isDark ? '#52525b' : '#0058e6') : 'transparent',
                fontWeight: cell.current && isToday(cell.day) ? 'bold' : 'normal',
              }}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 py-1 flex justify-center">
        <button
          onClick={goToToday}
          className="text-[10px] px-3 py-0.5"
          style={{
            background: isDark ? '#2b2b2b' : '#d4d0c8',
            borderTop: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff',
            borderLeft: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff',
            borderRight: isDark ? '1px solid #0a0a0a' : '1px solid #404040',
            borderBottom: isDark ? '1px solid #0a0a0a' : '1px solid #404040',
            color: isDark ? '#e5e7eb' : '#000',
          }}
        >
          Today: {MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
        </button>
      </div>
    </div>
  );
};

// WMO weather code → emoji + label
const weatherCodes = {
  0: ['☀️', 'Clear sky'],
  1: ['🌤️', 'Mainly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
  45: ['🌫️', 'Foggy'], 48: ['🌫️', 'Rime fog'],
  51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Heavy drizzle'],
  61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'],
  71: ['🌨️', 'Light snow'], 73: ['🌨️', 'Snow'], 75: ['❄️', 'Heavy snow'],
  77: ['🌨️', 'Snow grains'],
  80: ['🌦️', 'Light showers'], 81: ['🌧️', 'Showers'], 82: ['⛈️', 'Heavy showers'],
  85: ['🌨️', 'Snow showers'], 86: ['❄️', 'Heavy snow showers'],
  95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm + hail'], 99: ['⛈️', 'Severe thunderstorm'],
};

const WeatherWidget = ({ isDark }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const widgetRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('No geolocation');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
          );
          const data = await res.json();
          setWeather(data.current);
        } catch {
          setError('Fetch failed');
        }
        setLoading(false);
      },
      () => {
        setError('Location denied');
        setLoading(false);
      }
    );
  }, []);

  // Close popup on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (
        widgetRef.current && !widgetRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const code = weather?.weather_code ?? 0;
  const [emoji, label] = weatherCodes[code] || ['🌡️', 'Unknown'];
  const temp = weather ? Math.round(weather.temperature_2m) : '--';

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setShowPopup(prev => !prev)}
        className="h-6 flex items-center gap-1 hover:opacity-80 transition-all"
        style={{ fontFamily: 'Tahoma, sans-serif', fontSize: '11px', fontWeight: 'bold', color: isDark ? '#e5e7eb' : '#000000' }}
      >
        {loading ? (
          <span className="animate-pulse">🌡️</span>
        ) : error ? (
          <span>🌡️</span>
        ) : (
          <>
            <span style={{ fontSize: '14px' }}>{emoji}</span>
            <span>{temp}°</span>
          </>
        )}
      </button>

      {showPopup && (
        <div
          ref={widgetRef}
          className="absolute bottom-12 right-0 w-56 z-[100] select-none"
          style={{
            background: isDark ? '#2b2b2b' : '#d4d0c8',
            borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
            borderLeft: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
            borderRight: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
            borderBottom: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
            boxShadow: isDark ? '2px 2px 6px rgba(0,0,0,0.6)' : '2px 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div className="px-3 py-1.5" style={{ background: isDark ? 'linear-gradient(90deg, #3f3f46, #27272a)' : 'linear-gradient(90deg, #0058e6, #3a8df5)', fontFamily: 'Tahoma, sans-serif' }}>
            <span className="text-[11px] font-bold text-white">Local Weather</span>
          </div>
          {loading ? (
            <div className="p-4 text-center text-sm font-bold" style={{ color: isDark ? '#e5e7eb' : '#000' }}>Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm font-bold" style={{ color: isDark ? '#e5e7eb' : '#000' }}>
              {error === 'Location denied' ? '📍 Location access denied' : '⚠️ Could not load weather'}
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <div className="text-2xl font-black" style={{ color: isDark ? '#e5e7eb' : '#000' }}>{temp}°F</div>
                  <div className="text-[10px] font-bold uppercase" style={{ color: isDark ? '#a1a1aa' : '#666', fontFamily: 'Tahoma, sans-serif' }}>{label}</div>
                </div>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-1 text-[10px] font-bold uppercase" style={{ borderTop: isDark ? '1px solid #404040' : '1px solid #808080', color: isDark ? '#e5e7eb' : '#000', fontFamily: 'Tahoma, sans-serif' }}>
                <div>Feels like</div>
                <div className="text-right">{Math.round(weather.apparent_temperature)}°F</div>
                <div>Humidity</div>
                <div className="text-right">{weather.relative_humidity_2m}%</div>
                <div>Wind</div>
                <div className="text-right">{Math.round(weather.wind_speed_10m)} mph</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}; // Close WeatherWidget

const WindowsLogo = () => (
  <div className="grid grid-cols-2 gap-[1px] w-3.5 h-3.5 transform -skew-y-[12deg] mr-0.5 mt-0.5">
    <div className="bg-[#f03020]" />
    <div className="bg-[#108030]" />
    <div className="bg-[#0050d0]" />
    <div className="bg-[#f0a000]" />
  </div>
);

const StartMenu = ({ apps, onAppClick, onClose, startBtnRef, isDark }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        startBtnRef?.current && !startBtnRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, startBtnRef]);

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-0 flex z-[100] select-none shadow-[2px_2px_10px_rgba(0,0,0,0.5)]"
      style={{
        background: isDark ? '#2b2b2b' : '#c0c0c0',
        borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
        borderLeft: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
        borderRight: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
        borderBottom: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
        padding: '2px',
        minWidth: '220px',
        fontFamily: 'Tahoma, sans-serif'
      }}
    >
      <div 
        className="w-8 flex flex-col justify-end items-center py-2 shrink-0"
        style={{ background: isDark ? 'linear-gradient(180deg, #18181b 0%, #3f3f46 100%)' : 'linear-gradient(180deg, #000080 0%, #1084d0 100%)' }}
      >
        <div 
          className="text-white font-bold tracking-widest"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '14px',
          }}
        >
          NateOS <span className="text-gray-300 font-normal">95</span>
        </div>
      </div>

      <div className="flex-1 py-1 flex flex-col items-stretch" style={{ background: isDark ? '#2b2b2b' : '#c0c0c0' }}>
        {apps?.filter(app => app.isAppOnly).map((app) => (
          <React.Fragment key={app.id}>
            <button
              onClick={() => { onAppClick(app.id); onClose(); }}
              className={`px-3 py-1.5 flex items-center gap-3 ${isDark ? 'hover:bg-[#3f3f46]' : 'hover:bg-[#000080]'} hover:text-white group text-left transition-none`}
              style={{ fontSize: '13px', color: isDark ? '#e5e7eb' : '#000' }}
            >
              <div className="w-10 h-10 flex items-center justify-center pointer-events-none drop-shadow-md" style={{ imageRendering: 'pixelated' }}>
                <div style={{ transform: 'scale(0.70)', transformOrigin: 'center' }}>
                  {app.icon}
                </div>
              </div>
              <span className="font-bold cursor-pointer group-hover:text-white">{app.label}</span>
            </button>
            {(app.id === 'contact' || app.id === 'extraction') && (
              <div className="mx-2 my-1" style={{ borderTop: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderBottom: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff' }} />
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => { alert('It is now safe to turn off your computer.'); onClose(); }}
          className={`px-3 py-1 flex items-center gap-3 ${isDark ? 'hover:bg-[#3f3f46]' : 'hover:bg-[#000080]'} hover:text-white group text-left transition-none`}
          style={{ fontSize: '13px', color: isDark ? '#e5e7eb' : '#000' }}
        >
          <div className="w-8 h-8 flex items-center justify-center text-[18px] grayscale opacity-80 pointer-events-none group-hover:grayscale-0 group-hover:text-white">
            ⏻
          </div>
          <span className="font-bold cursor-pointer group-hover:text-white">Shut Down...</span>
        </button>
      </div>
    </div>
  );
}

const Taskbar = ({ apps, onAppClick, openWindows, onWindowClick, isDark, toggleDarkMode }) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const startBtnRef = useRef(null);
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
    <div
      className="h-12 flex items-center justify-between px-1 z-50 select-none shrink-0"
      style={{
        background: isDark ? '#2b2b2b' : '#c0c0c0',
        borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
      }}
    >
      {/* Start Button */}
      <div className="flex items-center shrink-0 relative">
        <button
          ref={startBtnRef}
          onClick={() => setShowStartMenu(prev => !prev)}
          className="h-8 flex items-center gap-1.5"
          style={{
            background: isDark ? '#2b2b2b' : '#c0c0c0',
            borderTop: showStartMenu ? (isDark ? '2px solid #0a0a0a' : '2px solid #808080') : (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff'),
            borderLeft: showStartMenu ? (isDark ? '2px solid #0a0a0a' : '2px solid #808080') : (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff'),
            borderRight: showStartMenu ? (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff') : (isDark ? '2px solid #0a0a0a' : '2px solid #808080'),
            borderBottom: showStartMenu ? (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff') : (isDark ? '2px solid #0a0a0a' : '2px solid #808080'),
            fontFamily: 'Tahoma, sans-serif',
            paddingTop: showStartMenu ? '2px' : '0',
            paddingLeft: showStartMenu ? '10px' : '8px',
            paddingRight: showStartMenu ? '6px' : '8px',
            paddingBottom: showStartMenu ? '0' : '2px', // Slight visual shift on click
          }}
        >
          <WindowsLogo />
          <span className="font-bold text-[13px] tracking-wide" style={{ color: isDark ? '#e5e7eb' : '#000' }}>Start</span>
        </button>

        {showStartMenu && (
          <StartMenu apps={apps} onAppClick={onAppClick} onClose={() => setShowStartMenu(false)} startBtnRef={startBtnRef} isDark={isDark} />
        )}
      </div>

      {/* Open Window Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 mx-1 no-scrollbar">
        {openWindows.map((win) => (
          <button
            key={win.id}
            onClick={() => onWindowClick(win.id)}
            className="h-7 px-2 flex items-center justify-center gap-1 min-w-[100px] max-w-[150px] transition-all"
            style={{
              fontFamily: 'Tahoma, Geneva, sans-serif',
              background: isDark ? '#2b2b2b' : '#c0c0c0',
              borderTop: win.isMinimized ? (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff') : (isDark ? '2px solid #0a0a0a' : '2px solid #808080'),
              borderLeft: win.isMinimized ? (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff') : (isDark ? '2px solid #0a0a0a' : '2px solid #808080'),
              borderRight: win.isMinimized ? (isDark ? '2px solid #0a0a0a' : '2px solid #808080') : (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff'),
              borderBottom: win.isMinimized ? (isDark ? '2px solid #0a0a0a' : '2px solid #808080') : (isDark ? '2px solid #5a5a5a' : '2px solid #ffffff'),
              color: isDark ? '#e5e7eb' : '#000000',
              paddingTop: win.isMinimized ? '0' : '2px', // shift content down when sunken
              paddingLeft: win.isMinimized ? '8px' : '10px', // shift content right when sunken
            }}
          >
            <div className="w-6 h-6 shrink-0 flex items-center justify-center pointer-events-none drop-shadow-sm" style={{ imageRendering: 'pixelated' }}>
              <div style={{ transform: 'scale(1.1)', transformOrigin: 'center' }}>
                {win.taskbarIcon || win.icon}
              </div>
            </div>
            <span className="text-[12px] font-bold truncate leading-none">{win.label}</span>
          </button>
        ))}
      </div>

      {/* System Tray — sunken inset */}
      <div
        className="flex items-center gap-0 shrink-0 relative h-8 px-1"
        style={{
          borderTop: isDark ? '1px solid #0a0a0a' : '1px solid #808080',
          borderLeft: isDark ? '1px solid #0a0a0a' : '1px solid #808080',
          borderRight: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff',
          borderBottom: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff',
        }}
      >
        {/* Weather */}
        <WeatherWidget isDark={isDark} />

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ borderLeft: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderRight: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff' }} />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="h-6 w-6 flex items-center justify-center hover:opacity-80 transition-all"
          aria-label="Toggle dark mode"
          style={{ color: isDark ? '#e5e7eb' : '#000000' }}
        >
          {isDark ? <Sun className="w-4 h-4 stroke-[2]" /> : <Moon className="w-4 h-4 stroke-[2]" />}
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ borderLeft: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderRight: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff' }} />

        {/* Clock — click to toggle calendar */}
        <button
          ref={clockRef}
          onClick={() => setShowCalendar(prev => !prev)}
          className="h-7 px-2 flex flex-col items-end justify-center leading-none hover:bg-white/20 transition-colors"
        >
          <span className="text-[11px] font-bold" style={{ fontFamily: 'Tahoma, sans-serif', color: isDark ? '#e5e7eb' : '#000000' }}>{formattedTime}</span>
        </button>

        {/* Calendar Popup */}
        {showCalendar && (
          <CalendarPopup onClose={() => setShowCalendar(false)} clockRef={clockRef} isDark={isDark} />
        )}
      </div>
    </div>
  );
};

export default Taskbar;
