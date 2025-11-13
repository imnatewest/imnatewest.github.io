import { containerClass } from '../constants/layout'
import Reveal from './Reveal'

function QuickStatsSection({ stats }) {
  if (!stats?.length) return null

  return (
    <Reveal as="section" className="py-10">
      <div
        className={`${containerClass} rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-card backdrop-blur-sm dark:border-slate-700/60 dark:bg-nightSurface`}
      >
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Quick stats</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="space-y-2 motion-safe:animate-fade-in-up"
              style={{ animationDelay: `${150 * (index + 1)}ms` }}
            >
              <p className="text-3xl font-semibold text-ink dark:text-white">{stat.value}</p>
              <p className="text-sm text-mist dark:text-nightMuted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export default QuickStatsSection
