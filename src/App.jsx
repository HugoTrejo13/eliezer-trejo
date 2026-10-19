import { useEffect, useState } from 'react'
import { profile, nav } from './data.js'

const pad = (n, size = 3) => String(n).padStart(size, '0')
const clock = (s) => `${Math.floor(s / 60)}:${pad(s % 60, 2)}`

function Hud({ rings }) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-4 font-pixel text-[9px] sm:gap-6 sm:text-[10px]" aria-hidden="true">
      <span><span className="text-gold">RINGS</span> {pad(rings)}</span>
      <span><span className="text-gold">TIME</span> {clock(seconds)}</span>
      <span className="flex items-center gap-2 text-grass">
        <span className="blink inline-block size-2 rounded-full bg-grass" />
        <span className="hidden sm:inline">{profile.status.toUpperCase()}</span>
      </span>
    </div>
  )
}

function Navbar({ rings }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <a href="#top" className="flex items-center gap-2.5 font-bold tracking-tight" onClick={() => setOpen(false)}>
          <img src="/favicon.svg" alt="" className="size-6" />
          {profile.name}
        </a>

        <ul className="hidden items-center gap-7 text-sm text-muted md:flex">
          {nav.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="transition-colors hover:text-ink">{item.label}</a>
            </li>
          ))}
        </ul>

        <button
          className="grid size-11 place-items-center rounded-lg md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      <div className="mx-auto max-w-6xl px-4 pb-2.5 sm:px-6">
        <Hud rings={rings} />
      </div>

      {open && (
        <ul id="mobile-menu" className="border-t border-line bg-bg px-4 py-2 md:hidden">
          {nav.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="block py-3 text-lg" onClick={() => setOpen(false)}>{item.label}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative mx-auto grid min-h-svh max-w-6xl items-center gap-8 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex gap-5">
        <div className="mt-3 hidden flex-col items-center sm:flex" aria-hidden="true">
          <span className="size-4 rounded-full bg-grass" />
          <span className="h-64 w-1 bg-gradient-to-b from-grass to-transparent" />
        </div>

        <div>
          <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Hi, I'm
            <span className="block bg-gradient-to-r from-sonic to-grass bg-clip-text pb-1 text-transparent">{profile.name}</span>
          </h1>
          <p className="mt-4 text-xl font-semibold text-ink sm:text-2xl">{profile.role}</p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{profile.tagline}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {profile.highlights.map((h) => (
              <li key={h} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink/90">{h}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="rounded-xl bg-gold px-5 py-3 font-semibold text-bg transition hover:brightness-110">View projects</a>
            <a href="#contact" className="rounded-xl border border-line px-5 py-3 font-semibold transition hover:border-grass hover:text-grass">Contact me</a>
            <a href={profile.cv} download className="px-2 py-3 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline">Download CV</a>
          </div>
        </div>
      </div>

      {/* Fase 2: aquí va <Planet />. Mientras tanto, el anillo de carga. */}
      <div className="grid h-80 place-items-center sm:h-[28rem] lg:h-[34rem]" style={{ perspective: 600 }} aria-hidden="true">
        <img src="/favicon.svg" alt="" className="ring-spin size-24" />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="checker h-3 opacity-60" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {profile.fullName}. Built with React and Three.js.</p>
        <div className="flex gap-5">
          <a href={profile.github} className="hover:text-ink">GitHub</a>
          <a href={profile.linkedin} className="hover:text-ink">LinkedIn</a>
          <a href={`mailto:${profile.email}`} className="hover:text-ink">Email</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [rings] = useState(0)

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Navbar rings={rings} />
      <main id="main">
        <Hero />
      </main>
      <Footer />
    </>
  )
}
