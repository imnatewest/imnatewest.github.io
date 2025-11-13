import Header from './components/Header'
import Hero from './components/Hero'
import AboutSection from './components/AboutSection'
import EducationSection from './components/EducationSection'
import SkillsSection from './components/SkillsSection'
import ProjectsSection from './components/ProjectsSection'
import ExperienceSection from './components/ExperienceSection'
import LeadershipSection from './components/LeadershipSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import QuickStatsSection from './components/QuickStatsSection'
import BackToTopButton from './components/BackToTopButton'
import { useTheme } from './hooks/useTheme'
import { portfolio } from './data/content'

function App() {
  const { hero, highlights, quickStats, about, skills, projects, experience, education, leadership, contact } = portfolio
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={`min-h-screen bg-slate-50 text-ink transition-colors duration-300 dark:bg-night dark:text-slate-100`}>
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.25),transparent_50%)]" />
        <Header heroName={hero.name} contactEmail={contact.email} theme={theme} onToggleTheme={toggleTheme} />

        <main>
          <Hero hero={hero} highlights={highlights} contact={contact} />
          <QuickStatsSection stats={quickStats} />
          <AboutSection about={about} />
          <EducationSection education={education} />
          <SkillsSection skills={skills} />
          <ProjectsSection projects={projects} />
          <ExperienceSection experience={experience} />
          <LeadershipSection leadership={leadership} />
          <ContactSection contact={contact} />
        </main>

        <Footer heroName={hero.name} />
        <BackToTopButton />
      </div>
    </div>
  )
}

export default App
