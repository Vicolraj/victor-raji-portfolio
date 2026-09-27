import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { gsap } from 'gsap'
import { PublicPage } from './pages/PublicPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminPage } from './pages/AdminPage'
import { useReducedMotion } from './hooks/useReducedMotion'

const CursorDot = () => {
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || reducedMotion) {
      return
    }

    const dot = document.createElement('span')
    dot.setAttribute('aria-hidden', 'true')
    dot.className = 'cursor-dot'
    document.body.appendChild(dot)

    const move = (event: MouseEvent) => {
      gsap.to(dot, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.15,
        overwrite: true,
      })
    }

    window.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('mousemove', move)
      dot.remove()
    }
  }, [])

  return null
}

const ScrollSync = () => {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      return
    }

    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [reducedMotion])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollSync />
      <CursorDot />
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
