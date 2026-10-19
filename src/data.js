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
  highlights: ['AWS Certified Cloud Practitioner', 'HPE Innovation Challenge Top 6', 'GPA 94/100'],
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
]

export const about = {
  summary: [
    "I'm a Computer Science Engineering student at Universidad de Guadalajara, focused on the parts of software people don't see: APIs, services and the infrastructure they run on.",
    'At iNBest I helped deliver 8+ client projects across 4 teams, so I know how to keep work moving and talk to technical and non-technical people alike. Now I want to bring that ownership to backend engineering.',
  ],
  services: [
    { title: 'Backend development', text: 'REST APIs and microservices with Java, Spring Boot and Spring Security.' },
    { title: 'Cloud & infrastructure', text: 'AWS, Azure, Docker and Linux. AWS Certified Cloud Practitioner.' },
    { title: 'Data & databases', text: 'PostgreSQL, MySQL, MongoDB and Power BI dashboards.' },
    { title: 'Agile delivery', text: 'Scrum, Azure DevOps backlogs and sprint planning from my PMO work.' },
  ],
}

export const experience = [
  {
    kind: 'work',
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
    kind: 'school',
    title: 'B.S. Computer Science Engineering',
    org: 'Universidad de Guadalajara — CUTONALÁ',
    date: '2024 – 2027',
    place: 'Guadalajara, Mexico',
    points: ['GPA 94.13/100 · 6th semester · Expected graduation December 2027.'],
  },
]

export const projects = [
  {
    name: 'MonPoint',
    subtitle: 'POS monolith to microservices',
    status: 'In progress',
    tags: ['Java', 'Spring Boot', 'Spring Security', 'JWT', 'RabbitMQ', 'MongoDB', 'Eureka', 'API Gateway'],
    problem: 'A point-of-sale monolith where authentication, sales and reporting live in one deployable.',
    solution: 'A stateless auth service (Spring Security, JWT, RBAC) and an event-driven reporting service that consumes RabbitMQ sales and inventory events into MongoDB, both registered in Eureka behind an API Gateway.',
    impact: 'Auth and reporting run and scale as independent services, and reports are built from events instead of queries against the sales database.',
    links: {},
  },
  {
    name: 'HPE Stock Rotation Automation',
    subtitle: 'Top 6 Finalist, HPE Innovation Challenge 2026',
    status: 'May 2026',
    tags: ['Excel VBA', 'SAP S/4HANA'],
    problem: 'Computing CAP balances for AMS-region distributors took about 5 hours of manual work over SAP reports.',
    solution: 'A VBA tool that parses SAP S/4HANA reports (VA05, VF05) and computes the balances automatically.',
    impact: 'From 5 hours to under 3 minutes: 97% faster.',
    links: {},
  },
  {
    name: 'This portfolio',
    subtitle: 'A Green Hill planet in the browser',
    status: '2026',
    tags: ['React', 'Three.js', 'Tailwind CSS', 'Vercel'],
    problem: 'I wanted a portfolio that shows how I build, not only a list of what I have built.',
    solution: 'A single-page React app with a low-poly planet built in code with Three.js, and all content in one data file.',
    impact: 'A handful of source files, deployed on Vercel on every push.',
    links: { code: 'https://github.com/HugoTrejo13/eliezer-trejo' },
  },
]

export const stack = [
  { group: 'Languages', items: ['Java', 'Python', 'SQL'] },
  { group: 'Frameworks & APIs', items: ['Spring Boot', 'Spring Security', 'Spring Cloud', 'REST APIs', 'Flask', 'FastAPI'] },
  { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB'] },
  { group: 'Cloud & infrastructure', items: ['AWS', 'Azure', 'Docker', 'Linux', 'Git', 'GitHub'] },
  { group: 'Project & data tools', items: ['Azure DevOps', 'MS Project', 'SharePoint', 'Power Automate', 'Power BI'] },
  { group: 'Developer tools', items: ['IntelliJ IDEA', 'VS Code', 'Postman', 'Maven', 'Claude Code'] },
]

// Chaos Emeralds: 6 certificaciones + 1 por conseguir
export const emeralds = [
  { color: '#3ddc6a', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Valid through Feb 2029', done: true },
  { color: '#2f6bff', name: 'Scrum Fundamentals Certified', issuer: 'SCRUMstudy', date: 'Completed', done: true },
  { color: '#a35bff', name: 'Claude Code in Action', issuer: 'Anthropic', date: 'Completed', done: true },
  { color: '#ffd93c', name: 'Google Prompting Essentials', issuer: 'Google', date: 'Jun 2026', done: true },
  { color: '#ff4d5e', name: 'MongoDB Java Developer Path', issuer: 'MongoDB University', date: 'Est. Dec 2026', done: false },
  { color: '#3de0e8', name: 'Master Microservices with Spring Boot & Spring Cloud', issuer: 'Udemy', date: 'Est. Dec 2026', done: false },
  { color: '#c9cfdf', name: '???', issuer: 'The next one', date: '', done: false, unknown: true },
]
