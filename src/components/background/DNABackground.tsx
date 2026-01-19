'use client'

import { useEffect, useRef, useState } from 'react'

export function DNABackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
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
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      }
    }

    // Configuration des hélices ADN
    const helixConfig = {
      count: 3, // Nombre d'hélices
      amplitude: 60, // Amplitude de l'ondulation
      frequency: 0.008, // Fréquence de l'onde
      speed: 0.015, // Vitesse de défilement
      nodeSpacing: 25, // Espacement entre les nodes
      nodeSize: 3, // Taille des nodes
      lineWidth: 1.5, // Épaisseur des lignes
    }

    let time = 0

    const animate = () => {
      if (!ctx) return
      
      ctx.clearRect(0, 0, width, height)
      time += helixConfig.speed

      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y

      // Dessiner chaque hélice ADN
      for (let h = 0; h < helixConfig.count; h++) {
        const baseX = (width / (helixConfig.count + 1)) * (h + 1)
        const phaseOffset = h * Math.PI * 0.7

        // Dessiner les deux brins de l'hélice
        for (let strand = 0; strand < 2; strand++) {
          const strandPhase = strand * Math.PI

          ctx.beginPath()
          
          for (let y = -20; y <= height + 20; y += 2) {
            const waveOffset = Math.sin((y * helixConfig.frequency) + time + phaseOffset + strandPhase)
            let x = baseX + waveOffset * helixConfig.amplitude

            // Interaction souris - légère déformation
            const dx = mouseX - x
            const dy = mouseY - y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const maxDist = 120
            
            if (distance < maxDist && distance > 0) {
              const force = (1 - distance / maxDist) * 15
              x -= (dx / distance) * force
            }

            if (y === -20) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }

          // Gradient pour le brin
          const gradient = ctx.createLinearGradient(0, 0, 0, height)
          const baseAlpha = 0.12
          gradient.addColorStop(0, `rgba(100, 180, 255, ${baseAlpha * 0.3})`)
          gradient.addColorStop(0.3, `rgba(140, 160, 220, ${baseAlpha})`)
          gradient.addColorStop(0.7, `rgba(180, 140, 200, ${baseAlpha})`)
          gradient.addColorStop(1, `rgba(140, 180, 255, ${baseAlpha * 0.3})`)

          ctx.strokeStyle = gradient
          ctx.lineWidth = helixConfig.lineWidth
          ctx.stroke()
        }

        // Dessiner les connexions horizontales entre les brins
        for (let y = 0; y <= height; y += helixConfig.nodeSpacing) {
          const waveOffset1 = Math.sin((y * helixConfig.frequency) + time + phaseOffset)
          const waveOffset2 = Math.sin((y * helixConfig.frequency) + time + phaseOffset + Math.PI)
          
          let x1 = baseX + waveOffset1 * helixConfig.amplitude
          let x2 = baseX + waveOffset2 * helixConfig.amplitude

          // Interaction souris
          const midX = (x1 + x2) / 2
          const dx = mouseX - midX
          const dy = mouseY - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 120
          
          if (distance < maxDist && distance > 0) {
            const force = (1 - distance / maxDist) * 15
            const pushX = -(dx / distance) * force
            x1 += pushX
            x2 += pushX
          }

          // Calculer la "profondeur" pour l'effet 3D
          const depth = (waveOffset1 + 1) / 2 // 0 à 1
          const alpha = 0.05 + depth * 0.08

          // Ligne de connexion
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y)
          ctx.strokeStyle = `rgba(160, 180, 220, ${alpha})`
          ctx.lineWidth = 1
          ctx.stroke()

          // Nodes aux extrémités
          const nodeAlpha = 0.15 + depth * 0.2

          // Node gauche
          ctx.beginPath()
          ctx.arc(x1, y, helixConfig.nodeSize + depth * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(120, 180, 255, ${nodeAlpha})`
          ctx.fill()

          // Node droit
          ctx.beginPath()
          ctx.arc(x2, y, helixConfig.nodeSize + depth * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200, 150, 220, ${nodeAlpha})`
          ctx.fill()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    container.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isClient])

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
