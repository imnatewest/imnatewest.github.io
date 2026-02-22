import React from "react";
import { Github, ExternalLink } from "lucide-react";

const ProjectCard = ({ project }) => {
  return (
    <article
      tabIndex={0}
      aria-labelledby={`project-${project.title.replace(/\s+/g, "-").toLowerCase()}`}
      className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition focus:outline-none"
    >
      {project.image ? (
        <img
          src={project.image}
          alt={`${project.title} screenshot`}
          loading="lazy"
          className="w-full h-64 object-contain bg-gray-50 p-1"
        />
      ) : (
        <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2m-6 4v6m0-6l-3 3m3-3l3 3"
            />
          </svg>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3
            id={`project-${project.title.replace(/\s+/g, "-").toLowerCase()}`}
            className="text-lg font-semibold text-gray-900"
          >
            {project.title}
          </h3>
          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {project.link && !project.link.includes("github") && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-900"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.link && project.link.includes("github") && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-900"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <p className="mt-3 mb-4 leading-relaxed text-base text-gray-700">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech?.map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition"
              >
                Live
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-100 transition"
              >
                Code
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>

          {project.metrics?.length > 0 && (
            <div className="text-sm text-gray-600">{project.metrics[0]}</div>
          )}
        </div>
      </div>
    </article>
  );
};

const ProjectsSection = ({ projects }) => {
  return (
    <section>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
