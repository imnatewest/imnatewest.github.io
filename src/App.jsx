import React from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import { portfolio } from './data/content';

function App() {
  return (
    <Layout>
      <Hero hero={portfolio.hero} />
      
      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-2">Work Experience</h3>
        <ExperienceSection experience={portfolio.experience} />
      </section>

      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-2">Projects</h3>
        <ProjectsSection projects={portfolio.projects} />
      </section>

      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-2">Skills</h3>
        <SkillsSection skills={portfolio.skills} />
      </section>
    </Layout>
  );
}

export default App;
