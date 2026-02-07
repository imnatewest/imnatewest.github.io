import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';

const ContactSection = ({ contact }) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4">Contact the Airline</h3>
      <div className="flex gap-4">
        <a 
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email Support
        </a>
        <a 
          href={contact.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          Agent Profile
        </a>
        <a 
          href={contact.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Github className="w-4 h-4" />
          Flight Logs
        </a>
      </div>
      <div className="mt-8 text-xs text-gray-400">
        © 2024 NathanFlights. All rights reserved. Privacy · Terms · Sitemap
      </div>
    </div>
  );
};

export default ContactSection;
