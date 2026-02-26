import React, { useState } from 'react';
import { Mail, Phone, FileText, MapPin, Check } from 'lucide-react';
import Typewriter from 'typewriter-effect';

const Hero = ({ hero }) => {
  const [toast, setToast] = useState({ show: false, message: '' });

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast({ show: true, message: `${type} copied!` });
      setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 2000);
    });
  };

  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
        {hero.name}
      </h1>
      <div className="text-xl text-gray-600 dark:text-gray-300 mb-6 font-medium h-[28px]">
        <Typewriter
          options={{
            strings: [
              hero.title,
              'Fullstack Developer',
              'Software Engineer',
              'Computer Science New-Grad'
            ],
            autoStart: true,
            loop: true,
            delay: 50,
            deleteSpeed: 30,
            pauseFor: 2000,
          }}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-sm font-bold uppercase mt-8 mb-6">
        <div className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] cursor-default w-full sm:w-auto">
          <MapPin className="w-5 h-5" />
          <span>{hero.location.split('·')[0].trim()}</span>
        </div>
        
        <button 
          onClick={() => copyToClipboard(hero.email, 'Email')}
          className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none w-full sm:w-auto"
          aria-label="Copy email address"
        >
          <Mail className="w-5 h-5" />
          <span>Email</span>
        </button>

        <button 
          onClick={() => copyToClipboard(hero.phone, 'Phone number')}
          className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none w-full sm:w-auto"
          aria-label="Copy phone number"
        >
          <Phone className="w-5 h-5" />
          <span>Phone</span>
        </button>

        <a 
          href={hero.resumeUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none w-full sm:w-auto"
        >
          <FileText className="w-5 h-5" />
          <span>Resume</span>
        </a>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>{hero.summary}</p>
        {hero.extendedSummary && (
          <p className="mt-4">{hero.extendedSummary}</p>
        )}
      </div>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-6 right-6 flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        } z-50`}
      >
        <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};

export default Hero;
