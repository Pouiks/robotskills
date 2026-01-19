'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface SkillCard {
  x: number
  y: number
  speed: number
  size: number
  opacity: number
  skillIndex: number
  direction: 'up' | 'down'
  column: number
}

// Skills parlants pour une marketplace robotique
const SKILLS = [
  { icon: '🧭', name: 'Navigation', desc: 'SLAM' },
  { icon: '👁️', name: 'Vision', desc: 'OpenCV' },
  { icon: '🦾', name: 'Gripper', desc: 'Control' },
  { icon: '🗣️', name: 'Voice', desc: 'TTS/STT' },
  { icon: '🎯', name: 'Object', desc: 'Detection' },
  { icon: '📡', name: 'Lidar', desc: 'Mapping' },
  { icon: '⚡', name: 'Battery', desc: 'Manager' },
  { icon: '🔧', name: 'Self', desc: 'Diagnostic' },
  { icon: '🧠', name: 'AI', desc: 'Inference' },
  { icon: '🗺️', name: 'Path', desc: 'Planning' },
  { icon: '🤝', name: 'Human', desc: 'Interaction' },
  { icon: '📦', name: 'Pick &', desc: 'Place' },
  { icon: '🔊', name: 'Audio', desc: 'Feedback' },
  { icon: '🌡️', name: 'Thermal', desc: 'Sensor' },
  { icon: '📷', name: 'RGB-D', desc: 'Camera' },
  { icon: '🎮', name: 'Remote', desc: 'Control' },
]

export function SkillsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<SkillCard[]>([])
  const animationRef = useRef<number>(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const initCards = useCallback((width: number, height: number) => {
    cardsRef.current = []
    
    // Grille de colonnes sur toute la largeur
    const columns = Math.floor(width / 140) // Une colonne tous les ~140px
    const cardsPerColumn = Math.ceil(height / 100) + 2

    for (let col = 0; col < columns; col++) {
      const colX = (col + 0.5) * (width / columns)
      const direction = col % 2 === 0 ? 'up' : 'down' // Alternance haut/bas
      
      for (let row = 0; row < cardsPerColumn; row++) {
        // Calculer l'opacité en fonction de la distance au centre
        const distFromCenter = Math.abs(colX - width / 2) / (width / 2)
        const baseOpacity = 0.04 + distFromCenter * 0.08 // Plus visible sur les bords
        
        cardsRef.current.push({
          x: colX - 35 + (Math.random() - 0.5) * 30,
          y: row * 100 - 50 + (Math.random() - 0.5) * 40,
          speed: 0.2 + Math.random() * 0.25,
          size: 70,
          opacity: baseOpacity + Math.random() * 0.03,
          skillIndex: Math.floor(Math.random() * SKILLS.length),
          direction,
          column: col
        })
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
      initCards(width, height)
    }

    const drawCard = (card: SkillCard) => {
      const { x, y, size, opacity, skillIndex } = card
      const skill = SKILLS[skillIndex]
      
      // Card background avec rounded corners
      const radius = 14
      ctx.beginPath()
      ctx.roundRect(x, y, size, size, radius)
      
      // Gradient fill subtil
      const gradient = ctx.createLinearGradient(x, y, x + size, y + size)
      gradient.addColorStop(0, `rgba(240, 245, 255, ${opacity})`)
      gradient.addColorStop(1, `rgba(230, 235, 250, ${opacity * 0.6})`)
      ctx.fillStyle = gradient
      ctx.fill()

      // Border très légère
      ctx.strokeStyle = `rgba(180, 190, 220, ${opacity * 0.8})`
      ctx.lineWidth = 1
      ctx.stroke()

      // Icon
      ctx.font = `${size * 0.28}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(skill.icon, x + size / 2, y + size * 0.32)

      // Skill name
      ctx.font = `600 ${size * 0.14}px system-ui, sans-serif`
      ctx.fillStyle = `rgba(40, 50, 80, ${opacity * 4})`
      ctx.fillText(skill.name, x + size / 2, y + size * 0.58)

      // Skill desc
      ctx.font = `${size * 0.12}px system-ui, sans-serif`
      ctx.fillStyle = `rgba(100, 110, 140, ${opacity * 3})`
      ctx.fillText(skill.desc, x + size / 2, y + size * 0.75)
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Update and draw cards
      cardsRef.current.forEach(card => {
        // Movement
        if (card.direction === 'up') {
          card.y -= card.speed
          if (card.y < -card.size - 20) {
            card.y = height + 20
            card.skillIndex = Math.floor(Math.random() * SKILLS.length)
          }
        } else {
          card.y += card.speed
          if (card.y > height + 20) {
            card.y = -card.size - 20
            card.skillIndex = Math.floor(Math.random() * SKILLS.length)
          }
        }

        drawCard(card)
      })

      // Vignette centrale pour garder le texte lisible
      const centerX = width / 2
      const centerY = height / 2
      const vignetteRadius = Math.min(width, height) * 0.55
      
      const vignetteGradient = ctx.createRadialGradient(
        centerX, centerY, vignetteRadius * 0.3,
        centerX, centerY, vignetteRadius
      )
      vignetteGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      vignetteGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)')
      vignetteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.fillStyle = vignetteGradient
      ctx.fillRect(0, 0, width, height)

      animationRef.current = requestAnimationFrame(animate)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isClient, initCards])

  if (!isClient) return null

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  )
}
