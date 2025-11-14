import { containerClass } from '../constants/layout'
import { telHref } from '../utils/phone'
import Reveal from './Reveal'

const withBasePath = (path) => {
  if (!path) return path
  if (path.startsWith('/') || path.startsWith('http')) return path
  return `${import.meta.env.BASE_URL}${path}`
}

function ContactSection({ contact, hero }) {
  const resumeHref = withBasePath(hero?.resumeUrl)
  return (
    <Reveal as="section" id="contact" className="py-16">
      <div className={containerClass}>
        <div className="grid gap-8 rounded-3xl border border-accent/20 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-panel transition motion-safe:animate-fade-in-up sm:p-10 lg:grid-cols-[minmax(0,1fr)_300px] dark:border-white/10 dark:from-nightSurface dark:to-night">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">Get in touch</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">
              Let&apos;s build something thoughtful
            </h2>
            <p className="mt-4 text-mist dark:text-nightMuted">
              I love teams that pair curiosity with execution. Reach out for new-grad roles, residencies, or collaborative experiments.
            </p>
            <p className="mt-4 text-sm text-mist dark:text-nightMuted">
              Currently interviewing for Summer 2025 SWE opportunities.{' '}
              {resumeHref && (
                <a
                  className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:focus-visible:ring-offset-night"
                  href={resumeHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  View resume ↗
                </a>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <a
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 motion-safe:animate-scale-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:focus-visible:ring-offset-night"
              href={`mailto:${contact.email}`}
            >
              Email {contact.email}
            </a>
            <div className="flex flex-col gap-3 text-sm font-semibold text-accent dark:text-white">
              {contact.phone && (
                <a
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:focus-visible:ring-offset-night"
                  href={telHref(contact.phone)}
                >
                  {contact.phone}
                </a>
              )}
              <a
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:focus-visible:ring-offset-night"
                href={contact.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>
              <a
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-white dark:focus-visible:ring-offset-night"
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export default ContactSection
