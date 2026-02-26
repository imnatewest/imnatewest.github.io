export const portfolio = {
  hero: {
    name: "Nathan West",
    title: "Software Developer & Computer Science New-Grad",
    availability: "Open to new-grad roles",
    summary:
      "Software Developer who enjoys building complex projects from the ground up. My work primarily consists of designing full-stack apps, data-rich APIs, and other fun projects that pique my interest.",
    extendedSummary:
      "I gravitate toward products where performance, usability, and measurable outcomes matter. Recently I optimized 50+ Express APIs for storm monitoring, redesigned StormAlert’s dashboard, and onboarded new geolocation data to unlock 10K+ more users.",
    location: "Tampa, FL · Open to Relocation · Remote-friendly",
    email: "imnathanwest@gmail.com",
    phone: "727-459-5304",
    resumeUrl: "nathan-west-resume.pdf",
  },
  skills: [
    {
      label: "Languages",
      items: [
        "C",
        "C++",
        "C#",
        "Python",
        "Java",
        "JavaScript",
        "Ruby",
        "SQL",
        "Swift",
      ],
    },
    {
      label: "Frameworks & Tools",
      items: [
        "React",
        "Node.js",
        "Express.js",
        "Ruby on Rails",
        "Firebase",
        "PostgreSQL",
        "MySQL",
        "Git",
        "Figma",
      ],
    },
  ],
  projects: [
    {
      title: "FridgeIQ",
      period: "In progress",
      status: "Active",
      categories: ["Mobile", "AI", "Consumer"],
      description:
        "iOS app for food management that recommends meals via AI based on what is already in the fridge.",
      tech: ["Swift", "SwiftUI", "OpenAI API", "Firebase"],
      images: ["/projects/fridgeiq.webp"],
      link: "https://github.com/imnatewest/ai-fridge-app",
    },
    {
      title: "TripWise",
      period: "2024",
      categories: ["Full-stack", "Travel", "AI"],
      description:
        "Full-stack AI trip planner that generates itineraries, budgets, and travel suggestions.",
      tech: [
        "JavaScript",
        "PostgreSQL",
        "React",
        "Google Maps API",
        "OpenAI API",
      ],
      images: ["/projects/tripwise.webp"],
      link: "https://github.com/imnatewest/TravelMate",
    },
    {
      title: "Stampede Marketplace",
      period: "2023",
      categories: ["Marketplace", "Web"],
      description:
        "Campus marketplace built with a four-person Agile team to enable peer-to-peer exchanges.",
      tech: ["Ruby on Rails", "PostgreSQL", "JavaScript", "Bootstrap", "Git"],
      images: ["/projects/stampede.webp"],
      link: "https://github.com/Stampede-SWE/Stampede",
    },
    {
      title: "PlantARium",
      period: "2024",
      categories: ["Augmented Reality", "Science Education", "Mobile"],
      description:
        "Education app using AR and leveraging AI to help users make informed decisions on plant-care.",
      tech: ["C#", "Unity", "Vuforia", "OpenAI API"],
      images: ["/projects/plantarium1.webp", "/projects/plantarium2.webp"],
      link: "https://github.com/imnatewest/PlantARium",
    },
    {
      title: "Boksu",
      period: "2026",
      categories: ["Education", "Flashcards", "Mobile"],
      description:
        "Flashcard app using a spaced-repetition algorithm for improved studying.",
      tech: ["Swift"],
      images: [
        "/projects/boksu1.webp",
        "/projects/boksu2.webp",
        "/projects/boksu3.webp",
      ],
      link: "https://github.com/imnatewest/Boksu",
    },
  ],
  experience: [
    {
      role: "Software Engineer Intern",
      org: "Bell Automation Systems",
      webLink: "https://www.linkedin.com/company/bell-automation-systems/",
      period: "Sep 2024 – Sep 2025",
      summary:
        "Optimizing StormAlert, a severe-weather monitoring platform spanning 50+ API endpoints and live telemetry.",
      achievements: [
        "Reduced API response times by 35% by rewriting Express query logic and introducing caching layers.",
        "Redesigned React/CSS components that improved dashboard satisfaction scores by 70%.",
        "Integrated three new Mapbox geolocation feeds to unlock coverage from Arizona to Texas (10K+ new users).",
        "Partnered with QA/DevOps to automate testing + CI/CD, accelerating releases.",
      ],
    },
    {
      role: "Programming Instructor",
      org: "CodeWizardsHQ",
      webLink:
        "https://www.linkedin.com/company/codewizardshq/posts/?feedView=all",
      period: "May 2024 – Present",
      summary:
        "Teach and mentor students (ages 8–18) across Python, Java, and modern web development tracks.",
      achievements: [
        "Guided 200+ learners through industry-style exercises while maintaining a 90% retention rate.",
        "Designed capstone-style projects with Agile workflows to mirror real engineering teams.",
      ],
    }
  ],
};
