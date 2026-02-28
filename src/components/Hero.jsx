import React, { useState } from 'react';
import { Mail, Phone, FileText, MapPin, Check } from 'lucide-react';
import Typewriter from 'typewriter-effect';

const Hero = ({ hero, contained = false, isDark = false }) => {
  const [toast, setToast] = useState({ show: false, message: '' });

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: `${type} copied!` });
      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 2000);
    });
  };

  // ── Win95 retro style (desktop windows) ──
  if (contained) {
    const btnStyle = {
      fontFamily: 'Tahoma, Geneva, sans-serif',
      background: isDark ? '#2b2b2b' : '#d4d0c8',
      borderTop: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
      borderLeft: isDark ? '2px solid #5a5a5a' : '2px solid #ffffff',
      borderRight: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
      borderBottom: isDark ? '2px solid #0a0a0a' : '2px solid #404040',
      color: isDark ? '#e5e7eb' : '#000',
    };

    return (
      <div className="max-w-lg mx-auto" style={{ fontFamily: 'Tahoma, Geneva, sans-serif' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: isDark ? '#e5e7eb' : '#000' }}>
          {hero.name}
        </h1>
        <div className="text-base mb-4 h-[22px]" style={{ color: isDark ? '#60a5fa' : '#0058e6' }}>
          <Typewriter
            options={{
              strings: [hero.title, 'Fullstack Developer', 'Software Engineer', 'Computer Science New-Grad'],
              autoStart: true, loop: true, delay: 50, deleteSpeed: 30, pauseFor: 2000,
            }}
          />
        </div>

        <fieldset className="p-3 mb-3" style={{ borderTop: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderLeft: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderRight: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff', borderBottom: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff' }}>
          <legend className="text-xs font-bold px-1" style={{ color: isDark ? '#e5e7eb' : '#000' }}>Contact Information</legend>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[13px]" style={{ background: isDark ? '#1a1a1a' : '#ffffff', borderTop: isDark ? '2px solid #0a0a0a' : '2px solid #808080', borderLeft: isDark ? '2px solid #0a0a0a' : '2px solid #808080', borderRight: isDark ? '2px solid #5a5a5a' : '2px solid #dfdfdf', borderBottom: isDark ? '2px solid #5a5a5a' : '2px solid #dfdfdf', color: isDark ? '#e5e7eb' : '#000' }}>
              📍 {hero.location.split('·')[0].trim()}
            </div>
            <button onClick={() => copyToClipboard(hero.email, 'Email')} className="flex items-center gap-1.5 px-3 py-1 text-[13px] hover:brightness-95 active:brightness-90 transition-all" style={btnStyle}>✉️ Email</button>
            <button onClick={() => copyToClipboard(hero.phone, 'Phone number')} className="flex items-center gap-1.5 px-3 py-1 text-[13px] hover:brightness-95 active:brightness-90 transition-all" style={btnStyle}>📞 Phone</button>
            <a href={hero.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 text-[13px] hover:brightness-95 active:brightness-90 transition-all no-underline" style={btnStyle}>📄 Resume</a>
          </div>
        </fieldset>

        <fieldset className="p-3" style={{ borderTop: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderLeft: isDark ? '1px solid #0a0a0a' : '1px solid #808080', borderRight: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff', borderBottom: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff' }}>
          <legend className="text-xs font-bold px-1" style={{ color: isDark ? '#e5e7eb' : '#000' }}>About</legend>
          <p className="text-sm leading-relaxed" style={{ color: isDark ? '#e5e7eb' : '#000' }}>{hero.summary}</p>
          {hero.extendedSummary && <p className="text-sm leading-relaxed mt-2" style={{ color: isDark ? '#e5e7eb' : '#000' }}>{hero.extendedSummary}</p>}
        </fieldset>

        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-3 py-2 z-50 transform transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`} style={{ ...btnStyle, background: isDark ? '#2b2b2b' : '#d4d0c8', boxShadow: isDark ? '2px 2px 4px rgba(0,0,0,0.6)' : '2px 2px 4px rgba(0,0,0,0.3)' }}>
          <Check className="w-3 h-3" style={{ color: isDark ? '#4ade80' : '#008000' }} />
          <span className="text-[11px] font-bold" style={{ color: isDark ? '#e5e7eb' : '#000' }}>{toast.message}</span>
        </div>
      </div>
    );
  }

  // ── Original brutalist style (mobile) ──
  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
        {hero.name}
      </h1>
      <div className="text-xl text-gray-600 dark:text-gray-300 mb-6 font-medium h-[28px]">
        <Typewriter
          options={{
            strings: [hero.title, 'Fullstack Developer', 'Software Engineer', 'Computer Science New-Grad'],
            autoStart: true, loop: true, delay: 50, deleteSpeed: 30, pauseFor: 2000,
          }}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-sm font-bold uppercase mt-8 mb-6">
        <div className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-neutral-900 border-4 border-black dark:border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(229,231,235,1)] cursor-default w-full sm:w-auto">
          <MapPin className="w-5 h-5" />
          <span>{hero.location.split('·')[0].trim()}</span>
        </div>
        
        <button 
          onClick={() => copyToClipboard(hero.email, 'Email')}
          className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-neutral-900 border-4 border-black dark:border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(229,231,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(229,231,235,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none w-full sm:w-auto"
          aria-label="Copy email address"
        >
          <Mail className="w-5 h-5" />
          <span>Email</span>
        </button>

        <button 
          onClick={() => copyToClipboard(hero.phone, 'Phone number')}
          className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-neutral-900 border-4 border-black dark:border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(229,231,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(229,231,235,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none w-full sm:w-auto"
          aria-label="Copy phone number"
        >
          <Phone className="w-5 h-5" />
          <span>Phone</span>
        </button>

        <a 
          href={hero.resumeUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-neutral-900 border-4 border-black dark:border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(229,231,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(229,231,235,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none w-full sm:w-auto"
        >
          <FileText className="w-5 h-5" />
          <span>Resume</span>
        </a>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>{hero.summary}</p>
        {hero.extendedSummary && <p className="mt-4">{hero.extendedSummary}</p>}
      </div>

      <div className={`fixed bottom-6 right-6 flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'} z-50`}>
        <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

export default Hero;
