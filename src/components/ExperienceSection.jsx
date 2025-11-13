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
        <div className="mt-10 space-y-8 sm:border-l sm:border-slate-200 sm:pl-6 sm:dark:border-slate-700/70">
          {experience.map((role) => (
            <article
              key={role.role}
              className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-card transition motion-safe:animate-fade-in-up sm:pl-6 dark:border-slate-700/60 dark:bg-nightSurface"
            >
              <span className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 transform rounded-full border-4 border-white bg-accent shadow motion-safe:animate-pulse-soft dark:border-night dark:bg-accent" />
              <div className="flex flex-col gap-1 text-sm text-mist dark:text-nightMuted sm:flex-row sm:items-center sm:gap-4">
                <p className="font-semibold text-accent">{role.period}</p>
                <p className="font-semibold text-ink/80 dark:text-white">{role.org}</p>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-ink dark:text-white">{role.role}</h3>
              <p className="mt-2 text-mist dark:text-nightMuted">{role.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-mist dark:text-nightMuted sm:list-disc sm:pl-5">
                {role.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export default ExperienceSection
