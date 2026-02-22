export const portfolio = {
  hero: {
    name: "Nathan West",
    title: "Software Developer & Computer Science New-Grad",
    availability: "Open to new-grad roles",
    summary:
      "Software Developer who enjoys building complex projects from the ground up. My work primarily consists of designing full-stack apps, data-rich APIs, and other fun projects that pique my interest.",
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
      impact:
        "Building SwiftUI flows for adding/editing ingredients, Firebase auth + storage, and ML receipt parsing for automatic inventory updates.",
      tech: ["Swift", "SwiftUI", "OpenAI API", "Firebase"],
      images: ["/projects/fridgeiq.png"],
      link: "https://github.com/imnatewest/ai-fridge-app",
    },
    {
      title: "TripWise",
      period: "2024",
      categories: ["Full-stack", "Travel", "AI"],
      description:
        "Full-stack AI trip planner that generates itineraries, budgets, and travel suggestions.",
      impact:
        "Shipped a scalable Rails + PostgreSQL API with auth, maps-powered routing inputs, and modular React UI for streamlined planning.",
      tech: [
        "JavaScript",
        "PostgreSQL",
        "React",
        "Google Maps API",
        "OpenAI API",
      ],
      images: ["/projects/tripwise.png"],
      link: "https://github.com/imnatewest/TravelMate",
    },
    {
      title: "Stampede Marketplace",
      period: "2023",
      categories: ["Marketplace", "Web"],
      description:
        "Campus marketplace built with a four-person Agile team to enable peer-to-peer exchanges.",
      impact:
        "Achieved 50% student adoption by implementing secure listings, transactions, and responsive Bootstrap components.",
      tech: ["Ruby on Rails", "PostgreSQL", "JavaScript", "Bootstrap", "Git"],
      images: ["/projects/stampede.png"],
      link: "https://github.com/Stampede-SWE/Stampede",
    },
    {
      title: "PlantARium",
      period: "2024",
      categories: ["Augmented Reality", "Science Education", "Mobile"],
      description:
        "Education app using AR and leveraging AI to help users make informed decisions on plant-care.",
      impact:
        "Achieved 50% student adoption by implementing secure listings, transactions, and responsive Bootstrap components.",
      tech: ["Ruby on Rails", "PostgreSQL", "JavaScript", "Bootstrap", "Git"],
      images: ["/projects/plantarium1.png", "/projects/plantarium2.png"],
      link: "https://github.com/imnatewest/PlantARium",
    },
    {
      title: "Boksu",
      period: "2026",
      categories: ["Education", "Flashcards", "Mobile"],
      description:
        "Flashcard app using a spaced-repetition algorithm for improved studying.",
      impact:
        "Achieved 50% student adoption by implementing secure listings, transactions, and responsive Bootstrap components.",
      tech: ["Ruby on Rails", "PostgreSQL", "JavaScript", "Bootstrap", "Git"],
      images: [
        "/projects/boksu1.png",
        "/projects/boksu2.png",
        "/projects/boksu3.png",
      ],
      link: "https://github.com/imnatewest/",
    },
  ],
  experience: [
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
    },
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
  ],
};
