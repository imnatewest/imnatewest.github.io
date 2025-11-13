export const portfolio = {
  hero: {
    name: 'Nathan West',
    title: 'Software Engineer & Computer Science Student',
    availability: 'Open to Summer 2025 SWE internships & new-grad roles',
    summary:
      'USF senior who enjoys building reliable systems end-to-end — from expressive React front-ends to data-rich APIs and automation pipelines that keep teams shipping fast.',
    location: 'Tampa, FL · Remote-friendly',
    email: 'imnathanwest@gmail.com',
    phone: '727-459-5304',
    resumeUrl: 'nathan-west-resume.pdf',
  },
  highlights: [
    {
      label: 'Current Role',
      value: 'SWE Intern · Bell Automation Systems',
    },
    {
      label: 'Teaching',
      value: '200+ students mentored @ CodeWizardsHQ',
    },
    {
      label: 'Leadership',
      value: 'Lead, RoboBulls Autonomous Robot Team',
    },
  ],
  about: [
    'I gravitate toward products where performance, usability, and measurable outcomes matter. Recently I optimized 50+ Express APIs for storm monitoring, redesigned StormAlert’s dashboard, and onboarded new geolocation data to unlock 10K+ more users.',
    'Outside internships I teach full-stack fundamentals to early developers and lead robotics teams, so I’m comfortable breaking down complex ideas, writing docs, and keeping collaboration lightweight but effective.',
  ],
  skills: [
    {
      label: 'Languages',
      items: ['C', 'C++', 'C#', 'Python', 'Java', 'JavaScript', 'Ruby', 'SQL', 'Swift'],
    },
    {
      label: 'Frameworks & Tools',
      items: ['React', 'Node.js', 'Express.js', 'Ruby on Rails', 'Firebase', 'PostgreSQL', 'MySQL', 'Git', 'Figma'],
    },
  ],
  projects: [
    {
      title: 'FridgeIQ',
      period: 'In progress',
      status: 'Active',
      description:
        'iOS app for food management that recommends meals via GPT based on what is already in the fridge.',
      impact:
        'Building SwiftUI flows for adding/editing ingredients, Firebase auth + storage, and ML receipt parsing for automatic inventory updates.',
      tech: ['Swift', 'SwiftUI', 'OpenAI API', 'Firebase'],
      link: 'https://github.com/nathanwest/fridgeiq',
    },
    {
      title: 'TripWise',
      period: '2024',
      description:
        'Full-stack AI trip planner that generates itineraries, budgets, and travel suggestions.',
      impact:
        'Shipped a scalable Rails + PostgreSQL API with auth, maps-powered routing inputs, and modular React UI for streamlined planning.',
      tech: ['Ruby on Rails', 'PostgreSQL', 'React', 'Google Maps API', 'OpenAI API'],
      link: 'https://github.com/nathanwest/tripwise',
    },
    {
      title: 'Stampede Marketplace',
      period: '2023',
      description:
        'Campus marketplace built with a four-person Agile team to enable peer-to-peer exchanges.',
      impact:
        'Achieved 50% student adoption by implementing secure listings, transactions, and responsive Bootstrap components.',
      tech: ['Ruby on Rails', 'PostgreSQL', 'JavaScript', 'Bootstrap', 'Git'],
      link: 'https://github.com/nathanwest/stampede',
    },
  ],
  experience: [
    {
      role: 'Software Engineer Intern',
      org: 'Bell Automation Systems · Remote',
      period: 'Sep 2024 – Present',
      summary:
        'Optimizing StormAlert, a severe-weather monitoring platform spanning 50+ API endpoints and live telemetry.',
      achievements: [
        'Reduced API response times by 35% by rewriting Express query logic and introducing caching layers.',
        'Redesigned React/CSS components that improved dashboard satisfaction scores by 70%.',
        'Integrated three new Mapbox geolocation feeds to unlock coverage from Arizona to Texas (10K+ new users).',
        'Partnered with QA/DevOps to automate testing + CI/CD, accelerating releases.',
      ],
    },
    {
      role: 'Programming Instructor',
      org: 'CodeWizardsHQ · Remote',
      period: 'May 2024 – Present',
      summary:
        'Teach and mentor students (ages 8–18) across Python, Java, and modern web development tracks.',
      achievements: [
        'Guided 200+ learners through industry-style exercises while maintaining a 90% retention rate.',
        'Designed capstone-style projects with Agile workflows to mirror real engineering teams.',
      ],
    },
  ],
  education: {
    school: 'University of South Florida',
    degree: 'B.S. in Computer Science',
    period: 'May 2021 – May 2025',
    coursework: [
      'Data Structures & Algorithms',
      'Operating Systems',
      'Software Engineering',
      'Intro to AI',
      'Secure Coding',
      'Database Systems',
    ],
  },
  leadership: [
    {
      org: 'RoboBulls · University of South Florida',
      period: 'Aug 2023 – Aug 2024',
      summary:
        'Led a five-person developer pod building an autonomous navigation robot for competition.',
      highlights: [
        'Integrated LIDAR sensors for real-time mapping, improving obstacle detection accuracy by 50%.',
        'Collaborated with hardware teammates to calibrate embedded systems and stabilize feedback loops.',
      ],
    },
  ],
  contact: {
    email: 'imnathanwest@gmail.com',
    phone: '727-459-5304',
    github: 'https://github.com/imnatewest',
    linkedin: 'https://www.linkedin.com/in/nathan-west-b0260124b/',
  },
}
