import React from 'react';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import Hero from './components/Hero';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import ContactSection from './components/ContactSection';
import { portfolio } from './data/content';

function App() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <Layout>
      <motion.div 
        id="home"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <Hero hero={portfolio.hero} />
      </motion.div>
      
      <motion.section 
        id="experience" 
        className="mb-16 pt-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-100 dark:border-gray-800 pb-2">Work Experience</h2>
        <ExperienceSection experience={portfolio.experience} />
      </motion.section>

      <motion.section 
        id="projects" 
        className="mb-16 pt-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-100 dark:border-gray-800 pb-2">Projects</h2>
        <ProjectsSection projects={portfolio.projects} />
      </motion.section>

      <motion.section 
        id="skills" 
        className="mb-16 pt-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-100 dark:border-gray-800 pb-2">Skills</h2>
        <SkillsSection skills={portfolio.skills} />
      </motion.section>

      <motion.section 
        id="contact" 
        className="mb-16 pt-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-100 dark:border-gray-800 pb-2">Contact</h2>
        <ContactSection />
      </motion.section>
    </Layout>
  );
}

export default App;
