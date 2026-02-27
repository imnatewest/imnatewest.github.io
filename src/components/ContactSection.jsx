import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ContactSection = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setStatus('sending');

    try {
      const response = await fetch('https://formspree.io/f/maqdvoqr', {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json',
        },
      });
      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-4 border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:-translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-4 border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:-translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
            placeholder="john@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-4 border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:-translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium resize-none"
          placeholder="Hi Nathan, I'd love to chat about..."
        />
      </div>
      
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-black uppercase tracking-tight border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>
          {status === 'sending' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Message'}
        </span>
        <Send className="w-5 h-5 stroke-[3]" />
      </button>

      {status === 'error' && (
        <p className="text-red-500 text-sm mt-2">Oops! There was a problem sending your message.</p>
      )}
    </form>
  );
};

export default ContactSection;
