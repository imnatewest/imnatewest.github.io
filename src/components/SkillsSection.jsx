import React from 'react';

const iconMap = {
  "C": "devicon-c-plain",
  "C++": "devicon-cplusplus-plain",
  "C#": "devicon-csharp-plain",
  "Python": "devicon-python-plain",
  "Java": "devicon-java-plain",
  "JavaScript": "devicon-javascript-plain",
  "Ruby": "devicon-ruby-plain",
  "SQL": "devicon-azuresqldatabase-plain",
  "Swift": "devicon-swift-plain",
  "React": "devicon-react-original",
  "Node.js": "devicon-nodejs-plain",
  "Express.js": "devicon-express-original",
  "Ruby on Rails": "devicon-rails-plain",
  "Firebase": "devicon-firebase-plain",
  "PostgreSQL": "devicon-postgresql-plain",
  "MySQL": "devicon-mysql-plain",
  "Git": "devicon-git-plain",
  "Figma": "devicon-figma-plain",
};

const SkillsSection = ({ skills, contained = false }) => {
  // ── Win95 retro style (desktop windows) ──
  if (contained) {
    return (
      <div className="space-y-4 mx-auto w-full" style={{ fontFamily: 'Tahoma, Geneva, sans-serif', minWidth: '300px', maxWidth: '600px' }}>
        {skills.map((category) => (
          <fieldset
            key={category.label}
            className="p-3 bg-[#d4d0c8]"
            style={{
              borderTop: '1px solid #808080',
              borderLeft: '1px solid #808080',
              borderRight: '1px solid #ffffff',
              borderBottom: '1px solid #ffffff',
            }}
          >
            <legend className="text-xs font-bold px-1" style={{ color: '#000' }}>
              {category.label}
            </legend>
            <div className="flex flex-wrap gap-2 mt-1">
              {category.items.map((item) => (
                <div 
                  key={item} 
                  className="flex items-center gap-1.5 px-2 py-1 bg-white"
                  style={{
                    borderTop: '2px solid #808080',
                    borderLeft: '2px solid #808080',
                    borderRight: '2px solid #dfdfdf',
                    borderBottom: '2px solid #dfdfdf',
                    color: '#000',
                  }}
                >
                  <i className={`${iconMap[item] || 'devicon-devicon-plain'} colored text-[14px]`}></i>
                  <span className="text-[11px]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    );
  }

  // ── Original brutalist style (mobile) ──
  return (
    <div className="space-y-12">
      {skills.map((category) => (
        <div key={category.label}>
          <h4 className="text-xl font-black text-black dark:text-white uppercase tracking-tight mb-4 border-b-4 border-black dark:border-white pb-2 inline-block">
            {category.label}
          </h4>
          <div className="flex flex-wrap gap-4 mt-2">
            {category.items.map((item) => (
              <div 
                key={item} 
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-transform cursor-default"
              >
                <i className={`${iconMap[item] || 'devicon-devicon-plain'} colored text-xl`}></i>
                <span className="text-sm font-bold text-black dark:text-white">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsSection;
