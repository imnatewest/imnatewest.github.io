import { containerClass } from '../constants/layout'
import { telHref } from '../utils/phone'

function withBasePath(path) {
  if (!path) return path
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('/')) return path
  return `${import.meta.env.BASE_URL}${path}`
}

function Hero({ hero, highlights, contact }) {
  const resumeHref = withBasePath(hero.resumeUrl)
  const githubHref = contact?.github

  return (
    <section id="hero" className="relative overflow-hidden py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-slate-200/60 blur-3xl dark:bg-nightSurface/60" />
      </div>
      <div className={`${containerClass} grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,1fr)]`}>
        <div className="space-y-4 motion-safe:animate-fade-in-left">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">
            {hero.availability}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink dark:text-white sm:text-5xl">
            {hero.name}
            <span className="mt-2 block text-lg font-medium text-mist sm:text-xl dark:text-nightMuted">{hero.title}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mist dark:text-nightMuted">{hero.summary}</p>
          <div className="mt-8 flex flex-col gap-3 motion-safe:animate-fade-in-up motion-safe:animate-delay-150 sm:flex-row sm:flex-wrap">
            <a
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:focus-visible:ring-offset-night"
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
            >
              View resume
            </a>
            <a
              className="inline-flex items-center rounded-full bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:bg-white/10 dark:text-white dark:focus-visible:ring-offset-night"
              href={`mailto:${hero.email}`}
            >
              Email me
            </a>
            {githubHref && (
              <a
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:border-white/20 dark:text-white dark:hover:border-accent/60 dark:hover:text-white dark:focus-visible:ring-offset-night"
                href={githubHref}
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.486 2 12.02c0 4.432 2.865 8.192 6.839 9.525.5.094.682-.218.682-.484 0-.239-.009-.87-.014-1.707-2.782.607-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.467-1.11-1.467-.908-.622.069-.61.069-.61 1.004.071 1.533 1.034 1.533 1.034.892 1.536 2.341 1.092 2.91.836.091-.649.35-1.093.635-1.344-2.22-.254-4.555-1.114-4.555-4.956 0-1.095.39-1.99 1.029-2.689-.103-.255-.446-1.281.098-2.671 0 0 .84-.27 2.75 1.027a9.38 9.38 0 0 1 2.503-.338 9.34 9.34 0 0 1 2.503.338c1.909-1.296 2.748-1.027 2.748-1.027.546 1.39.203 2.416.1 2.671.641.699 1.028 1.594 1.028 2.689 0 3.852-2.339 4.699-4.566 4.947.36.31.68.921.68 1.856 0 1.338-.012 2.419-.012 2.749 0 .268.18.582.688.482C19.138 20.208 22 16.45 22 12.02 22 6.486 17.523 2 12 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>
            )}
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
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 motion-safe:animate-fade-in-right">
          {highlights.map((item, index) => (
            <article
              key={item.label}
              style={{ animationDelay: `${index * 120}ms` }}
              className="min-w-[240px] flex-1 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-highlight transition motion-safe:animate-float-slow dark:border-slate-700/60 dark:bg-nightSurface"
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
