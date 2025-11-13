import { containerClass } from '../constants/layout'

function EducationSection({ education }) {
  return (
    <section id="education" className="bg-white py-16 dark:bg-nightSurface/60">
      <div className={`${containerClass} grid gap-8 md:grid-cols-[minmax(0,1fr)_1.2fr]`}>
        <div>
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Education</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">{education.school}</h2>
          <p className="mt-2 text-lg font-medium text-ink/80 dark:text-white/80">{education.degree}</p>
          <p className="text-sm text-mist dark:text-nightMuted">{education.period}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-mist dark:text-nightMuted">Coursework</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {education.coursework.map((course) => (
              <li
                key={course}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink/80 dark:bg-white/10 dark:text-white/80"
              >
                {course}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default EducationSection
