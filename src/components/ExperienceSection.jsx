import { containerClass } from '../constants/layout'
import Reveal from './Reveal'

function ExperienceSection({ experience }) {
  return (
    <Reveal as="section" id="experience" className="bg-white py-16 dark:bg-nightSurface/60">
      <div className={containerClass}>
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Experience</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">
            Learning fast in real environments
          </h2>
        </div>
        <div className="mt-10 space-y-8 border-l border-slate-200 pl-6 dark:border-slate-700/70">
          {experience.map((role) => (
            <article key={role.role} className="relative pl-6">
              <span className="absolute left-0 top-2 -translate-x-1/2 transform rounded-full border-4 border-white bg-accent shadow motion-safe:animate-pulse-soft dark:border-night dark:bg-accent"></span>
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition motion-safe:animate-fade-in-up dark:border-slate-700/60 dark:bg-nightSurface">
                <div className="flex flex-wrap items-center gap-4 text-sm text-mist dark:text-nightMuted">
                  <p>{role.period}</p>
                  <p className="font-semibold text-ink/80 dark:text-white">{role.org}</p>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-ink dark:text-white">{role.role}</h3>
                <p className="mt-2 text-mist dark:text-nightMuted">{role.summary}</p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-mist dark:text-nightMuted">
                  {role.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export default ExperienceSection
