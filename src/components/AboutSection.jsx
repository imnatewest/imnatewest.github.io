import { containerClass } from '../constants/layout'

function AboutSection({ about }) {
  return (
    <section id="about" className="py-16">
      <div className={`${containerClass} grid gap-10 md:grid-cols-2`}>
        <div>
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-mist dark:text-nightMuted">About</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-ink dark:text-white">
            Builder with a systems mindset
          </h2>
        </div>
        <div className="space-y-5 text-mist dark:text-nightMuted">
          {about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
