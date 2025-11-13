import { containerClass } from '../constants/layout'

function ProjectsSection({ projects }) {
  return (
    <section id="projects" className="py-16">
      <div className={containerClass}>
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Selected work</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">
            Projects that mirror the work I want to do
          </h2>
        </div>
        <div className="mt-10 space-y-6">
          {projects.map((project) => (
            <article
              key={project.title}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card transition dark:border-slate-700/60 dark:bg-nightSurface"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-mist dark:text-nightMuted">
                <p>{project.period}</p>
                <a className="font-semibold text-accent hover:underline" href={project.link} target="_blank" rel="noreferrer">
                  View source ↗
                </a>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-ink dark:text-white">{project.title}</h3>
              <p className="mt-3 text-mist dark:text-nightMuted">{project.description}</p>
              <div className="mt-4 border-t border-slate-200/70 dark:border-slate-700/60" />
              <p className="mt-3 font-medium text-ink dark:text-white">{project.impact}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent dark:bg-white/10 dark:text-white"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection
