import { containerClass } from '../constants/layout'
import Reveal from './Reveal'

function SkillsSection({ skills }) {
  return (
    <Reveal as="section" id="skills" className="py-16">
      <div className={containerClass}>
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Toolkit</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">Skills I bring to a team</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {skills.map((skill, index) => (
            <article
              key={skill.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition motion-safe:animate-fade-in-up dark:border-slate-700/60 dark:bg-nightSurface"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mist dark:text-nightMuted">
                {skill.label}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm text-ink/80 dark:text-white/80">
                {skill.items.map((item) => (
                  <li key={item} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export default SkillsSection
