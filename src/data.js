// Todo el contenido del sitio. Editar aquí = editar el sitio.

export const profile = {
  name: 'Hugo Eliezer',
  fullName: 'Hugo Eliezer Trejo',
  role: 'Backend & Cloud Engineer',
  tagline: 'Computer Science Engineering student building backend systems with Java, Spring and the cloud.',
  status: 'Open to internships',
  location: 'Guadalajara, Mexico',
  email: 'hugo.trejo02@gmail.com',
  linkedin: 'https://linkedin.com/in/hugo-eliezer-trejo',
  github: 'https://github.com/HugoTrejo13',
  repo: 'https://github.com/HugoTrejo13/eliezer-trejo',
  cv: '/Hugo_Eliezer_Trejo_CV.pdf',
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
]

export const about = {
  summary: [
    "I'm a Computer Science Engineering student at Universidad de Guadalajara, focused on the parts of software people don't see: APIs, services and the infrastructure they run on.",
    'At iNBest I helped deliver 8+ client projects across 4 teams, so I know how to keep work moving and talk to technical and non-technical people alike. Now I want to bring that ownership to backend engineering.',
  ],
  services: [
    { icon: 'server', title: 'Backend development', text: 'REST APIs and microservices with Java, Spring Boot and Spring Security.' },
    { icon: 'cloud', title: 'Cloud & infrastructure', text: 'AWS, Azure, Docker and Linux. AWS Certified Cloud Practitioner.' },
    { icon: 'database', title: 'Data & databases', text: 'PostgreSQL, MySQL, MongoDB and Power BI dashboards.' },
    { icon: 'board', title: 'Agile delivery', text: 'Scrum, Azure DevOps backlogs and sprint planning from my PMO work.' },
  ],
}

export const experience = [
  {
    title: 'Project Management Office (PMO) Intern',
    org: 'iNBest',
    date: 'Jul 2025 – May 2026',
    place: 'Guadalajara, Mexico · On-site / Remote',
    points: [
      'Prototyped a Power Automate flow syncing MS Project schedules into Azure DevOps, with SharePoint-hosted Excel staging and duplicate prevention, to remove manual double entry.',
      'Structured Azure DevOps backlogs (epics, features, user stories, iterations, baselines) via bulk Excel imports and built tag-based dashboards to track team capacity.',
      'Managed delivery of 8+ concurrent client projects across 4 teams: UX-to-code web apps, cloud migrations, Power BI/Fabric dashboards and an internal Azure CRM.',
      'Led team dailies and weekly capacity planning; produced status reports, change requests and ISO-compliant documentation for clients and leadership.',
    ],
  },
  {
    title: 'Sales Associate & Customer Service',
    org: 'Mr. CD',
    date: 'May 2023 – Sep 2023',
    place: 'Guadalajara, Mexico',
    points: [
      'Advised customers on choosing musical instruments, with technical guidance and personalized recommendations that contributed directly to department sales.',
      "Operated the company's point-of-sale and inventory software for transactions, stock tracking and daily reporting.",
    ],
  },
]

export const education = [
  {
    degree: 'B.S. Computer Science Engineering',
    school: 'Universidad de Guadalajara',
    campus: 'CUTONALÁ',
    date: '2024 – 2027',
    details: ['GPA 94.13/100', '6th semester', 'Expected graduation: Dec 2027'],
  },
]

// Logos de devicon (MIT), servidos desde jsDelivr con versión fija
const devicon = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${path}.svg`

export const stack = [
  { name: 'Java', icon: devicon('java/java-original') },
  { name: 'Python', icon: devicon('python/python-original') },
  { name: 'Spring Framework', icon: devicon('spring/spring-original-wordmark') },
  { name: 'Spring Boot', icon: devicon('spring/spring-original') },
  { name: 'PostgreSQL', icon: devicon('postgresql/postgresql-original') },
  { name: 'MongoDB', icon: devicon('mongodb/mongodb-original') },
  { name: 'AWS', icon: devicon('amazonwebservices/amazonwebservices-original-wordmark') },
  { name: 'Azure DevOps', icon: devicon('azuredevops/azuredevops-original') },
  { name: 'Docker', icon: devicon('docker/docker-original') },
  { name: 'Linux', icon: devicon('linux/linux-plain') },
  { name: 'Git', icon: devicon('git/git-original') },
  { name: 'GitHub', icon: devicon('github/github-original') },
  { name: 'Postman', icon: devicon('postman/postman-original') },
  { name: 'IntelliJ IDEA', icon: devicon('intellij/intellij-original') },
  { name: 'VS Code', icon: devicon('vscode/vscode-original') },
  { name: 'Maven', icon: devicon('maven/maven-original') },
]

// Proyectos de código. cover: imagen, o un diagrama de arquitectura dibujado en Sections.jsx
export const projects = [
  {
    slug: 'monpoint',
    name: 'MonPoint',
    subtitle: 'Point of sale: monolith to microservices',
    team: 'Team of 3 · I own auth and the shared infrastructure',
    date: 'Sep 2026 – present',
    status: 'In progress',
    summary: 'Re-engineering a JavaFX point-of-sale app into six event-driven Spring Boot services.',
    tags: ['Java 21', 'Spring Boot', 'Spring Security', 'JWT', 'RabbitMQ', 'MongoDB', 'Eureka', 'API Gateway', 'Docker'],
    cover: { diagram: 'monpoint' },
    photos: [],
    sections: [
      {
        title: 'What I built',
        points: [
          'ms-auth, complete: stateless login with Spring Security and JWT, roles, password rules, an audit trail and auth events published to RabbitMQ. Errors follow RFC 9457. Covered by 68 automated tests and a 21/21 Postman suite.',
          'The Eureka service registry and the API Gateway that makes every service reachable. The gateway validates the JWT locally, with no session state.',
          'The Docker Compose setup that brings the whole system up with one command.',
        ],
      },
      {
        title: 'How it works',
        text: 'Six domain services (auth, inventory, sales, customers, reports and notifications), each with its own MongoDB database. No service calls another over HTTP: they publish and react to RabbitMQ events, which is why a sale is accepted as pending and confirmed afterwards. The browser only talks to the gateway. It replaces a JavaFX 21 + Hibernate + MariaDB desktop monolith.',
      },
    ],
    links: { code: 'https://github.com/MopGEN/MonPoint' },
  },
  {
    slug: 'mora',
    name: 'Mora',
    subtitle: 'Personal finance for interest-free installments',
    team: 'Solo project',
    date: 'Nov 2025 – present',
    summary: 'Know in three seconds how much you pay this month and when your card closes, without connecting your bank.',
    tags: ['Python', 'FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL', 'React', 'Vite', 'Docker'],
    cover: { src: '/media/mora/cover.webp', alt: 'Mora landing page: "Cada corte, en calma."' },
    photos: [
      { src: '/media/mora/1.webp', alt: 'Mora landing page with a watercolor valley' },
      { src: '/media/mora/2.webp', alt: 'Feature cards: cut-off date, installments and separate spaces' },
      { src: '/media/mora/3.webp', alt: 'Installment simulator: 12 payments of $1,000 MXN' },
    ],
    sections: [
      {
        title: 'What I built',
        points: [
          'The whole product, solo: a FastAPI + PostgreSQL backend with Alembic migrations and tests, and a React front end.',
          'One headline number: how much you pay this month, how it changed from last month and how many days are left until your cut-off date.',
          'Interest-free installments tracked month by month ("payment 3 of 12"), a simulator that shows the payment before you buy, CSV export and separate spaces for personal, home or trip expenses.',
        ],
      },
      {
        title: 'How it works',
        text: "Every amount is computed on the server with decimal arithmetic and banker's rounding, never floating point. Privacy by design: no bank credentials or card numbers are ever requested, and each space is isolated to its members.",
      },
    ],
    links: {},
  },
  {
    slug: 'mychangarro',
    name: 'MyChangarro',
    subtitle: 'Local businesses, online',
    team: 'Team project · contributor',
    date: 'Nov 2025',
    summary: 'A web platform that gives Mexican neighborhood businesses a digital profile, photos, reviews and discovery by category.',
    tags: ['React', 'React Router', 'Flask', 'Python', 'MySQL', 'Cloudinary', 'Vercel'],
    cover: { title: 'MyChangarro', kicker: 'Local businesses, online', tone: 'gold' },
    photos: [],
    sections: [
      {
        title: 'What I built',
        points: [
          'Login validation for usernames and passwords, a show-password toggle and fixes to error handling.',
          'Fixes to the profile shown after signing in.',
        ],
      },
      {
        title: 'How it works',
        text: 'Owners create a business profile with hours, contact details and a photo gallery; customers browse by category, leave reviews and save favorites. React front end, Flask API with MySQL, images on Cloudinary.',
      },
    ],
    links: { code: 'https://github.com/HugoTrejo13/mychangarro' },
  },
  {
    slug: 'sea',
    name: 'SEA',
    subtitle: 'Academic evidence platform · Universidad de Guadalajara',
    team: 'Team project · contributor',
    date: 'Oct 2026 – present',
    status: 'In progress',
    summary: 'Microservices platform that models the university hierarchy and collects and validates teaching evidence for accreditation.',
    tags: ['Java 21', 'Spring Boot', 'Spring Cloud Gateway', 'Eureka', 'Config Server', 'JWT', 'React 19', 'TypeScript', 'SOAP'],
    cover: { diagram: 'sea' },
    photos: [],
    sections: [
      {
        title: 'What I built',
        points: [
          'A cross-service fix: Academic Structure now checks with Auth that a person actually holds the right post before naming them to a presidency, department head or direction.',
          'The internal Auth endpoint and the client that calls it, with a dedicated error when Auth is unavailable.',
        ],
      },
      {
        title: 'How it works',
        text: 'Three Spring Boot services (Auth & Roles, Academic Structure and Evidence Manager) behind Spring Cloud Gateway, with Eureka discovery and a central Config Server. Auth validates university credentials against SIIAU over SOAP and issues JWT access and refresh tokens. No institutional data is shown here.',
      },
    ],
    links: {},
  },
  {
    slug: 'portfolio',
    name: 'This portfolio',
    subtitle: 'A Green Hill planet in the browser',
    team: 'Solo project',
    date: '2026',
    summary: 'React + Three.js portfolio with a low-poly Green Hill planet built entirely in code, with Sonic, Eggman and collectible rings.',
    tags: ['React', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Vite', 'Vercel'],
    cover: { src: '/media/portfolio/cover.webp', alt: 'Portfolio hero with the Green Hill planet' },
    photos: [{ src: '/media/portfolio/1.webp', alt: 'Portfolio hero with the Green Hill planet' }],
    sections: [
      {
        title: 'What I built',
        points: [
          'A procedural planet: 720 terrain tiles with checkered cliffs, palms, flowers and a spiral loop, merged into a single draw call.',
          'Sonic with an articulated run cycle that follows a track through the loop, jumps the cliffs and collects rings that feed the HUD.',
          'A canvas sky with twinkling stars and a comet. Rendering pauses off-screen and everything respects reduced motion.',
        ],
      },
    ],
    links: { code: 'https://github.com/HugoTrejo13/eliezer-trejo', demo: 'https://eliezertrejo.lat' },
  },
]

// Logros presentados en eventos (con fotos). Agregar uno = un objeto aquí + fotos en public/media/<slug>/
export const achievements = [
  {
    slug: 'hpe-innovation-challenge',
    name: 'HPE Innovation Challenge 2026',
    subtitle: 'Stock Rotation Automation',
    badge: 'TOP 6',
    date: 'May 2026',
    summary: 'Top 6 finalist with a VBA tool that turned a 5-hour SAP workflow into under 3 minutes.',
    tags: ['Excel VBA', 'SAP S/4HANA', 'Automation'],
    cover: { title: 'TOP 6', kicker: 'HPE Innovation Challenge 2026', tone: 'blue' },
    photos: [],
    sections: [
      {
        title: 'What I did',
        text: "Built an Excel VBA tool that parses SAP S/4HANA sales and billing reports (VA05, VF05) and computes CAP balances for HPE's AMS-region distributors automatically.",
      },
      {
        title: 'How it went',
        text: 'It cut a 5-hour manual workflow to under 3 minutes (97% faster) and reached the final round as one of the top 6 teams.',
      },
    ],
    links: {},
  },
]
