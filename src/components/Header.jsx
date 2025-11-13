import { containerClass } from '../constants/layout'

const navLinks = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#skills', label: 'Skills' },
  { href: '#leadership', label: 'Leadership' },
  { href: '#contact', label: 'Contact' },
]

function ThemeIcon({ mode }) {
  if (mode === 'dark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.6}
          d="M21.752 15.002A9.718 9.718 0 0112 21.75a9.75 9.75 0 01-9.75-9.75 9.718 9.718 0 016.748-9.252.75.75 0 01.908.986A7.501 7.501 0 0019.5 15.844a.75.75 0 01.986.908z"
        />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 3v2.25M12 18.75V21M5.636 5.636l1.59 1.59M16.773 16.773l1.59 1.591M3 12h2.25M18.75 12H21M5.636 18.364l1.59-1.591M16.773 7.227l1.59-1.59" />
      <circle cx="12" cy="12" r="3.25" strokeWidth={1.6} />
    </svg>
  )
}

function Header({ heroName, contactEmail, theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur transition-colors dark:border-slate-700/60 dark:bg-night/70">
      <div className={`${containerClass} flex items-center justify-between gap-4 py-4`}>
        <a
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold tracking-[0.3em] transition-colors dark:border-slate-600 dark:text-white"
          href="#hero"
          aria-label={`${heroName} home`}
        >
          NW
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-mist md:flex dark:text-nightMuted" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} className="transition hover:text-ink dark:hover:text-white" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <button
            type="button"
            aria-label="Toggle color theme"
            className="flex items-center justify-center rounded-full border border-slate-300 p-2 text-slate-600 transition hover:-translate-y-0.5 hover:text-ink dark:border-slate-600 dark:text-nightMuted dark:hover:text-white"
            onClick={onToggleTheme}
          >
            <ThemeIcon mode={theme} />
          </button>
          <a
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5 dark:border-slate-600 dark:text-white"
            href={`mailto:${contactEmail}`}
          >
            Say hello
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
