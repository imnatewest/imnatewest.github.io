import React from 'react';
import { Mail, Phone, FileText, MapPin } from 'lucide-react';

const Hero = ({ hero }) => {
  return (
    <div className="mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
        {hero.name}
      </h1>
      <h2 className="text-xl text-gray-600 mb-6 font-medium">
        {hero.title}
      </h2>
      
      <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 mb-8">
        <div className="flex items-center gap-2 hover:text-gray-900 transition-colors cursor-default">
          <MapPin className="w-4 h-4" />
          <span>{hero.location.split('·')[0].trim()}</span>
        </div>
        <a href={`mailto:${hero.email}`} className="flex items-center gap-2 hover:text-gray-900 transition-colors">
          <Mail className="w-4 h-4" />
          <span>{hero.email}</span>
        </a>
        <div className="flex items-center gap-2 hover:text-gray-900 transition-colors cursor-default">
          <Phone className="w-4 h-4" />
          <span>{hero.phone}</span>
        </div>
        <a href={hero.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-900 transition-colors">
          <FileText className="w-4 h-4" />
          <span>Resume</span>
        </a>
      </div>

      <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
        <p>{hero.summary}</p>
        <p className="mt-4">
          I gravitate toward products where performance, usability, and measurable outcomes matter. 
          Recently I optimized 50+ Express APIs for storm monitoring, redesigned StormAlert’s dashboard, 
          and onboarded new geolocation data to unlock 10K+ more users.
        </p>
      </div>
    </div>
  );
};

export default Hero;
