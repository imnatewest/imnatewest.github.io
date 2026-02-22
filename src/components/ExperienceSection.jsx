import React from "react";

const ExperienceSection = ({ experience }) => {
  return (
    <div className="space-y-12">
      {experience.map((exp, index) => (
        <div key={index} className="group">
          <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              <a href={exp.webLink} target="_blank">
                {exp.org.split("·")[0].trim()}
              </a>
            </h4>

            <span className="text-sm font-mono text-gray-500">
              {exp.period}
            </span>
          </div>

          <div className="text-base font-medium text-gray-700 mb-4">
            {exp.role}
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">{exp.summary}</p>

          <ul className="list-disc list-outside ml-5 space-y-2 text-gray-600">
            {exp.achievements.map((achievement, i) => (
              <li key={i} className="pl-1 marker:text-gray-300">
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ExperienceSection;
