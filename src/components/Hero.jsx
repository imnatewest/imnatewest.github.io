import { containerClass } from '../constants/layout'
import { telHref } from '../utils/phone'

function withBasePath(path) {
  if (!path) return path
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('/')) return path
  return `${import.meta.env.BASE_URL}${path}`
}

function Hero({ hero, highlights }) {
  const resumeHref = withBasePath(hero.resumeUrl)

  return (
    <section id="hero" className="py-16 md:py-20">
      <div className={`${containerClass} grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,1fr)]`}>
        <div>
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">
            {hero.availability}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl text-ink dark:text-white">
            {hero.name}
            <span className="mt-2 block text-lg font-medium text-mist sm:text-xl dark:text-nightMuted">{hero.title}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mist dark:text-nightMuted">{hero.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:-translate-y-0.5"
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
            >
              View resume
            </a>
            <a
              className="inline-flex items-center rounded-full bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition hover:-translate-y-0.5 dark:bg-white/10 dark:text-white"
              href={`mailto:${hero.email}`}
            >
              Email me
            </a>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-mist dark:text-nightMuted">
            <span>{hero.location}</span>
            <span className="hidden sm:inline-block">•</span>
            <a className="hover:text-ink dark:hover:text-white" href={`mailto:${hero.email}`}>
              {hero.email}
            </a>
            {hero.phone && (
              <>
                <span className="hidden sm:inline-block">•</span>
                <a className="hover:text-ink dark:hover:text-white" href={telHref(hero.phone)}>
                  {hero.phone}
                </a>
              </>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-highlight transition dark:border-slate-700/60 dark:bg-nightSurface"
            >
              <p className="text-base font-semibold text-ink dark:text-white">{item.value}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.2em] text-mist dark:text-nightMuted">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
