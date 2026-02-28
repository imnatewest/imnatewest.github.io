import React from "react";

const ExperienceSection = ({ experience, contained = false, isDark = false }) => {
  // ── Win95 retro style (desktop windows) ──
  if (contained) {
    return (
      <div className="space-y-3 mx-auto w-full" style={{ fontFamily: 'Tahoma, Geneva, sans-serif', minWidth: '300px', maxWidth: '650px' }}>
        {experience.map((exp) => (
          <fieldset
            key={exp.org}
            className="p-3"
            style={{
              borderTop: isDark ? '1px solid #0a0a0a' : '1px solid #808080',
              borderLeft: isDark ? '1px solid #0a0a0a' : '1px solid #808080',
              borderRight: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff',
              borderBottom: isDark ? '1px solid #5a5a5a' : '1px solid #ffffff',
            }}
          >
            <legend className="text-xs font-bold px-1" style={{ color: isDark ? '#e5e7eb' : '#000' }}>
              {exp.period}
            </legend>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="text-sm font-bold" style={{ color: isDark ? '#e5e7eb' : '#000' }}>
                <a href={exp.webLink} target="_blank" rel="noreferrer" className={`hover:underline pointer-events-auto ${isDark ? 'text-[#60a5fa]' : 'text-[#0000ee]'}`}>
                  {exp.org.split("·")[0].trim()}
                </a>
              </h4>
              <span className="text-[11px] font-bold" style={{ color: isDark ? '#a1a1aa' : '#555' }}>
                {exp.role}
              </span>
            </div>

            <p className="text-[12px] leading-relaxed mb-2" style={{ color: isDark ? '#e5e7eb' : '#000' }}>
              {exp.summary}
            </p>

            <ul className="list-none space-y-1 text-[12px]" style={{ color: isDark ? '#e5e7eb' : '#000' }}>
              {exp.achievements.map((achievement, i) => (
                <li key={i} className="flex gap-1.5">
                  <span style={{ color: isDark ? '#e5e7eb' : '#000' }}>•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
    );
  }

  // ── Original brutalist style (mobile) ──
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {experience.map((exp) => (
        <div key={exp.org} className="group bg-white dark:bg-neutral-900 border-[3px] sm:border-4 border-black dark:border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(229,231,235,1)] dark:sm:shadow-[6px_6px_0px_0px_rgba(229,231,235,1)] p-4 sm:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-baseline border-b-[3px] sm:border-b-4 border-black dark:border-gray-200 pb-3 sm:pb-4 mb-4">
            <h4 className="text-xl sm:text-2xl font-black text-black dark:text-gray-100 uppercase tracking-tight">
              <a href={exp.webLink} target="_blank" rel="noreferrer" className="hover:underline decoration-[3px] sm:decoration-4 underline-offset-4 pointer-events-auto">
                {exp.org.split("·")[0].trim()}
              </a>
            </h4>

            <span className="text-base font-bold bg-black dark:bg-gray-200 text-white dark:text-neutral-900 px-3 py-1 mt-2 md:mt-0 uppercase">
              {exp.period}
            </span>
          </div>

          <div className="text-xl font-bold bg-[#FF90E8] dark:bg-[#500f29] text-black dark:text-gray-100 inline-block px-3 py-1 border-2 border-black dark:border-gray-200 mb-6 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(229,231,235,1)]">
            {exp.role}
          </div>

          <p className="text-lg font-medium text-black dark:text-gray-300 mb-6 leading-relaxed">
            {exp.summary}
          </p>

          <ul className="list-none space-y-3 font-medium text-black dark:text-gray-300">
            {exp.achievements.map((achievement, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-2xl leading-none text-[#23A094] dark:text-[#5eead4]">▹</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ExperienceSection;
