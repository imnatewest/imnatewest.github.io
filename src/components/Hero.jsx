import React, { useState } from 'react';
import { Mail, Phone, FileText, MapPin, Check } from 'lucide-react';

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
    <div className="mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
        {hero.name}
      </h1>
      <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-6 font-medium">
        {hero.title}
      </h2>
      
      <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <div className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-default">
          <MapPin className="w-4 h-4" />
          <span>{hero.location.split('·')[0].trim()}</span>
        </div>
        <button 
          onClick={() => copyToClipboard(hero.email, 'Email')}
          className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-label="Copy email address"
        >
          <Mail className="w-4 h-4" />
          <span>{hero.email}</span>
        </button>
        <button 
          onClick={() => copyToClipboard(hero.phone, 'Phone number')}
          className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-label="Copy phone number"
        >
          <Phone className="w-4 h-4" />
          <span>{hero.phone}</span>
        </button>
        <a href={hero.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <FileText className="w-4 h-4" />
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
