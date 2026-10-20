import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { profile, nav } from './data.js'
import Sections from './Sections.jsx'

const Planet = lazy(() => import('./Planet.jsx'))

// Cielo nocturno en un canvas: estrellas que titilan y un cometa cada 20 s
function Sky() {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const tints = ['255,255,255', '207,220,255', '255,240,204']
    let stars = []
    let w = 0
    let h = 0
    let raf = 0
    let last = 0

    const resize = () => {
      if (canvas.clientWidth === w && canvas.clientHeight === h) return
      const dpr = Math.min(devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = Array.from({ length: Math.min(350, Math.round((w * h) / 5500)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() ** 2 * 0.9,
        a: 0.3 + Math.random() * 0.6,
        speed: 0.6 + Math.random() * 1.9,
        phase: Math.random() * 6.28,
        tint: tints[Math.floor(Math.random() * 3)],
        glint: Math.random() < 0.06,
      }))
      if (still) draw(0)
    }

    // Pseudoaleatorio por número de cometa: cada uno sale de un lugar distinto
    const rnd = (n, salt) => {
      const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453
      return x - Math.floor(x)
    }

    const comet = (t) => {
      const n = Math.floor((t - 6) / 20)
      const k = (t - 6 - n * 20) / 1.6
      if (t < 6 || k > 1) return
      // Nace en la parte alta derecha y baja en diagonal hacia la izquierda, siempre dentro de la pantalla
      const angle = 0.45 + rnd(n, 1) * 0.35
      const dx = -Math.cos(angle)
      const dy = Math.sin(angle)
      const dist = Math.min(w, h) * 0.9
      const x = w * (0.55 + rnd(n, 2) * 0.4) + dx * dist * k
      const y = h * (0.08 + rnd(n, 3) * 0.22) + dy * dist * k
      const tail = (w < 768 ? 120 : 180) * (1 - 0.3 * k)
      const fade = Math.sin(k * Math.PI)
      const grad = ctx.createLinearGradient(x, y, x - dx * tail, y - dy * tail)
      grad.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`)
      grad.addColorStop(1, 'rgba(160,200,255,0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - dx * tail, y - dy * tail)
      ctx.stroke()
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 7)
      glow.addColorStop(0, `rgba(255,255,255,${fade})`)
      glow.addColorStop(1, 'rgba(160,200,255,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, 6.283)
      ctx.fill()
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        // Titileo: un pulso lento con un parpadeo rápido encima, como las estrellas reales
        const tw = still ? 1 : (0.55 + 0.45 * Math.sin(t * s.speed + s.phase)) * (0.85 + 0.15 * Math.sin(t * s.speed * 3.7 + s.phase * 2))
        ctx.fillStyle = `rgba(${s.tint},${s.a * tw})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 6.283)
        ctx.fill()
        if (s.glint && tw > 0.85) {
          const len = 3 + s.r * 4
          ctx.strokeStyle = `rgba(${s.tint},${(s.a * (tw - 0.85)) / 0.15})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(s.x - len, s.y)
          ctx.lineTo(s.x + len, s.y)
          ctx.moveTo(s.x, s.y - len)
          ctx.lineTo(s.x, s.y + len)
          ctx.stroke()
        }
      }
      if (!still) comet(t)
    }

    const loop = (ms) => {
      raf = requestAnimationFrame(loop)
      if (ms - last < 33) return // ~30 fps es suficiente para un fondo
      last = ms
      draw(ms / 1000)
    }

    resize()
    addEventListener('resize', resize)
    if (!still) raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="stars" aria-hidden="true" />
}

const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'

// Modo Super: Konami code con teclado o 7 toques seguidos a RINGS (celular). Se repite para apagarlo
function useSuper() {
  const [toggles, setToggles] = useState(0)
  const on = toggles % 2 === 1
  const toggle = useCallback(() => setToggles((n) => n + 1), [])

  useEffect(() => {
    let keys = []
    const onKey = (e) => {
      if (e.target.matches?.('input, textarea')) return
      keys = [...keys, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-10)
      if (keys.join() === KONAMI) {
        keys = []
        toggle()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [toggle])

  // El acento de todo el sitio pasa a dorado (clase .super en index.css)
  useEffect(() => {
    document.documentElement.classList.toggle('super', on)
  }, [on])

  // Chispas doradas que siguen al mouse
  useEffect(() => {
    if (!on || !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    let last = 0
    const onMove = (e) => {
      if (e.timeStamp - last < 40) return
      last = e.timeStamp
      const spark = document.createElement('span')
      spark.className = 'spark'
      spark.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.random() * 40 - 20}px;--dy:${10 + Math.random() * 30}px`
      spark.onanimationend = () => spark.remove()
      document.body.append(spark)
    }
    addEventListener('pointermove', onMove)
    return () => removeEventListener('pointermove', onMove)
  }, [on])

  return { on, toggles, toggle }
}

const pad = (n, size = 3) => String(n).padStart(size, '0')
const clock = (s) => `${Math.floor(s / 60)}:${pad(s % 60, 2)}`

function Hud({ rings, onSuper }) {
  const [seconds, setSeconds] = useState(0)
  const taps = useRef({ n: 0, last: 0 })
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // 7 toques seguidos (las 7 Chaos Emeralds) activan el modo Super
  const tap = (e) => {
    const t = taps.current
    t.n = e.timeStamp - t.last < 800 ? t.n + 1 : 1
    t.last = e.timeStamp
    if (t.n === 7) {
      t.n = 0
      onSuper()
    }
  }

  return (
    <div className="flex items-center gap-4 font-pixel text-[0.5625rem] sm:gap-6 sm:text-[0.625rem]" aria-hidden="true">
      <span onClick={tap} className="-my-2 touch-manipulation py-2 select-none"><span className="text-gold">RINGS</span> {pad(rings)}</span>
      <span><span className="text-gold">TIME</span> {clock(seconds)}</span>
      <span className="flex items-center gap-2 text-grass">
        <span className="blink inline-block size-2 rounded-full bg-grass" />
        <span className="hidden sm:inline">{profile.status.toUpperCase()}</span>
      </span>
    </div>
  )
}

function Navbar({ rings, onSuper }) {
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
        <Hud rings={rings} onSuper={onSuper} />
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

// En pantallas grandes (xl) el planeta ocupa todo el alto bajo el header y su columna llega al borde derecho, como en el de César
function Hero({ onCollect, superMode }) {
  return (
    <section
      id="top"
      className="relative mx-auto grid min-h-svh max-w-6xl items-center gap-8 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] xl:max-w-none xl:grid-cols-[36rem_1fr] xl:pt-24 xl:pr-0 xl:pb-0 xl:pl-[calc(50%-34.5rem)]"
    >
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
            <a href={profile.cv} download className="py-3 text-sm font-medium sm:px-2 text-muted underline-offset-4 hover:text-ink hover:underline">Download CV</a>
          </div>
        </div>
      </div>

      <div
        className="planet-glow relative -mx-4 h-[24rem] sm:-mx-6 sm:h-[28rem] lg:h-[36rem] xl:mx-0 xl:h-[calc(100svh-6rem)] xl:min-h-[30rem]"
        role="img"
        aria-label="Low-poly Green Hill planet with golden rings in orbit. Click a ring to collect it."
      >
        <Suspense
          fallback={
            <div className="grid h-full place-items-center" style={{ perspective: 600 }}>
              <img src="/favicon.svg" alt="" className="ring-spin size-24" />
            </div>
          }
        >
          <Planet onCollect={onCollect} superMode={superMode} />
        </Suspense>
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

// Resorte de Sonic: aparece al pasar el hero y te regresa arriba
function Spring() {
  const [show, setShow] = useState(false)
  const [jumps, setJumps] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting))
    io.observe(document.getElementById('top'))
    return () => io.disconnect()
  }, [])

  return (
    <button
      type="button"
      aria-label="Back to top"
      inert={!show}
      onClick={() => {
        setJumps(jumps + 1)
        setTimeout(() => scrollTo({ top: 0 }), 120) // primero se comprime, luego sale disparado
      }}
      className={`spring fixed right-4 bottom-4 z-30 grid size-12 place-items-center rounded-2xl border border-line bg-surface/90 backdrop-blur motion-safe:transition sm:right-6 sm:bottom-6 ${show ? '' : 'translate-y-4 opacity-0'}`}
    >
      <svg key={jumps} viewBox="0 0 32 36" className={`size-8 overflow-visible ${jumps ? 'boing' : ''}`} aria-hidden="true">
        <rect x="5" y="29" width="22" height="6" rx="1.5" fill="#6b7388" />
        <path className="spring-coil" d="M9 28 23 25 9 22 23 19 9 16 23 13" fill="none" stroke="#c9cfdf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <g className="spring-plate">
          <rect x="3" y="6" width="26" height="7" rx="2" fill="#e0242c" />
          <rect x="5" y="7" width="22" height="2" rx="1" fill="#ff7a7f" />
        </g>
      </svg>
    </button>
  )
}

// 404: cualquier otra ruta es GAME OVER, con la cuenta de CONTINUE de Sonic 1
export function GameOver() {
  const [count, setCount] = useState(9)
  useEffect(() => {
    if (count === 0) {
      location.replace('/')
      return
    }
    const id = setTimeout(() => setCount(count - 1), count === 9 ? 2000 : 1000)
    return () => clearTimeout(id)
  }, [count])

  return (
    <>
      <Sky />
      <main className="grid min-h-svh place-items-center overflow-hidden px-4 text-center">
        <div>
          <h1 className="game-over font-pixel text-4xl leading-tight text-gold sm:text-6xl">
            <span>GAME</span> <span>OVER</span>
          </h1>
          <p className="act-clear mt-12 font-pixel text-xs sm:text-sm" style={{ animationDelay: '1s' }}>
            CONTINUE? <span className="text-gold">{count}</span>
          </p>
          <a href="/" className="mt-8 inline-block rounded-xl bg-gold px-6 py-3 font-pixel text-xs text-bg transition hover:brightness-110">
            CONTINUE
          </a>
          <p className="mt-10 text-sm break-all text-muted">
            Page not found: <code>{location.pathname}</code>
          </p>
        </div>
      </main>
      <div className="checker fixed inset-x-0 bottom-0 h-3 opacity-60" aria-hidden="true" />
    </>
  )
}

export default function App() {
  const [rings, setRings] = useState(0)
  const collect = useCallback(() => setRings((r) => r + 1), [])
  const superMode = useSuper()

  return (
    <>
      <Sky />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-gold focus:px-3 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <Navbar rings={rings} onSuper={superMode.toggle} />
      <p role="status" className="pointer-events-none fixed inset-x-0 top-28 z-50 text-center font-pixel text-xs text-gold sm:text-sm">
        {superMode.toggles > 0 && (
          <span key={superMode.toggles} className="toast inline-block rounded-lg border border-gold/40 bg-bg/85 px-4 py-2.5">
            {superMode.on ? 'SUPER MODE!' : 'SUPER MODE OFF'}
          </span>
        )}
      </p>
      <main id="main">
        <Hero onCollect={collect} superMode={superMode.on} />
        <Sections />
      </main>
      <Footer />
      <Spring />
    </>
  )
}
