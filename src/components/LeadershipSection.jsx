import { containerClass } from '../constants/layout'
import Reveal from './Reveal'

function LeadershipSection({ leadership }) {
  return (
    <Reveal as="section" id="leadership" className="py-16">
      <div className={containerClass}>
        <div className="max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Leadership</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">
            Building and mentoring outside class
          </h2>
        </div>
        <div className="mt-10 space-y-6">
          {leadership.map((item) => (
            <article
              key={item.org}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition motion-safe:animate-fade-in-up dark:border-slate-700/60 dark:bg-nightSurface"
            >
              <div className="flex flex-wrap items-center gap-4 text-sm text-mist dark:text-nightMuted">
                <p>{item.period}</p>
                <p className="font-semibold text-ink/80 dark:text-white">{item.org}</p>
              </div>
              <p className="mt-3 font-medium text-ink dark:text-white">{item.summary}</p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-mist dark:text-nightMuted">
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export default LeadershipSection
