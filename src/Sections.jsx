import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { about, achievements, education, emeralds, experience, profile, projects, stack } from './data.js'

const Goal = lazy(() => import('./Goal.jsx'))
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

// Se vuelve true la primera vez que el elemento entra en pantalla
function useSeen(ref) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setSeen(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [ref])
  return seen
}

// --- Íconos en línea (sin librerías) ---

const PATHS = {
  server: <><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><path d="M8 7h.01M8 17h.01" /></>,
  cloud: <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.3 4.4 4.4 0 0 0 7 18z" />,
  database: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
  board: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16M5.5 8h1.5M11.5 8h1.5M11.5 11h1.5M17.5 8h1" /></>,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  left: <path d="M15 5l-7 7 7 7" />,
  right: <path d="M9 5l7 7-7 7" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
}
const FILLED = {
  github: 'M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z',
  linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z',
}
function Icon({ name, className = 'size-5' }) {
  if (FILLED[name]) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={FILLED[name]} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}

// Encabezado al estilo César: rótulo chico (aquí en pixel) + título grande con punto
function Heading({ zone, title, children, center }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="font-pixel text-[10px] text-grass sm:text-[11px]">{zone}</p>
      <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
      {children && <p className={`mt-5 max-w-3xl leading-relaxed text-muted ${center ? 'mx-auto' : ''}`}>{children}</p>}
    </div>
  )
}

const Section = ({ id, children, className = '' }) => (
  <section id={id} className={`mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 ${className}`}>
    {children}
  </section>
)

// --- About ---

function About() {
  return (
    <Section id="about">
      <Heading zone="ABOUT ZONE · ACT 1" title="Overview." />
      {about.summary.map((p) => (
        <p key={p.slice(0, 20)} className="mt-5 max-w-3xl leading-relaxed text-muted">
          {p}
        </p>
      ))}
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {about.services.map((s) => (
          <li key={s.title} className="tilt rounded-2xl bg-gradient-to-br from-gold/70 via-grass/40 to-sonic/50 p-px">
            <div className="flex h-full flex-col items-center rounded-2xl bg-surface px-6 py-8 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-bg text-gold">
                <Icon name={s.icon} className="size-7" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// --- Experience: línea de tiempo con postes de checkpoint ---

// Poste de checkpoint de Sonic: la bola azul gira y se pone roja cuando lo "pasas"
function StarPost({ on }) {
  return (
    <svg viewBox="0 0 40 64" className="h-16 w-10" aria-hidden="true">
      <rect x="17.5" y="18" width="5" height="38" rx="2" fill="#2f6bff" />
      <rect x="11" y="55" width="18" height="6" rx="2" fill="#c9cfdf" />
      <g className={on ? 'starpost-on' : ''} style={{ transformOrigin: '20px 12px' }}>
        <circle cx="20" cy="12" r="9" fill={on ? '#ff4d5e' : '#5b8cff'} />
        <circle cx="17" cy="9" r="3" fill="#fff" opacity="0.55" />
      </g>
    </svg>
  )
}

function Job({ job, index }) {
  const ref = useRef()
  const seen = useSeen(ref)
  const left = index % 2 === 0
  const card = (
    <div className="rounded-2xl border-b-4 border-gold bg-surface p-6 shadow-lg shadow-black/20">
      <h3 className="text-xl font-bold">{job.title}</h3>
      <p className="mt-1 font-medium text-grass">{job.org}</p>
      <p className="mt-1 text-sm text-muted md:hidden">{job.date}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/85 marker:text-gold">
        {job.points.map((p) => (
          <li key={p.slice(0, 24)}>{p}</li>
        ))}
      </ul>
    </div>
  )
  const date = <p className="hidden pt-5 text-sm font-medium text-muted md:block">{job.date}</p>
  return (
    <li ref={ref} className="relative grid gap-x-8 pl-14 md:grid-cols-[1fr_auto_1fr] md:pl-0">
      <div className={left ? '' : 'md:text-right'}>{left ? card : date}</div>
      <div className="absolute top-0 left-0 md:static">
        <StarPost on={seen} />
      </div>
      <div>{left ? date : card}</div>
    </li>
  )
}

function Experience() {
  return (
    <Section id="experience">
      <Heading zone="WORK ZONE · ACT 2" title="Experience." center />
      <ol className="relative mt-14 space-y-12">
        <span className="absolute top-2 bottom-0 left-5 w-[3px] -translate-x-1/2 rounded bg-gradient-to-b from-gold via-line to-transparent md:left-1/2" aria-hidden="true" />
        {experience.map((job, i) => (
          <Job key={job.org} job={job} index={i} />
        ))}
      </ol>
    </Section>
  )
}

// --- Education: panel como el de César ---

function Education() {
  return (
    <Section id="education">
      <div className="grid items-center gap-10 rounded-3xl border border-line bg-surface/60 p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
        <Heading zone="SCHOOL ZONE · ACT 3" title="Education.">
          Where I'm learning the fundamentals, between work and side projects.
        </Heading>
        <ul className="grid gap-5">
          {education.map((e) => (
            <li key={e.degree} className="flex flex-col rounded-2xl bg-bg/70 p-6">
              <h3 className="text-xl leading-snug font-semibold">{e.degree}</h3>
              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    <span className="text-grass">@</span> {e.school}
                  </p>
                  <p className="text-sm text-muted">
                    Campus {e.campus} · {e.date}
                  </p>
                </div>
                <img src="/favicon.svg" alt="" className="size-10 flex-none" />
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {e.details.map((d) => (
                  <li key={d} className="rounded-full border border-line px-3 py-1 text-xs text-ink/90">
                    {d}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

// --- Stack: monitores de item ---

function Stack() {
  return (
    <Section id="stack">
      <Heading zone="TECH ZONE" title="Stack." center />
      <ul className="mt-14 grid grid-cols-3 justify-items-center gap-x-4 gap-y-10 sm:grid-cols-5 lg:grid-cols-7">
        {stack.map((t) => (
          <li key={t.name} className="monitor flex flex-col items-center gap-3 text-center">
            <div className="monitor-box">
              <div className="monitor-screen">
                <img src={t.icon} alt="" loading="lazy" width="48" height="48" />
              </div>
            </div>
            <span className="text-sm text-ink/90">{t.name}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// --- Portadas: imagen, diagrama de arquitectura o título ---

const BOX = { fill: '#1c2547', stroke: '#33407a' }
const MINE = { fill: 'rgba(255,201,60,0.16)', stroke: '#ffc93c' }

function Node({ x, y, w = 64, h = 26, label, mine, small }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" strokeWidth="1.5" {...(mine ? MINE : BOX)} />
      <text x={x + w / 2} y={y + h / 2 + 3.5} textAnchor="middle" fontSize={small ? 8.5 : 10} fontWeight="600" fill={mine ? '#ffe08a' : '#e9edf7'}>
        {label}
      </text>
    </g>
  )
}

const DIAGRAMS = {
  // MonPoint: navegador → gateway → 6 servicios con su Mongo, unidos por eventos en RabbitMQ
  monpoint: () => {
    const services = ['auth', 'stock', 'sales', 'clients', 'reports', 'alerts']
    return (
      <>
        <Node x={12} y={14} label="Browser" />
        <Node x={128} y={14} label="Gateway" mine />
        <Node x={244} y={14} label="Eureka" mine />
        <path d="M76 27h52" stroke="#8e97b5" strokeWidth="1.5" />
        <path d="M160 40v20M34 60h252" stroke="#8e97b5" strokeWidth="1.2" strokeDasharray="3 3" />
        {services.map((s, i) => {
          const x = 12 + i * 50
          return (
            <g key={s}>
              <path d={`M${x + 22} 60v18M${x + 22} 112v38`} stroke={i ? '#8e97b5' : '#ffc93c'} strokeWidth="1.2" />
              <Node x={x} y={78} w={44} h={34} label={s} mine={i === 0} small />
            </g>
          )
        })}
        <rect x="12" y="150" width="296" height="18" rx="9" fill="rgba(47,107,255,0.25)" stroke="#2f6bff" />
        <text x="160" y="162.5" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#cfdcff">
          RabbitMQ · events · MongoDB per service
        </text>
        <rect x="134" y="180" width="8" height="8" rx="2" {...MINE} />
        <text x="148" y="187.5" fontSize="8.5" fill="#ffe08a">my part</text>
      </>
    )
  },
  // SEA: navegador → gateway → 3 servicios; mi arreglo es la consulta de Academic Structure a Auth
  sea: () => (
    <>
      <Node x={12} y={14} w={70} label="React 19" />
      <Node x={125} y={14} w={70} label="Gateway" />
      <Node x={238} y={8} w={70} h={18} label="Eureka" small />
      <Node x={238} y={30} w={70} h={18} label="Config" small />
      <path d="M82 27h43" stroke="#8e97b5" strokeWidth="1.5" />
      <path d="M160 40v16M62 56h196M62 56v14M160 56v14M258 56v14" stroke="#8e97b5" strokeWidth="1.2" strokeDasharray="3 3" />
      <Node x={20} y={70} w={84} h={34} label="Auth & Roles" small />
      <Node x={118} y={70} w={84} h={34} label="Academic" small />
      <Node x={216} y={70} w={84} h={34} label="Evidence" small />
      <path d="M160 104v18H62v-14" stroke="#ffc93c" strokeWidth="2" fill="none" />
      <path d="M58 112l4-6 4 6" stroke="#ffc93c" strokeWidth="2" fill="none" />
      <text x="111" y="136" textAnchor="middle" fontSize="9" fontWeight="600" fill="#ffe08a">
        post check · my fix
      </text>
      <path d="M30 104v46M258 104v46" stroke="#8e97b5" strokeWidth="1.2" />
      <Node x={12} y={150} w={92} label="SIIAU · SOAP" small />
      <Node x={216} y={150} w={92} label="PDF evidence" small />
    </>
  ),
}

function Cover({ item, big }) {
  const c = item.cover
  const shape = big ? 'aspect-video' : 'aspect-[16/10]'
  if (c.src) {
    return <img src={c.src} alt={c.alt} loading="lazy" width="800" height="500" className={`${shape} w-full object-cover object-top`} />
  }
  if (c.diagram) {
    const Diagram = DIAGRAMS[c.diagram]
    return (
      <svg viewBox="0 0 320 200" className={`${shape} w-full bg-[#0b1126]`} role="img" aria-label={`${item.name} architecture diagram`}>
        <Diagram />
      </svg>
    )
  }
  const tones = { gold: 'from-soil-dark via-soil to-gold/80', blue: 'from-bg via-sonic/60 to-grass/50' }
  return (
    <div className={`${shape} relative flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${tones[c.tone]} text-center`}>
      <p className="font-pixel text-[9px] text-ink/85">{c.kicker}</p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink drop-shadow sm:text-4xl">{c.title}</p>
      <div className="checker absolute inset-x-0 bottom-0 h-3 opacity-70" />
    </div>
  )
}

// --- Tarjetas de Projects y Achievements (toda la tarjeta abre el pop-up) ---

const TAG_COLORS = ['#3ddc6a', '#7aa7ff', '#ffc93c', '#ff8fc4']

function Card({ item, onOpen }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-surface p-4 transition duration-200 hover:-translate-y-1 hover:border-gold/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
      <div className="relative overflow-hidden rounded-xl">
        <Cover item={item} />
        {item.badge && <span className="absolute top-3 left-3 rounded bg-gold px-2 py-1 font-pixel text-[10px] text-bg">{item.badge}</span>}
        {item.status && <span className="absolute bottom-3 left-3 rounded bg-bg/85 px-2 py-1 text-[11px] font-medium text-grass">{item.status}</span>}
        {item.links.code && (
          <a
            href={item.links.code}
            target="_blank"
            rel="noreferrer"
            aria-label={`${item.name} source code on GitHub`}
            className="absolute right-3 bottom-3 z-10 grid size-10 place-items-center rounded-full bg-bg/85 text-ink transition hover:text-gold"
          >
            <Icon name="github" />
          </a>
        )}
      </div>
      <h3 className="mt-4 text-xl font-bold">
        <button type="button" onClick={() => onOpen(item)} className="text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {item.name}
        </button>
      </h3>
      <p className="mt-1 text-sm font-medium text-grass/90">{item.subtitle}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 text-[13px]">
        {item.tags.slice(0, 5).map((t, k) => (
          <li key={t} style={{ color: TAG_COLORS[k % TAG_COLORS.length] }}>
            #{t.toLowerCase().replace(/[^a-z0-9]/g, '')}
          </li>
        ))}
      </ul>
    </article>
  )
}

function Projects({ onOpen }) {
  return (
    <Section id="projects">
      <Heading zone="PROJECT ZONE" title="Projects.">
        Code I have written: microservices, full-stack apps and this site. Some repositories are private or belong to a team; each card says what part was mine. Open a card to see how it works.
      </Heading>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.slug} item={p} onOpen={onOpen} />
        ))}
      </div>
    </Section>
  )
}

function Achievements({ onOpen }) {
  return (
    <Section id="achievements">
      <Heading zone="ACHIEVEMENT ZONE" title="Achievements.">
        Challenges and hackathons where I built something and presented it. Open a card for the story.
      </Heading>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <Card key={a.slug} item={a} onOpen={onOpen} />
        ))}
      </div>
    </Section>
  )
}

// --- Pop-up de detalle: <dialog> nativo (Esc, foco y clic fuera) ---

function Gallery({ item }) {
  const track = useRef()
  const [index, setIndex] = useState(0)
  const photos = item.photos
  if (!photos.length) return <Cover item={item} big />

  const go = (step) => {
    const el = track.current
    const next = Math.max(0, Math.min(photos.length - 1, index + step))
    el.scrollTo({ left: el.clientWidth * next, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((p) => (
          <img key={p.src} src={p.src} alt={p.alt} loading="lazy" className="aspect-video w-full flex-none snap-center object-cover object-top" />
        ))}
      </div>
      {photos.length > 1 && (
        <>
          {[
            ['left', -1, 'left-3'],
            ['right', 1, 'right-3'],
          ].map(([icon, step, side]) => (
            <button
              key={icon}
              type="button"
              onClick={() => go(step)}
              aria-label={step < 0 ? 'Previous photo' : 'Next photo'}
              className={`absolute top-1/2 ${side} hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/80 text-ink transition hover:text-gold sm:grid`}
            >
              <Icon name={icon} />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {photos.map((p, i) => (
              <span key={p.src} className={`size-2 rounded-full ${i === index ? 'bg-gold' : 'bg-ink/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Detail({ item, onClose }) {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current.open) ref.current.showModal()
  }, [])
  const close = () => ref.current.close()
  const meta = [item.team, item.date].filter(Boolean).join(' · ')

  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && close()} className="detail" aria-labelledby="detail-title">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-bg/95 px-5 py-3 backdrop-blur">
        <p className="font-pixel text-[9px] text-grass">{item.badge ? `${item.badge} · ` : ''}ACT DETAILS</p>
        <button type="button" onClick={close} aria-label="Close" className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-ink">
          <Icon name="close" />
        </button>
      </div>
      <Gallery item={item} />
      <div className="p-5 sm:p-8">
        <h2 id="detail-title" className="text-3xl font-extrabold tracking-tight">
          {item.name}
        </h2>
        <p className="mt-1 font-medium text-grass">{item.subtitle}</p>
        {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
        {item.sections.map((s) => (
          <div key={s.title} className="mt-7">
            <h3 className="font-pixel text-[10px] text-gold">{s.title.toUpperCase()}</h3>
            {s.text && <p className="mt-3 leading-relaxed text-ink/85">{s.text}</p>}
            {s.points && (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink/85 marker:text-gold">
                {s.points.map((p) => (
                  <li key={p.slice(0, 24)}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <ul className="mt-7 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-ink/90">
              {t}
            </li>
          ))}
        </ul>
        {(item.links.code || item.links.demo) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {item.links.code && (
              <a href={item.links.code} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 font-semibold text-bg transition hover:brightness-110">
                <Icon name="github" /> View code
              </a>
            )}
            {item.links.demo && (
              <a href={item.links.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 font-semibold transition hover:border-grass hover:text-grass">
                <Icon name="external" /> Live site
              </a>
            )}
          </div>
        )}
      </div>
    </dialog>
  )
}

// --- Chaos Emeralds: las 7 certificaciones ---

// Mezcla un color hex con blanco (t > 0) o negro (t < 0)
function shade(hex, t) {
  const n = parseInt(hex.slice(1), 16)
  const target = t > 0 ? 255 : 0
  const mix = (c) => Math.round(c + (target - c) * Math.abs(t))
  return `rgb(${mix(n >> 16)},${mix((n >> 8) & 255)},${mix(n & 255)})`
}

function Gem({ color }) {
  const facets = [
    ['14,6 46,6 44,9 16,9', 0.55],
    ['16,9 44,9 50,21 10,21', 0.3],
    ['14,6 16,9 10,21 2,22', 0],
    ['46,6 58,22 50,21 44,9', -0.35],
    ['2,22 10,21 30,60', -0.1],
    ['10,21 50,21 30,60', 0.12],
    ['50,21 58,22 30,60', -0.45],
  ]
  return (
    <svg viewBox="0 0 60 64" className="h-16 w-14 sm:h-20 sm:w-[4.4rem]" aria-hidden="true">
      {facets.map(([pts, t]) => (
        <polygon key={pts} points={pts} fill={shade(color, t)} stroke={shade(color, -0.55)} strokeWidth="0.8" strokeLinejoin="round" />
      ))}
      <polygon points="19,11 27,11 24,18 16,18" fill="#fff" opacity="0.55" />
    </svg>
  )
}

function Emeralds() {
  const ref = useRef()
  const seen = useSeen(ref)
  const [selected, setSelected] = useState(0)
  const collected = emeralds.filter((e) => e.done).length
  const e = emeralds[selected]

  return (
    <Section id="emeralds">
      <Heading zone="SPECIAL STAGE" title="Chaos Emeralds." center>
        My certifications. {collected} collected, {emeralds.length - collected} more on the way.
      </Heading>
      <div ref={ref} className={seen ? 'emeralds-seen' : ''}>
        <ul className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-5">
          {emeralds.map((gem, i) => (
            <li key={gem.name}>
              <button
                type="button"
                aria-pressed={selected === i}
                aria-label={`${gem.name}, ${gem.issuer}, ${gem.date}`}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
                className={`emerald rounded-xl p-1 transition ${gem.done ? 'is-done' : 'is-pending'} ${selected === i ? 'is-selected' : ''}`}
                style={{ '--gem': gem.color, '--i': i }}
              >
                <Gem color={gem.color} />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center font-pixel text-[10px] text-gold sm:text-[11px]">
          {collected} / {emeralds.length} CHAOS EMERALDS
        </p>
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-surface px-5 py-4 text-center" aria-live="polite">
          <p className="font-semibold">{e.name}</p>
          <p className="mt-1 text-sm text-muted">
            {e.issuer} · <span className={e.done ? 'text-grass' : 'text-gold'}>{e.date}</span>
          </p>
        </div>
      </div>
    </Section>
  )
}

// --- Contact: formulario + letrero de meta 3D ---

function Contact() {
  const [state, setState] = useState('idle')
  const [copied, setCopied] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (data.botcheck) return
    // Sin key de Web3Forms todavía: se abre el correo del visitante con el mensaje listo
    if (!WEB3FORMS_KEY) {
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio: message from ${data.name}`)}&body=${encodeURIComponent(`${data.message}\n\n${data.name} · ${data.email}`)}`
      return
    }
    setState('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: `Portfolio: message from ${data.name}`, from_name: 'eliezertrejo.lat', ...data }),
      })
      if (!(await res.json()).success) throw new Error('Web3Forms rejected the message')
      form.reset()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const field = 'mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none'
  const link = 'inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium transition hover:border-grass hover:text-grass'

  return (
    <Section id="contact" className="grid items-stretch gap-10 lg:grid-cols-2">
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <Heading zone="FINAL ZONE" title="Contact." />
        {state === 'sent' ? (
          <div className="mt-8 rounded-2xl border border-gold/60 bg-bg p-6 text-center" role="status">
            <p className="font-pixel text-[10px] text-ink/80">HUGO GOT THROUGH</p>
            <p className="act-clear mt-3 font-pixel text-xl text-gold sm:text-2xl">ACT CLEAR!</p>
            <p className="mt-4 text-sm text-muted">Thanks for your message. I'll reply to your email soon.</p>
            <button type="button" onClick={() => setState('idle')} className="mt-5 text-sm font-medium text-grass underline-offset-4 hover:underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
            <label className="block text-sm font-medium">
              Your name
              <input name="name" required autoComplete="name" placeholder="What should I call you?" className={field} />
            </label>
            <label className="block text-sm font-medium">
              Your email
              <input name="email" type="email" required autoComplete="email" placeholder="Where can I reply?" className={field} />
            </label>
            <label className="block text-sm font-medium">
              Your message
              <textarea name="message" required rows="5" placeholder="What do you want to build?" className={`${field} resize-y`} />
            </label>
            {state === 'error' && <p className="text-sm text-[#ff7a85]">The message didn't go through. Try again, or email me directly below.</p>}
            <button type="submit" disabled={state === 'sending'} className="rounded-xl bg-gold px-6 py-3 font-semibold text-bg transition hover:brightness-110 disabled:opacity-60">
              {state === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
          <button type="button" onClick={copyEmail} className={link}>
            <Icon name={copied ? 'mail' : 'copy'} className="size-4" /> {copied ? 'Email copied' : profile.email}
          </button>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className={link}>
            <Icon name="linkedin" className="size-4" /> LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" className={link}>
            <Icon name="github" className="size-4" /> GitHub
          </a>
          <a href={profile.cv} download className={link}>
            <Icon name="download" className="size-4" /> Download CV
          </a>
        </div>
      </div>
      <div className="relative h-80 sm:h-96 lg:h-[32rem] lg:self-center" role="img" aria-label="Green Hill goal signpost. It spins when your message is sent.">
        <Suspense fallback={null}>
          <Goal cleared={state === 'sent'} />
        </Suspense>
      </div>
    </Section>
  )
}

export default function Sections() {
  const [open, setOpen] = useState(null)
  return (
    <>
      <About />
      <Experience />
      <Education />
      <Stack />
      <Projects onOpen={setOpen} />
      <Achievements onOpen={setOpen} />
      <Emeralds />
      <Contact />
      {open && <Detail key={open.slug} item={open} onClose={() => setOpen(null)} />}
    </>
  )
}
