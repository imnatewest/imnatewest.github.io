import React, { useState, useEffect } from "react";
import { Github, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProjectModal = ({ project, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = project.images || (project.image ? [project.image] : []);
  const hasMultipleImages = images.length > 1;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-yellow-300 dark:bg-red-600 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-black dark:text-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        <div className="overflow-y-auto overflow-x-hidden flex-1 no-scrollbar">
          {images.length > 0 ? (
            <div className="relative w-full h-64 sm:h-80 md:h-[400px] bg-black/5 dark:bg-white/5 flex-shrink-0 border-b-4 border-black dark:border-white">
              <img
                src={images[currentImageIndex]}
                alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                className="w-full h-full object-contain p-4"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevious}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-50 dark:bg-gray-950 flex flex-shrink-0 items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}

          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {project.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.tech?.map((tech) => (
                <span
                  key={tech}
                  className="text-sm font-bold text-black dark:text-white bg-green-200 dark:bg-green-800 px-3 py-1 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t-4 border-black dark:border-white">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-black text-black dark:text-white bg-yellow-300 dark:bg-yellow-600 px-6 py-3 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase"
                >
                  <Github className="w-5 h-5 stroke-[2.5]" />
                  <span>View Source</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectCard = ({ project, onClick }) => {
  const images = project.images || (project.image ? [project.image] : []);

  return (
    <article
      tabIndex={0}
      onClick={() => onClick(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(project);
        }
      }}
      aria-labelledby={`project-${project.title.replace(/\s+/g, "-").toLowerCase()}`}
      className="group cursor-pointer bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex flex-col transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus:outline-none focus:ring-4 focus:ring-yellow-400"
    >
      {images.length > 0 ? (
        <div className="relative w-full h-48 bg-black/5 dark:bg-white/5 border-b-4 border-black dark:border-white overflow-hidden">
          <img
            src={images[0]}
            alt={`${project.title} screenshot`}
            loading="lazy"
            className="w-full h-full object-cover p-0 transform transition-all duration-500 scale-105 group-hover:scale-100"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-50 dark:bg-gray-950 flex items-center justify-center border-b-4 border-black dark:border-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300 dark:text-gray-700"
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

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3
              id={`project-${project.title.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-xl font-black text-black dark:text-white uppercase tracking-tight"
            >
              {project.title}
            </h3>
          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {project.link && !project.link.includes("github") && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.link && project.link.includes("github") && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

          <p className="mt-3 mb-6 leading-relaxed font-medium text-black dark:text-gray-300">
            {project.description}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tech?.map((tech) => (
              <span
                key={tech}
                className="text-xs font-bold text-black dark:text-white bg-[#90A8ED] border-2 border-black dark:border-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-black dark:text-white bg-yellow-300 dark:bg-yellow-600 px-4 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase"
                >
                  Live
                  <ExternalLink className="w-4 h-4 stroke-[3]" />
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-black dark:text-white bg-white dark:bg-gray-800 px-4 py-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase"
                >
                  Code
                  <Github className="w-4 h-4 stroke-[3]" />
                </a>
              )}
            </div>

          {project.metrics?.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">{project.metrics[0]}</div>
          )}
        </div>
      </div>
      </div>
    </article>
  );
};

const ProjectsSection = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard 
            key={project.title} 
            project={project} 
            onClick={setSelectedProject} 
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
