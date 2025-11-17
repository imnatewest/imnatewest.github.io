import { useMemo, useState } from 'react'
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
  const profileImage = useMemo(() => `${import.meta.env.BASE_URL}profilepic.jpeg`, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const closeMenu = () => setMenuOpen(false)

  const linkClasses =
    'block rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-offset-night'

  const initials = heroName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur transition-colors dark:border-slate-700/60 dark:bg-night/70">
      <div className={`${containerClass} flex items-center justify-between gap-4 py-4`}>
        <a href="#hero" aria-label={`${heroName} home`} className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 dark:border-slate-600 dark:bg-night dark:text-white sm:h-12 sm:w-12">
            {initials}
          </div>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-mist md:flex dark:text-nightMuted" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} className="transition hover:text-ink dark:hover:text-white" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle color theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:-translate-y-0.5 hover:text-ink dark:border-slate-600 dark:text-nightMuted dark:hover:text-white"
            onClick={onToggleTheme}
          >
            <ThemeIcon mode={theme} />
          </button>
          <button
            type="button"
            aria-label="Toggle navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:-translate-y-0.5 hover:text-ink dark:border-slate-600 dark:text-nightMuted dark:hover:text-white md:hidden"
            onClick={toggleMenu}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200/60 bg-white/95 px-4 py-4 shadow-lg transition dark:border-slate-700/60 dark:bg-nightSurface">
          <nav className="space-y-2" aria-label="Mobile primary">
            {navLinks.map((link) => (
              <a key={link.href} className={linkClasses} href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 space-y-2">
            <a className={linkClasses} href={`mailto:${contactEmail}`} onClick={closeMenu}>
              Say hello
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
