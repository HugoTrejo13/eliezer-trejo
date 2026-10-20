import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Sonic y Eggman en low-poly con los colores de Sonic 1.
// Fan art hecho con código: no usa sprites, modelos ni audio de SEGA.
// Cada pieza lleva su propio reloj (suma de delta): el de R3F vuelve a 0 cada vez que el canvas se pausa.

const TAU = Math.PI * 2
const BLUE = '#2652c9'
const PEACH = '#f2c79a'
const RED = '#e0242c'
const WHITE = '#f4f6fb'
const BLACK = '#14161c'
const GOLD = '#ffd84d' // Super Sonic

const geo = {
  ico: new THREE.IcosahedronGeometry(1, 1),
  cone: new THREE.ConeGeometry(1, 1, 5),
  limb: new THREE.CylinderGeometry(1, 1, 1, 6),
  disc: new THREE.CylinderGeometry(1, 1, 1, 12),
  box: new THREE.BoxGeometry(1, 1, 1),
  link: new THREE.TorusGeometry(1, 0.3, 4, 8),
}
const mats = {}
const mat = (color, extra) => (mats[color] ??= new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.6, ...extra }))

// Pieza de un modelo: <P g="ico" c={BLUE} p={[x, y, z]} r={[rx, ry, rz]} s={[sx, sy, sz]} />
const P = ({ g, c, m, p, r, s }) => <mesh geometry={geo[g]} material={m ?? mat(c)} position={p} rotation={r} scale={s} />

// --- Anillos (los usan también los anillos en órbita de Planet.jsx) ---

export const ringGeo = new THREE.TorusGeometry(0.12, 0.032, 8, 24)
export const flashGeo = new THREE.OctahedronGeometry(0.16, 0)
export const ringMat = new THREE.MeshStandardMaterial({ color: '#ffc93c', emissive: '#ffae00', emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.3 })

// Animación de un anillo recogido; k = segundos desde que se recogió (Infinity = intacto)
export function ringPop(k, respawn = 6) {
  let scale = 1
  if (k < 0.25) scale = 1 - k / 0.25
  else if (k < respawn) scale = 0
  else if (k < respawn + 0.4) scale = (k - respawn) / 0.4
  const f = Math.min(k / 0.4, 1)
  return { scale: Math.max(scale, 0.0001), done: k >= respawn + 0.4, flash: k < 0.4, flashScale: 0.3 + f * 1.4, flashOpacity: 1 - f, spin: k < 0.25 ? k * 40 : 0 }
}

// --- Sonic ---

const SONIC_SCALE = 0.3
const QUILLS = [
  [0.5, 0.1, 0.36],
  [0.05, -0.02, 0.4],
  [-0.4, -0.13, 0.32],
]

// Esqueleto de Sonic: cada articulación es un <group> que se anima en useFrame
function Runner({ rig }) {
  const bone = (name, i) => (el) => {
    if (i === undefined) rig.current[name] = el
    else (rig.current[name] ??= [])[i] = el
  }
  return (
    <group ref={bone('body')}>
      {[-1, 1].map((s, i) => (
        <group key={i} ref={bone('hips', i)} position={[s * 0.08, 0.34, 0]}>
          <P g="limb" c={BLUE} p={[0, -0.065, 0]} s={[0.036, 0.13, 0.036]} />
          <group ref={bone('knees', i)} position={[0, -0.13, 0]}>
            <P g="limb" c={BLUE} p={[0, -0.065, 0]} s={[0.032, 0.13, 0.032]} />
            <group ref={bone('ankles', i)} position={[0, -0.13, 0]}>
              <P g="ico" c={RED} p={[0, -0.02, 0.06]} s={[0.09, 0.065, 0.17]} />
              <P g="box" c={WHITE} p={[0, 0.02, 0.05]} s={[0.12, 0.03, 0.045]} />
            </group>
          </group>
        </group>
      ))}
      <group ref={bone('torso')} position={[0, 0.36, 0]}>
        <P g="ico" c={BLUE} p={[0, 0.11, -0.01]} s={[0.16, 0.18, 0.14]} />
        <P g="ico" c={PEACH} p={[0, 0.09, 0.08]} s={[0.1, 0.12, 0.07]} />
        <P g="cone" c={BLUE} p={[0, 0, -0.14]} r={[-2.2, 0, 0]} s={[0.04, 0.12, 0.04]} />
        {[-1, 1].map((s, i) => (
          <group key={i} ref={bone('shoulders', i)} position={[s * 0.17, 0.2, 0]} rotation={[0, 0, s * 0.25]}>
            <P g="limb" c={PEACH} p={[0, -0.05, 0]} s={[0.028, 0.1, 0.028]} />
            <group ref={bone('elbows', i)} position={[0, -0.1, 0]}>
              <P g="limb" c={PEACH} p={[0, -0.05, 0]} s={[0.026, 0.1, 0.026]} />
              <P g="ico" c={WHITE} p={[0, -0.12, 0]} s={0.06} />
            </group>
          </group>
        ))}
        <group ref={bone('head')} position={[0, 0.44, 0]}>
          <P g="ico" c={BLUE} s={[0.26, 0.25, 0.25]} />
          <group ref={bone('quills')}>
            {QUILLS.map(([tilt, y, len], i) => (
              <P
                key={i}
                g="cone"
                c={BLUE}
                p={[0, y + Math.sin(tilt) * (0.12 + len / 2), -Math.cos(tilt) * (0.12 + len / 2)]}
                r={[-Math.PI / 2 + tilt, 0, 0]}
                s={[0.09, len, 0.09]}
              />
            ))}
          </group>
          {[-1, 1].map((s) => (
            <P key={s} g="cone" c={BLUE} p={[s * 0.13, 0.2, -0.02]} r={[0, 0, -s * 0.35]} s={[0.06, 0.14, 0.05]} />
          ))}
          <P g="ico" c={WHITE} p={[0, 0.05, 0.19]} s={[0.17, 0.12, 0.08]} />
          {[-1, 1].map((s) => (
            <P key={s} g="ico" c={BLACK} p={[s * 0.055, 0.05, 0.255]} s={[0.03, 0.055, 0.02]} />
          ))}
          <P g="ico" c={PEACH} p={[0, -0.08, 0.17]} s={[0.13, 0.09, 0.1]} />
          <P g="ico" c={BLACK} p={[0, -0.03, 0.27]} s={0.03} />
        </group>
      </group>
    </group>
  )
}

// La bola del spin dash: rueda sobre su eje lateral; las púas van inclinadas hacia atrás del giro
function SpinBall({ spin }) {
  return (
    <group ref={spin}>
      <P g="ico" c={BLUE} s={0.28} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * TAU
        return <P key={i} g="cone" c={BLUE} p={[0, Math.cos(a) * 0.29, Math.sin(a) * 0.29]} r={[a - 0.7, 0, 0]} s={[0.11, 0.24, 0.13]} />
      })}
    </group>
  )
}

const v = () => new THREE.Vector3()
const tmp = { pos: v(), up: v(), fwd: v(), right: v(), m: new THREE.Matrix4(), q: new THREE.Quaternion() }
const X_AXIS = new THREE.Vector3(1, 0, 0)
const Z_AXIS = new THREE.Vector3(0, 0, 1)

// Coloca un objeto con su "arriba" en `up` y su frente en `fwd`
function orient(obj, pos, up, fwd) {
  tmp.right.crossVectors(up, fwd)
  tmp.m.makeBasis(tmp.right, up, fwd)
  obj.quaternion.setFromRotationMatrix(tmp.m)
  obj.position.copy(pos)
}

// Acerca `value` a `target` de forma suave e independiente de los fps
const ease = (value, target, rate, dt) => value + (target - value) * (1 - Math.exp(-rate * dt))

export function Sonic({ track, motion, mobile, superMode, onCollect }) {
  const root = useRef()
  const runner = useRef()
  const ball = useRef()
  const spin = useRef()
  const rig = useRef({})
  const ghosts = useRef([])
  const puffs = useRef([])
  const rings = useRef([])
  const nGhosts = mobile ? 3 : 5

  const info = useMemo(() => {
    const N = track.ride.length
    const meanR = track.ride.reduce((a, b) => a + b) / N
    const loopLen = TAU * track.loop.r
    const circleLen = TAU * meanR
    const total = loopLen + circleLen
    const at = (theta) => {
      const x = (((theta / TAU) * N) % N + N) % N
      const i = Math.floor(x)
      return { r: THREE.MathUtils.lerp(track.ride[i], track.ride[(i + 1) % N], x - i), air: track.air[i] === 1 }
    }
    const dir = (theta, out) => out.copy(track.n0).multiplyScalar(Math.cos(theta)).addScaledVector(track.t0, Math.sin(theta))
    // Cerca del loop, Sonic se cambia de carril: llega por el de entrada (-lane) y sale por el de salida (+lane)
    const smooth = (x) => x * x * (3 - 2 * x)
    const laneAt = (theta) => {
      if (theta < 0.5) return track.lane * (1 - smooth(theta / 0.5))
      if (theta > TAU - 0.5) return -track.lane * smooth((theta - (TAU - 0.5)) / 0.5)
      return 0
    }
    // Dónde está Sonic a una distancia d sobre la pista: primero el loop, luego la vuelta al planeta
    const sample = (d, out) => {
      d = ((d % total) + total) % total
      if (d < loopLen) {
        const phi = (d / loopLen) * TAU
        out.up.copy(track.n0).multiplyScalar(Math.cos(phi)).addScaledVector(track.t0, -Math.sin(phi))
        out.pos.copy(track.loop.center).addScaledVector(out.up, -track.loop.r).addScaledVector(track.side, track.lane * ((2 * d) / loopLen - 1))
        out.air = false
        out.loop = true
        out.theta = -1
      } else {
        const theta = ((d - loopLen) / circleLen) * TAU
        const h = at(theta)
        dir(theta, out.up)
        out.pos.copy(out.up).multiplyScalar(h.r).addScaledVector(track.side, laneAt(theta))
        out.air = h.air
        out.loop = false
        out.theta = theta
      }
      return out
    }
    const ringSpots = track.ringThetas.map((theta) => {
      const up = dir(theta, v())
      const fwd = v().copy(track.n0).multiplyScalar(-Math.sin(theta)).addScaledVector(track.t0, Math.cos(theta))
      return { theta, up, fwd, pos: up.clone().multiplyScalar(at(theta).r + 0.16) }
    })
    // Empieza en el punto de la pista que mira a la cámara (el planeta está inclinado 0.35 en X)
    const toCamera = new THREE.Vector3(0, 0.04, 1).normalize().applyAxisAngle(new THREE.Vector3(1, 0, 0), -0.35)
    let start = 0
    for (let i = 0, best = -2; i < N; i++) {
      const d = dir((i / N) * TAU, v()).dot(toCamera)
      if (d > best) [best, start] = [d, (i / N) * TAU]
    }
    return { total, sample, ringSpots, startD: loopLen + (start / TAU) * circleLen }
  }, [track])

  const fx = useMemo(
    () => ({
      ghostMats: Array.from({ length: nGhosts }, (_, i) => new THREE.MeshStandardMaterial({ color: BLUE, transparent: true, opacity: 0.4 * (1 - i / nGhosts), flatShading: true })),
      dustMat: new THREE.MeshBasicMaterial({ color: '#e6edf8', transparent: true, depthWrite: false }),
    }),
    [nGhosts],
  )

  const sim = useRef({
    d: info.startD,
    time: 0,
    power: 0,
    speed: 1,
    boost: 0,
    rev: 0,
    curl: 0,
    lean: 0.2,
    phase: 0,
    landT: -1,
    prevTheta: -1,
    prevAir: false,
    wasLoop: false,
    pending: false,
    placed: false,
    history: [],
    gone: track.ringThetas.map(() => -1),
    here: { pos: v(), up: v() },
    ahead: { pos: v(), up: v() },
    next: { pos: v(), up: v() },
    dustT: -1,
    dustPos: v(),
    dustUp: v(),
    dustDirs: Array.from({ length: 6 }, () => v()),
  })

  // Super Sonic: el azul se vuelve dorado y brilla
  useEffect(() => {
    for (const m of [mat(BLUE), ...fx.ghostMats]) {
      m.color.set(superMode ? GOLD : BLUE)
      m.emissive.set(superMode ? '#7a4500' : BLACK)
    }
  }, [superMode, fx])

  useFrame((_, delta) => {
    const s = sim.current
    const t = (s.time += delta)
    const dt = Math.min(delta, 0.05)
    s.power = ease(s.power, superMode ? 1 : 0, 3, dt)
    const dust = (pos, up) => {
      s.dustT = t
      s.dustPos.copy(pos)
      s.dustUp.copy(up)
      s.dustDirs.forEach((d) => d.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).projectOnPlane(up).normalize())
    }

    // Spin dash: se agacha y acelera girando en su lugar (rev), luego sale disparado y frena poco a poco
    if (s.pending) {
      s.pending = false
      s.rev = 0.45
    }
    if (s.rev > 0) {
      s.rev -= dt
      if (s.rev <= 0) s.boost = 2.4
    }
    s.boost *= Math.exp(-dt / 1.3)

    // Velocidad con inercia: acelera en el loop y con el spin dash, y vuelve suave a la normal
    const here = info.sample(s.d, s.here)
    const target = s.rev > 0 ? 0 : (1 + s.boost + (here.loop ? 0.35 : 0)) * (1 + 0.6 * s.power)
    s.speed = ease(s.speed, target, s.rev > 0 ? 9 : 2.5, dt)
    s.d = (s.d + dt * s.speed * motion) % info.total
    info.sample(s.d, here)

    // Frente = hacia dónde va de verdad (sube y baja en los saltos); "arriba" perpendicular a eso
    const next = info.sample(s.d + 0.02, s.next)
    const { up, fwd, q, m, right } = tmp
    fwd.subVectors(next.pos, here.pos).normalize()
    up.copy(here.up).addScaledVector(fwd, -here.up.dot(fwd)).normalize()
    right.crossVectors(up, fwd)
    q.setFromRotationMatrix(m.makeBasis(right, up, fwd))
    if (s.placed) root.current.quaternion.slerp(q, 1 - Math.exp(-20 * dt))
    else root.current.quaternion.copy(q)
    s.placed = true
    root.current.position.copy(here.pos)

    // Se hace bola un poco antes de saltar y se desenrolla un poco antes de aterrizar
    const ahead = info.sample(s.d + 0.08, s.ahead)
    const rolling = ahead.air || s.rev > 0 || s.boost > 0.8
    s.curl = ease(s.curl, rolling ? 1 : 0, 14, dt)
    if (s.prevAir && !here.air && !here.loop) {
      s.landT = t
      dust(here.pos, up)
    }
    if (s.wasLoop && !here.loop) dust(here.pos, up)
    if (s.rev > 0 && t - s.dustT > 0.15) dust(here.pos, up)
    s.prevAir = here.air
    s.wasLoop = here.loop

    // Transición corredor ⇄ bola: se encoge hacia los pies mientras crece la bola; al aterrizar se aplasta y rebota
    const c = s.curl
    const squash = 0.22 * Math.max(0, 1 - (t - s.landT) / 0.22)
    runner.current.visible = c < 0.9
    runner.current.scale.set(1 - 0.25 * c + squash * 0.5, Math.max(1 - 0.9 * c - squash, 0.01), 1 - 0.25 * c + squash * 0.5)
    ball.current.visible = c > 0.05
    ball.current.scale.setScalar(Math.max(c, 0.001))
    ball.current.position.set(s.rev > 0 ? Math.sin(t * 90) * 0.03 : 0, 0.3 * c, 0)
    spin.current.rotation.x += dt * (s.speed * 18 * motion + (s.rev > 0 ? 50 : 0))

    // Ciclo de carrera: cadera, rodilla y tobillo; brazos en contrafase con codos doblados; torso, cabeza y púas acompañan
    s.phase += dt * Math.min(8 + 14 * s.speed, 32) * motion
    s.lean = ease(s.lean, (0.2 + 0.08 * Math.min(s.speed, 3)) * (motion ? 1 : 0.3), 4, dt)
    const ph = s.phase
    const g = motion
    const b = rig.current
    b.hips.forEach((hip, i) => {
      const p = ph + i * Math.PI
      hip.rotation.x = -0.8 * Math.sin(p) * g
      b.knees[i].rotation.x = (0.15 + 1.25 * Math.max(0, Math.cos(p))) * g
      b.ankles[i].rotation.x = -(hip.rotation.x + b.knees[i].rotation.x) * 0.5
      b.shoulders[i].rotation.x = 0.9 * Math.sin(p) * g
      b.elbows[i].rotation.x = -(0.9 + 0.35 * Math.sin(p)) * g - 0.2
    })
    b.body.position.y = 0.03 * (0.5 + 0.5 * Math.cos(2 * ph)) * g
    b.body.rotation.x = s.lean
    b.torso.rotation.set(0.05 * Math.sin(2 * ph) * g, 0.2 * Math.sin(ph) * g, 0)
    b.head.rotation.set(-s.lean * 0.5 + 0.05 * Math.sin(2 * ph - 0.6) * g, 0, 0.04 * Math.sin(ph) * g)
    // En modo Super las púas se levantan
    b.quills.rotation.x = (0.08 * Math.sin(2 * ph - 1.3) - 0.06 * Math.min(Math.max(s.speed - 1, 0), 2)) * g + 0.5 * s.power

    // Estela: copias de la bola en posiciones pasadas, solo cuando va rápido hecho bola
    s.history.push(here.pos.clone().addScaledVector(up, 0.3 * SONIC_SCALE))
    if (s.history.length > 24) s.history.shift()
    ghosts.current.forEach((gh, i) => {
      const h = s.history[s.history.length - 1 - (i + 1) * (s.speed > 1.8 ? 3 : 2)]
      gh.visible = c > 0.6 && s.speed > 0.7 && !!h
      if (h) gh.position.copy(h)
    })

    // Polvo
    const kd = t - s.dustT
    puffs.current.forEach((p, i) => {
      p.visible = s.dustT >= 0 && kd < 0.45
      if (!p.visible) return
      p.position.copy(s.dustPos).addScaledVector(s.dustDirs[i], 0.02 + kd * 0.25).addScaledVector(s.dustUp, 0.015 + kd * 0.05)
      p.scale.setScalar(0.012 + kd * 0.06)
    })
    fx.dustMat.opacity = 0.7 * Math.max(0, 1 - kd / 0.45)

    // Anillos de la pista: Sonic los recoge al pasar
    const theta = here.theta
    info.ringSpots.forEach((spot, k) => {
      if (s.gone[k] < 0 && s.prevTheta >= 0 && theta >= 0 && s.prevTheta < spot.theta && theta >= spot.theta) {
        s.gone[k] = t
        onCollect?.()
      }
      const pop = ringPop(s.gone[k] < 0 ? Infinity : t - s.gone[k])
      if (pop.done) s.gone[k] = -1
      const [ring, flash] = rings.current[k].children
      ring.scale.setScalar(pop.scale * 0.85)
      ring.rotation.y = t * 2.4 * motion + k + pop.spin
      flash.visible = pop.flash
      flash.scale.setScalar(pop.flashScale * 0.6)
      flash.material.opacity = pop.flashOpacity
    })
    s.prevTheta = theta
  })

  return (
    <>
      <group ref={root} scale={SONIC_SCALE}>
        <group ref={runner}>
          <Runner rig={rig} />
        </group>
        <group ref={ball} position={[0, 0.3, 0]} visible={false}>
          <SpinBall spin={spin} />
        </group>
        {/* Zona de clic: spin dash */}
        <mesh
          position={[0, 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation()
            sim.current.pending = true
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          <sphereGeometry args={[0.75, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {fx.ghostMats.map((m, i) => (
        <mesh key={i} ref={(el) => (ghosts.current[i] = el)} geometry={geo.ico} material={m} scale={0.28 * SONIC_SCALE} visible={false} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={(el) => (puffs.current[i] = el)} geometry={geo.ico} material={fx.dustMat} visible={false} />
      ))}
      {info.ringSpots.map((spot, k) => (
        <group
          key={k}
          ref={(el) => {
            if (!el) return
            orient(el, spot.pos, spot.up, spot.fwd)
            rings.current[k] = el
          }}
        >
          <mesh geometry={ringGeo} material={ringMat} />
          <mesh geometry={flashGeo} visible={false}>
            <meshBasicMaterial color="#fff6cc" transparent depthWrite={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// --- Eggman en su Egg Mobile, con la bola de demolición de cuadros (jefe de Green Hill) ---

function checkerBall() {
  const g = new THREE.IcosahedronGeometry(1, 2)
  const p = g.attributes.position
  const colors = []
  const c = new THREE.Color()
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3
    const y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3
    const z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3
    const cell = Math.floor((Math.atan2(z, x) + Math.PI) / (Math.PI / 4)) + Math.floor((y + 1) / 0.5)
    c.set(cell % 2 ? '#c8743a' : '#8a4a22')
    for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b)
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return g
}

const flameOuter = new THREE.MeshBasicMaterial({ color: '#ff8a1e' })
const flameInner = new THREE.MeshBasicMaterial({ color: '#ffe066' })
const glass = new THREE.MeshStandardMaterial({ color: '#a9dcff', transparent: true, opacity: 0.45, roughness: 0.1 })
const lamp = new THREE.MeshStandardMaterial({ color: '#ffd43b', emissive: '#ffb000', emissiveIntensity: 0.8 })
const hull = mat('#c8ced8', { metalness: 0.35, roughness: 0.35 })

export const EGG_ORBIT = 2.6

// Su órbita gira junto con el planeta, por la franja sin nada alto que calcula buildWorld (`axis`)
export function Eggman({ motion, axis }) {
  const ship = useRef()
  const pendulum = useRef()
  const flame = useRef()
  const time = useRef(0)
  const ballGeo = useMemo(checkerBall, [])

  // Arranca en el punto de su órbita más a la vista (arriba a la izquierda, hacia la cámara)
  const { quat, a0 } = useMemo(() => {
    const quat = new THREE.Quaternion().setFromUnitVectors(Z_AXIS, axis)
    const view = new THREE.Vector3(-0.35, 0.55, 0.75)
    let a0 = 0
    for (let a = 0, best = -9; a < TAU; a += 0.05) {
      const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).applyQuaternion(quat).applyAxisAngle(X_AXIS, 0.35).dot(view)
      if (d > best) [best, a0] = [d, a]
    }
    return { quat, a0 }
  }, [axis])

  useFrame((_, delta) => {
    const t = (time.current += delta)
    const a = a0 + t * 0.16 * motion
    const { pos, up, fwd } = tmp
    up.set(Math.cos(a), Math.sin(a), 0)
    fwd.set(-Math.sin(a), Math.cos(a), 0)
    pos.copy(up).multiplyScalar(EGG_ORBIT + Math.sin(t * 2) * 0.04 * motion)
    orient(ship.current, pos, up, fwd)
    pendulum.current.rotation.x = Math.sin(t * 1.7) * 0.4 * motion
    flame.current.scale.z = 1 + Math.sin(t * 40) * 0.25 * motion
  })

  return (
    <group quaternion={quat}>
      <group ref={ship} scale={0.42}>
        {/* Casco */}
        <P g="ico" m={hull} s={[0.5, 0.32, 0.62]} />
        <P g="disc" c="#2b2f3a" s={[0.515, 0.07, 0.635]} />
        <mesh geometry={geo.ico} material={lamp} position={[0, 0.02, 0.62]} scale={0.055} />
        <mesh geometry={geo.ico} material={glass} position={[0, 0.3, 0.32]} scale={[0.32, 0.16, 0.06]} />
        <P g="disc" c="#3a3f4b" p={[0, 0.02, -0.62]} r={[Math.PI / 2, 0, 0]} s={[0.1, 0.12, 0.1]} />
        <group ref={flame} position={[0, 0.02, -0.68]}>
          <mesh geometry={geo.cone} material={flameOuter} position={[0, 0, -0.11]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.08, 0.22, 0.08]} />
          <mesh geometry={geo.cone} material={flameInner} position={[0, 0, -0.07]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.045, 0.14, 0.045]} />
        </group>

        {/* Eggman asomado: camisa roja, cabeza calva, bigote grande */}
        <P g="ico" c="#d8232a" p={[0, 0.3, -0.05]} s={[0.26, 0.22, 0.22]} />
        {[-1, 1].map((s) => (
          <P key={s} g="ico" c="#d8232a" p={[s * 0.25, 0.3, 0.02]} s={0.09} />
        ))}
        <P g="ico" c={PEACH} p={[0, 0.6, 0.02]} s={[0.2, 0.22, 0.2]} />
        <P g="ico" c="#ff9aa8" p={[0, 0.58, 0.22]} s={[0.07, 0.06, 0.07]} />
        {[-1, 1].map((s) => (
          <P key={s} g="ico" c="#c45a1a" p={[s * 0.11, 0.52, 0.19]} r={[0, 0, s * 0.35]} s={[0.15, 0.05, 0.06]} />
        ))}
        {[-1, 1].map((s) => (
          <P key={s} g="ico" c={BLACK} p={[s * 0.07, 0.68, 0.18]} s={[0.025, 0.04, 0.02]} />
        ))}

        {/* Cadena y bola de demolición: péndulo hacia el planeta */}
        <group ref={pendulum} position={[0, -0.3, 0]}>
          {Array.from({ length: 5 }, (_, i) => (
            <P key={i} g="link" c="#8e96a6" p={[0, -0.06 - i * 0.09, 0]} r={[0, i % 2 ? Math.PI / 2 : 0, 0]} s={0.05} />
          ))}
          <mesh geometry={ballGeo} position={[0, -0.65, 0]} scale={0.17}>
            <meshStandardMaterial vertexColors flatShading roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
