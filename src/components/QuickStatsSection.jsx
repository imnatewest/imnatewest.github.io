import { containerClass } from '../constants/layout'

function QuickStatsSection({ stats }) {
  if (!stats?.length) return null

  return (
    <section className="py-10">
      <div className={`${containerClass} rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-card backdrop-blur-sm dark:border-slate-700/60 dark:bg-nightSurface`}>
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Quick stats</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-3xl font-semibold text-ink dark:text-white">{stat.value}</p>
              <p className="text-sm text-mist dark:text-nightMuted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuickStatsSection
