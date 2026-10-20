import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App, { GameOver } from './App.jsx'
import './index.css'

// vercel.json manda todas las rutas a index.html: cualquier ruta que no sea el inicio es GAME OVER
const home = ['/', '/index.html'].includes(location.pathname)
if (!home) {
  document.title = 'GAME OVER | Hugo Eliezer Trejo'
  document.head.insertAdjacentHTML('beforeend', '<meta name="robots" content="noindex" />')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {home ? <App /> : <GameOver />}
    <Analytics />
  </StrictMode>,
)
