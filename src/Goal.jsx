import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Letrero de meta de Green Hill: gira lento y, al enviar el formulario (ACT CLEAR), da vueltas y muestra "HE"

// Las tapas del cilindro mapean la textura girada 90°: se compensa con `rotation`
function faceTexture(draw, rotation) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  draw(canvas.getContext('2d'))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.center.set(0.5, 0.5)
  texture.rotation = rotation
  return texture
}

// Frente: anillo dorado sobre azul
const drawFront = (ctx) => {
  ctx.fillStyle = '#2f6bff'
  ctx.fillRect(0, 0, 256, 256)
  ctx.beginPath()
  ctx.ellipse(128, 128, 58, 70, 0, 0, Math.PI * 2)
  ctx.lineWidth = 34
  ctx.strokeStyle = '#a8740a'
  ctx.stroke()
  ctx.lineWidth = 22
  ctx.strokeStyle = '#ffc93c'
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(110, 104, 10, 26, -0.4, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fill()
}

// Atrás: iniciales en pixel sobre dorado
const drawBack = (ctx) => {
  ctx.fillStyle = '#ffc93c'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#070b1a'
  ctx.font = '64px "Press Start 2P", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('HE', 132, 136)
}

function Signpost({ cleared, motion }) {
  const sign = useRef()
  const state = useRef({ boost: 0, settled: false })
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    document.fonts.load('64px "Press Start 2P"').finally(() => setFontReady(true))
  }, [])

  const materials = useMemo(() => {
    const rim = new THREE.MeshStandardMaterial({ color: '#c9cfdf', metalness: 0.3, roughness: 0.4 })
    const front = new THREE.MeshStandardMaterial({ map: faceTexture(drawFront, Math.PI / 2), roughness: 0.5 })
    const back = new THREE.MeshStandardMaterial({ map: faceTexture(drawBack, Math.PI / 2), roughness: 0.5 })
    return [rim, front, back]
  }, [fontReady])

  useEffect(() => {
    if (!cleared) {
      state.current.settled = false
      return
    }
    state.current.boost = motion ? 22 : 0
  }, [cleared, motion])

  useFrame((_, delta) => {
    const s = state.current
    const dt = Math.min(delta, 0.05)
    const r = sign.current.rotation
    s.boost *= Math.exp(-dt * 1.1)
    if (cleared && s.boost < 1.2) {
      // Al terminar de girar se detiene mostrando la cara de atrás, como el letrero del juego
      const target = Math.round((r.y - Math.PI) / (Math.PI * 2)) * Math.PI * 2 + Math.PI
      r.y += (target - r.y) * (1 - Math.exp(-dt * (motion ? 4 : 60)))
      return
    }
    r.y += dt * (0.6 * motion + s.boost)
  })

  return (
    <group position={[0, -0.25, 0]}>
      <group ref={sign} position={[0, 0.95, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
          <cylinderGeometry args={[0.62, 0.62, 0.08, 32]} />
        </mesh>
      </group>
      {/* El poste llega hasta el borde inferior de la placa, sin atravesarla */}
      <mesh position={[0, -0.21, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 1.12, 8]} />
        <meshStandardMaterial color="#9aa3b5" flatShading />
      </mesh>
      {/* Base: un pedacito de Green Hill */}
      <mesh position={[0, -0.82, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 10]} />
        <meshStandardMaterial color="#3ddc6a" flatShading />
      </mesh>
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[0.66, 0.5, 0.3, 10]} />
        <meshStandardMaterial color="#c8743a" flatShading />
      </mesh>
    </group>
  )
}

export default function Goal({ cleared }) {
  const wrap = useRef()
  const [visible, setVisible] = useState(false)
  const [motion] = useState(() => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1))

  // Solo se dibuja mientras está en pantalla
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas flat frameloop={visible ? 'always' : 'never'} dpr={[1, 2]} camera={{ position: [0, 0.2, 5.4], fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#fff3d6" />
        <directionalLight position={[3, -1, -4]} intensity={0.9} color="#4c7dff" />
        <Signpost cleared={cleared} motion={motion} />
      </Canvas>
    </div>
  )
}
