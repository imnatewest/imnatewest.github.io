import React from 'react';

const SkillsSection = ({ skills }) => {
  return (
    <div className="space-y-8">
      {skills.map((category) => (
        <div key={category.label}>
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            {category.label}
          </h4>
          <div className="flex flex-wrap gap-2">
            {category.items.map((item) => (
              <span key={item} className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsSection;
