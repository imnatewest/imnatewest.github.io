import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const ProjectsSection = ({ projects }) => {
  return (
    <div className="space-y-10">
      {projects.map((project) => (
        <div key={project.title} className="group">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.title}
            </h4>
            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {project.link && (
                <a href={project.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {project.link && project.link.includes('github') && (
                 <a href={project.link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900">
                   <Github className="w-4 h-4" />
                 </a>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-3 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span key={tech} className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsSection;
