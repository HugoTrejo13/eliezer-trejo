import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Eggman, Sonic, flashGeo, ringGeo, ringMat, ringPop } from './Characters.jsx'

// Planeta Green Hill low-poly, todo hecho con código (ver PLAN.md §5).
// Terreno + decoración se juntan en UNA sola geometría con colores por vértice.

const R = 1.6 // radio del planeta (nivel del agua)
const STEP = 0.1 // altura de cada nivel de terreno
const LOOP = 0.45 // radio del loop de Green Hill
const UP = new THREE.Vector3(0, 1, 0)

const C = {
  water: ['#2f7ff0', '#3a8ef5', '#8fd0ff'],
  grass: [null, ['#27a94a', '#2cb350'], ['#3ddc6a', '#44e070'], ['#5fe884', '#69ea8c']],
  lip: '#5be07c',
  soil: ['#c8743a', '#8a4a22'],
  trunk: ['#b5652b', '#7c3f17'],
  leaf: ['#2fbf55', '#249e45'],
  bush: ['#249e45', '#2fbf55', '#1f8a3c'],
  rock: ['#9aa3b5', '#7d869b'],
}

const ORBITS = [
  { r: 2.35, tilt: [0.35, 0, 0.25], speed: 0.25 },
  { r: 2.65, tilt: [-0.5, 0.4, -0.35], speed: -0.18 },
  { r: 2.2, tilt: [1.15, 0, 0.15], speed: 0.21 },
]

// PRNG con semilla: el planeta sale igual en cada visita
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Relieve suave sobre la esfera (suma de senos, sin librerías de ruido)
const field = (n) =>
  Math.sin(n.x * 3.1 + 0.7) * Math.cos(n.y * 2.3 - 1.1) +
  Math.sin(n.z * 3.7 + n.x * 1.3) * 0.7 +
  Math.cos(n.y * 4.3 + n.z * 2.1 + 2.0) * 0.45 +
  Math.sin((n.x + n.y + n.z) * 5.3) * 0.2

const M = (p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) =>
  new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s))

const G = {
  trunk: new THREE.CylinderGeometry(0.026, 0.034, 0.08, 6),
  leaf: new THREE.ConeGeometry(0.06, 0.34, 4),
  ball: new THREE.IcosahedronGeometry(1, 0),
  box: new THREE.BoxGeometry(1, 1, 1),
  disc: new THREE.CylinderGeometry(1, 1, 1, 8),
  rod: new THREE.CylinderGeometry(1, 1, 1, 5),
}

// --- Decoración: cada función devuelve [geometría, color, matriz local] ---

function palm(rand) {
  const parts = []
  const segs = 5 + Math.floor(rand() * 2)
  for (let i = 0; i < segs; i++) {
    const s = 1 - i * 0.07
    parts.push([G.trunk, C.trunk[i % 2], M([0, 0.04 + i * 0.075, 0], [0, 0, 0], [s, 1, s])])
  }
  const top = segs * 0.075 + 0.01
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + rand() * 0.3
    const euler = new THREE.Euler(0, a, -(Math.PI / 2 + 0.35 + rand() * 0.25))
    const dir = UP.clone().applyEuler(euler)
    const p = dir.multiplyScalar(0.15).add(new THREE.Vector3(0, top, 0))
    parts.push([G.leaf, C.leaf[k % 2], new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(euler), new THREE.Vector3(0.3, 1, 1))])
  }
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    parts.push([G.ball, C.trunk[1], M([Math.cos(a) * 0.03, top - 0.03, Math.sin(a) * 0.03], [0, 0, 0], [0.022, 0.022, 0.022])])
  }
  const lean = (rand() - 0.5) * 0.5
  const tilt = M([0, 0, 0], [0, 0, lean])
  return parts.map(([g, c, m]) => [g, c, tilt.clone().multiply(m)])
}

function sunflower() {
  return [
    [G.rod, C.leaf[1], M([0, 0.09, 0], [0, 0, 0], [0.008, 0.18, 0.008])],
    [G.leaf, C.leaf[0], M([0.03, 0.06, 0], [0, 0, -1.1], [0.25, 0.25, 0.6])],
    [G.disc, '#ffd43b', M([0, 0.2, 0], [Math.PI / 2, 0, 0], [0.06, 0.012, 0.06])],
    [G.disc, '#7a3e12', M([0, 0.2, 0.008], [Math.PI / 2, 0, 0], [0.028, 0.012, 0.028])],
  ]
}

function bush(rand) {
  return [0, 1, 2].map((i) => {
    const s = 0.06 + rand() * 0.04
    return [G.ball, C.bush[i], M([(i - 1) * 0.07, s * 0.6, (rand() - 0.5) * 0.05], [rand(), rand(), 0], [s, s * 0.85, s])]
  })
}

// El loop de Green Hill: anillo de bloques con patrón de cuadros
function loop() {
  const parts = []
  const n = 28
  const rad = LOOP
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const len = ((2 * Math.PI * rad) / n) * 1.08
    parts.push([G.box, C.soil[i % 2], M([Math.cos(a) * rad, rad - 0.02 + Math.sin(a) * rad, 0], [0, 0, a], [0.04, len, 0.2])])
    parts.push([G.box, C.lip, M([Math.cos(a) * (rad + 0.025), rad - 0.02 + Math.sin(a) * (rad + 0.025), 0], [0, 0, a], [0.012, len, 0.21])])
  }
  return parts
}

function totem() {
  const colors = ['#8a4a22', '#c8743a', '#2f6bff', '#ff8a3d', '#a35bff']
  const parts = colors.map((c, i) => [G.box, c, M([0, 0.04 + i * 0.075, 0], [0, i * 0.2, 0], [0.075 - i * 0.004, 0.075, 0.075 - i * 0.004])])
  const top = 0.04 + colors.length * 0.075
  parts.push([G.box, '#ffc93c', M([0.07, top, 0], [0, 0, 0.5], [0.1, 0.025, 0.05])])
  parts.push([G.box, '#ffc93c', M([-0.07, top, 0], [0, 0, -0.5], [0.1, 0.025, 0.05])])
  return parts
}

// Poste de checkpoint (star post)
function starPost() {
  return [
    [G.box, '#c9cfdf', M([0, 0.015, 0], [0, 0, 0], [0.06, 0.03, 0.06])],
    [G.rod, '#2f6bff', M([0, 0.18, 0], [0, 0, 0], [0.012, 0.32, 0.012])],
    [G.ball, '#ff4d5e', M([0, 0.36, 0], [0, 0, 0], [0.04, 0.04, 0.04])],
  ]
}

function rockPile(rand) {
  return [0, 1].map((i) => {
    const s = 0.05 + rand() * 0.04
    return [G.ball, C.rock[i], M([i * 0.07, s * 0.5, 0], [rand() * 3, rand() * 3, 0], [s, s * 0.8, s * 1.1])]
  })
}

function buildWorld() {
  const rand = seeded(7)
  const pos = []
  const col = []
  const color = new THREE.Color()
  const push = (v, hex) => {
    pos.push(v.x, v.y, v.z)
    color.set(hex)
    col.push(color.r, color.g, color.b)
  }
  const tri = (a, b, c, hex) => (push(a, hex), push(b, hex), push(c, hex))
  const quad = (aL, bL, bH, aH, hex) => (tri(aL, bL, bH, hex), tri(aL, bH, aH, hex))
  const add = (geo, hex, matrix) => {
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(matrix)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) push(new THREE.Vector3().fromBufferAttribute(p, i), hex)
  }

  // 1. Caras de una icosfera (cada triángulo es un "tile")
  const ico = new THREE.IcosahedronGeometry(1, 5)
  const p = ico.attributes.position
  const faces = []
  for (let i = 0; i < p.count; i += 3) {
    const v = [0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(p, i + k).normalize())
    const n = v[0].clone().add(v[1]).add(v[2]).normalize()
    faces.push({ v, n, h: field(n), nb: [] })
  }

  // 2. Niveles por percentil: 28% agua, el resto en 3 alturas de pasto
  const sorted = faces.map((f) => f.h).sort((a, b) => a - b)
  const cuts = [0.28, 0.66, 0.88].map((t) => sorted[Math.floor(t * (sorted.length - 1))])
  faces.forEach((f) => (f.level = cuts.filter((c) => f.h > c).length))

  // 3. Vecinos por arista compartida
  const key = (a, b) => [a, b].map((v) => v.toArray().map((x) => Math.round(x * 1e4)).join()).sort().join('|')
  const edges = new Map()
  faces.forEach((f, i) =>
    f.v.forEach((a, k) => {
      const id = key(a, f.v[(k + 1) % 3])
      if (!edges.has(id)) edges.set(id, [])
      edges.get(id).push(i)
    }),
  )
  faces.forEach((f, i) => (f.nb = f.v.map((a, k) => faces[edges.get(key(a, f.v[(k + 1) % 3])).find((j) => j !== i)] ?? f)))

  // 4. Tapas de cada tile + acantilados con cuadros donde el vecino está más abajo
  const radius = (level) => R + level * STEP
  const wall = (a, b, r0, r1) => {
    const rows = Math.round((r1 - r0) / (STEP / 2))
    const cols = 6
    for (let y = 0; y < rows; y++) {
      const rLo = r0 + (y / rows) * (r1 - r0)
      const rHi = r0 + ((y + 1) / rows) * (r1 - r0)
      const band = Math.round((rLo - R) / (STEP / 2))
      for (let x = 0; x < cols; x++) {
        const P = (s, r) => a.clone().lerp(b, s).multiplyScalar(r)
        const hex = y === rows - 1 ? C.lip : C.soil[(x + band) % 2]
        quad(P(x / cols, rLo), P((x + 1) / cols, rLo), P((x + 1) / cols, rHi), P(x / cols, rHi), hex)
      }
    }
  }
  for (const f of faces) {
    const r = radius(f.level)
    const pick = (list) => list[Math.floor(rand() * list.length)]
    const hex = f.level === 0 ? (rand() < 0.1 ? C.water[2] : pick(C.water.slice(0, 2))) : pick(C.grass[f.level])
    tri(...f.v.map((v) => v.clone().multiplyScalar(r)), hex)
    f.v.forEach((a, k) => {
      if (f.nb[k].level < f.level) wall(a, f.v[(k + 1) % 3], radius(f.nb[k].level), r)
    })
  }

  // 5. Decoración sobre el pasto, sin encimarse
  const taken = []
  const land = faces.filter((f) => f.level > 0).sort(() => rand() - 0.5)
  const choose = (count, minAngle, ok = () => true) => {
    const out = []
    for (const f of land) {
      if (out.length === count) break
      if (!ok(f) || taken.some((g) => g.n.dot(f.n) > Math.cos(minAngle))) continue
      taken.push(f)
      out.push(f)
    }
    return out
  }
  const place = (f, parts, scale = 1) => {
    const center = f.v[0].clone().add(f.v[1]).add(f.v[2]).multiplyScalar(radius(f.level) / 3)
    const q = new THREE.Quaternion().setFromUnitVectors(UP, f.n).multiply(new THREE.Quaternion().setFromAxisAngle(UP, rand() * Math.PI * 2))
    const base = new THREE.Matrix4().compose(center, q, new THREE.Vector3(scale, scale, scale))
    parts.forEach(([g, hex, m]) => add(g, hex, base.clone().multiply(m)))
  }
  const flat = (f) => f.nb.every((n) => n.level === f.level)

  // 6. Pista de Sonic: un círculo máximo que pasa por el loop
  const loopFace = choose(1, 0.5, (f) => f.level === 1 && flat(f) && f.nb.every((n) => n.nb.every((m) => m.level === 1)))[0] ?? land[0]
  const n0 = loopFace.n.clone()
  const N = 720
  const faceAt = (dir) => faces.reduce((best, f) => (f.n.dot(dir) > best.n.dot(dir) ? f : best), faces[0])
  const levelsAlong = (t0) =>
    Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2
      return faceAt(n0.clone().multiplyScalar(Math.cos(a)).addScaledVector(t0, Math.sin(a))).level
    })
  // De 8 direcciones, la que cruza ~8 desniveles y deja plano el tramo del loop
  const e1 = new THREE.Vector3().crossVectors(n0, Math.abs(n0.y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0)).normalize()
  const e2 = new THREE.Vector3().crossVectors(n0, e1)
  let best = null
  for (let k = 0; k < 8; k++) {
    const t0 = e1.clone().multiplyScalar(Math.cos((k / 8) * Math.PI)).addScaledVector(e2, Math.sin((k / 8) * Math.PI))
    const levels = levelsAlong(t0)
    const changes = levels.filter((l, i) => l !== levels[(i + 1) % N]).length
    const loopZoneFlat = levels.every((l, i) => Math.min(i, N - i) > 40 || l === 1)
    const score = Math.abs(changes - 8) + (loopZoneFlat ? 0 : 100)
    if (!best || score < best.score) best = { t0, levels, score }
  }
  const t0 = best.t0
  const axis = new THREE.Vector3().crossVectors(n0, t0)

  // Altura de Sonic: máximo móvil + dos promedios = despega antes de un acantilado y cae en arco
  const ground = best.levels.map(radius)
  const around = (arr, w, fn) =>
    arr.map((_, i) => {
      const xs = []
      for (let j = -w; j <= w; j++) xs.push(arr[(i + j + N) % N])
      return fn(xs)
    })
  const mean = (xs) => xs.reduce((a, b) => a + b) / xs.length
  const ride = around(around(around(ground, 19, (xs) => Math.max(...xs)), 6, mean), 6, mean).map((r, i) => Math.max(r, ground[i]))
  const air = ride.map((r, i) => (r - ground[i] > 0.015 ? 1 : 0))
  for (let i = 0; i < N; ) {
    if (!air[i]) {
      i++
      continue
    }
    let j = i
    while (j < N && air[j]) j++
    const H = Math.min(0.12, 0.03 + (j - i) * 0.002)
    for (let k = i; k < j; k++) {
      const x = (k - i + 0.5) / (j - i)
      ride[k] += 4 * H * x * (1 - x)
    }
    i = j
  }

  // El loop queda alineado con la pista (su plano contiene n0 y t0)
  const loopGround = n0.clone().multiplyScalar(radius(loopFace.level))
  const loopBasis = new THREE.Matrix4().makeBasis(t0, n0, axis.clone().negate())
  const loopMatrix = new THREE.Matrix4().compose(loopGround, new THREE.Quaternion().setFromRotationMatrix(loopBasis), new THREE.Vector3(1, 1, 1))
  loop().forEach(([g, hex, m]) => add(g, hex, loopMatrix.clone().multiply(m)))

  // 7. Decoración fuera del corredor de la pista; el poste de checkpoint, a un lado
  const off = (angle) => (f) => Math.abs(f.n.dot(axis)) > Math.sin(angle)
  const beside = (f) => off(0.1)(f) && !off(0.17)(f)
  choose(1, 0.35, (f) => f.level >= 2 && flat(f) && off(0.1)(f)).forEach((f) => place(f, totem()))
  choose(1, 0.35, (f) => flat(f) && beside(f)).forEach((f) => place(f, starPost()))
  choose(8, 0.32, off(0.1)).forEach((f) => place(f, palm(rand), 1.15 + rand() * 0.35))
  choose(7, 0.22, off(0.08)).forEach((f) => place(f, sunflower(), 1.3 + rand() * 0.3))
  choose(6, 0.22, off(0.08)).forEach((f) => place(f, bush(rand)))
  choose(4, 0.22, off(0.08)).forEach((f) => place(f, rockPile(rand)))

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  geometry.computeVertexNormals()

  const track = {
    n0,
    t0,
    ride: Float32Array.from(ride),
    air: Uint8Array.from(air),
    loop: { center: loopGround.clone().addScaledVector(n0, LOOP - 0.02), r: LOOP - 0.02 },
    ringThetas: Array.from({ length: 8 }, (_, i) => 0.6 + (i / 8) * (Math.PI * 2 - 1.0)),
  }
  return { geometry, track }
}

// --- Anillos dorados: giran en órbita y se recogen con clic ---

function Ring({ orbit, phase, motion, onCollect }) {
  const group = useRef()
  const ring = useRef()
  const flash = useRef()
  const state = useRef({ pending: false, gone: -1 })

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const a = phase + t * orbit.speed * motion
    group.current.position.set(Math.cos(a) * orbit.r, 0, Math.sin(a) * orbit.r)

    const s = state.current
    if (s.pending) {
      s.pending = false
      s.gone = t
    }
    const pop = ringPop(s.gone < 0 ? Infinity : t - s.gone)
    if (pop.done) s.gone = -1
    ring.current.scale.setScalar(pop.scale)
    ring.current.rotation.y = phase + t * 2.4 * motion + pop.spin
    flash.current.visible = pop.flash
    flash.current.scale.setScalar(pop.flashScale)
    flash.current.rotation.z = pop.flashScale
    flash.current.material.opacity = pop.flashOpacity
  })

  return (
    <group ref={group}>
      <mesh ref={ring} geometry={ringGeo} material={ringMat} />
      <mesh ref={flash} geometry={flashGeo} visible={false}>
        <meshBasicMaterial color="#fff6cc" transparent depthWrite={false} />
      </mesh>
      {/* Zona de clic más grande que el anillo, invisible */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          if (state.current.gone >= 0 || state.current.pending) return
          state.current.pending = true
          onCollect?.()
        }}
        onPointerOver={() => state.current.gone < 0 && (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Rocks({ count, motion }) {
  const group = useRef()
  const rocks = useMemo(() => {
    const rand = seeded(21)
    return Array.from({ length: count }, (_, i) => {
      const dir = new THREE.Vector3(rand() - 0.5, (rand() - 0.5) * 0.9, rand() - 0.5).normalize()
      const s = 0.1 + rand() * 0.12
      return { pos: dir.multiplyScalar(2.3 + rand() * 0.4), scale: [s, s * 0.75, s * 0.9], spin: 0.3 + rand() * 0.5, color: C.rock[i % 2] }
    })
  }, [count])

  useFrame((_, delta) => {
    group.current.rotation.y -= delta * 0.05 * motion
    group.current.children.forEach((m, i) => {
      m.rotation.x += delta * rocks[i].spin * motion
      m.rotation.y += delta * rocks[i].spin * 0.6 * motion
    })
  })

  return (
    <group ref={group}>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.pos} scale={r.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={r.color} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function World({ mobile, motion, onCollect }) {
  const tilt = useRef()
  const planet = useRef()
  const { geometry, track } = useMemo(buildWorld, [])
  const perOrbit = mobile ? 3 : 6

  useFrame((state, delta) => {
    // Entrada: el planeta crece con un pequeño rebote al cargar
    const k = motion ? Math.min(state.clock.elapsedTime / 1.2, 1) : 1
    const ease = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2)
    tilt.current.scale.setScalar(0.6 + 0.4 * ease)
    planet.current.rotation.y += delta * 0.12 * motion
    // Se inclina un poco hacia el mouse
    tilt.current.rotation.x = THREE.MathUtils.lerp(tilt.current.rotation.x, -state.pointer.y * 0.15 * motion, 0.05)
    tilt.current.rotation.z = THREE.MathUtils.lerp(tilt.current.rotation.z, -state.pointer.x * 0.08 * motion, 0.05)
  })

  return (
    <group ref={tilt}>
      {/* Sonic va dentro del grupo que gira con el planeta */}
      <group ref={planet} rotation={[0.35, 0, 0]}>
        <mesh geometry={geometry}>
          <meshStandardMaterial vertexColors flatShading roughness={0.85} />
        </mesh>
        <Sonic track={track} motion={motion} mobile={mobile} onCollect={onCollect} />
      </group>
      <Eggman motion={motion} mobile={mobile} />
      {/* Esfera invisible que tapa los clics: los anillos detrás del planeta no se recogen */}
      <mesh onClick={(e) => e.stopPropagation()}>
        <sphereGeometry args={[R + STEP * 2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {ORBITS.map((orbit, o) => (
        <group key={o} rotation={orbit.tilt}>
          {Array.from({ length: perOrbit }, (_, i) => (
            <Ring key={i} orbit={orbit} phase={(i / perOrbit) * Math.PI * 2 + o} motion={motion} onCollect={onCollect} />
          ))}
        </group>
      ))}
      <Rocks count={mobile ? 5 : 9} motion={motion} />
    </group>
  )
}

// memo: el contador de anillos re-renderiza App, pero el canvas no necesita re-renderizarse
export default memo(function Planet({ onCollect }) {
  const wrap = useRef()
  const [visible, setVisible] = useState(true)
  const [{ mobile, motion }] = useState(() => ({
    mobile: matchMedia('(max-width: 767px)').matches,
    motion: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1,
  }))

  // No renderiza mientras el hero no está en pantalla
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        flat
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, mobile ? 1.5 : 2]}
        camera={{ position: [0, 0.3, mobile ? 7.4 : 8.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#cfe3ff', '#6b4a2a', 0.9]} />
        <directionalLight position={[-4, 5, 5]} intensity={2.4} color="#fff3d6" />
        <directionalLight position={[5, -2, -4]} intensity={1.2} color="#4c7dff" />
        <World mobile={mobile} motion={motion} onCollect={onCollect} />
        <Sparkles count={mobile ? 18 : 36} scale={6} size={2.5} speed={0.3 * motion} color="#ffc93c" opacity={0.8} />
        {/* Arrastrar para girar solo en escritorio: en celular bloquearía el scroll */}
        {!mobile && <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />}
      </Canvas>
    </div>
  )
})
