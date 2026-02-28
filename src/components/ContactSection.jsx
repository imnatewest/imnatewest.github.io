import React, { useState } from 'react';
import { Send } from 'lucide-react';

const inputStyleRetro = {
  fontFamily: 'Tahoma, Geneva, sans-serif',
  background: '#ffffff',
  borderTop: '2px solid #808080',
  borderLeft: '2px solid #808080',
  borderRight: '2px solid #dfdfdf',
  borderBottom: '2px solid #dfdfdf',
};

const ContactSection = ({ contained = false }) => {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setStatus('sending');

    try {
      const response = await fetch('https://formspree.io/f/maqdvoqr', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
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

  // ── Win95 retro style (desktop windows) ──
  if (contained) {
    return (
      <form onSubmit={handleSubmit} className="max-w-md mx-auto" style={{ fontFamily: 'Tahoma, Geneva, sans-serif' }}>
        <fieldset className="p-4 mb-3" style={{ borderTop: '1px solid #808080', borderLeft: '1px solid #808080', borderRight: '1px solid #ffffff', borderBottom: '1px solid #ffffff' }}>
          <legend className="text-sm font-bold px-1" style={{ color: '#000' }}>Send a Message</legend>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="name" className="block text-[13px] mb-1" style={{ color: '#000' }}>Name:</label>
              <input id="name" name="name" type="text" required className="w-full px-2 py-1 text-sm focus:outline-none" style={{ ...inputStyleRetro, color: '#000' }} placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-[13px] mb-1" style={{ color: '#000' }}>E-mail:</label>
              <input id="email" name="email" type="email" required className="w-full px-2 py-1 text-sm focus:outline-none" style={{ ...inputStyleRetro, color: '#000' }} placeholder="john@example.com" />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="block text-[13px] mb-1" style={{ color: '#000' }}>Message:</label>
            <textarea id="message" name="message" required rows={4} className="w-full px-2 py-1 text-sm focus:outline-none resize-none" style={{ ...inputStyleRetro, color: '#000' }} placeholder="Hi Nathan, I'd love to chat about..." />
          </div>
        </fieldset>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={status === 'sending'} className="inline-flex items-center gap-1.5 px-4 py-1 text-[13px] font-bold disabled:opacity-50" style={{ fontFamily: 'Tahoma, Geneva, sans-serif', background: '#d4d0c8', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderRight: '2px solid #404040', borderBottom: '2px solid #404040', color: '#000' }}>
            <Send className="w-3 h-3" />
            {status === 'sending' ? 'Sending...' : status === 'success' ? '✓ Sent!' : 'Send'}
          </button>
          {status === 'success' && <span className="text-[13px]" style={{ color: '#008000' }}>Message sent successfully!</span>}
          {status === 'error' && <span className="text-[13px]" style={{ color: '#ff0000' }}>Error sending message.</span>}
        </div>
      </form>
    );
  }

  // ── Original brutalist style (mobile) ──
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-black uppercase tracking-tight text-black dark:text-white">Name</label>
          <input id="name" name="name" type="text" required className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-4 border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:-translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-black uppercase tracking-tight text-black dark:text-white">Email</label>
          <input id="email" name="email" type="email" required className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-4 border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:-translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium" placeholder="john@example.com" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-black uppercase tracking-tight text-black dark:text-white">Message</label>
        <textarea id="message" name="message" required rows={5} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-4 border-black dark:border-white text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:-translate-y-1 focus:translate-x-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-medium resize-none" placeholder="Hi Nathan, I'd love to chat about..." />
      </div>
      
      <button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-black uppercase tracking-tight border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        <span>{status === 'sending' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Message'}</span>
        <Send className="w-5 h-5 stroke-[3]" />
      </button>

      {status === 'error' && <p className="text-red-500 text-sm mt-2">Oops! There was a problem sending your message.</p>}
    </form>
  );
};

export default ContactSection;
