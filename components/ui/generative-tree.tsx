"use client"

import { useEffect, useRef } from "react"

export interface GenerativeTreeProps {
  size?: number
  speed?: number
  particleCount?: number
  opacity?: number
  color?: string
  leafColor?: string
  className?: string
}

const MAX_DEPTH = 10

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  color: string
  life: number
  maxLife: number
}

function drawBranch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  depth: number,
  color: string,
  sway: number
) {
  if (depth === 0 || length < 2) return

  const endX = x + Math.cos(angle + sway * 0.02) * length
  const endY = y + Math.sin(angle + sway * 0.02) * length

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(endX, endY)
  ctx.lineWidth = Math.max(0.5, depth * 1.2)
  ctx.strokeStyle = color
  ctx.lineCap = "round"
  ctx.stroke()

  const nextLength = length * 0.72
  const spread = 0.4 + (MAX_DEPTH - depth) * 0.05

  drawBranch(ctx, endX, endY, angle - spread, nextLength, depth - 1, color, sway)
  drawBranch(ctx, endX, endY, angle + spread, nextLength, depth - 1, color, sway)
}

export function GenerativeTree({
  size = 400,
  speed = 1,
  particleCount = 40,
  opacity = 1,
  color = "#4ade80",
  leafColor = "#86efac",
  className,
}: GenerativeTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const particles = particlesRef.current

    const spawnParticle = (tx: number, ty: number) => {
      if (particles.length >= particleCount) {
        particles.splice(0, 1)
      }
      const life = 80 + Math.random() * 120
      particles.push({
        x: tx + (Math.random() - 0.5) * 10,
        y: ty + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.3 + Math.random() * 0.7,
        alpha: 0.7 + Math.random() * 0.3,
        size: 2 + Math.random() * 4,
        color: leafColor,
        life,
        maxLife: life,
      })
    }

    let lastSpawn = 0

    const render = (ts: number) => {
      timeRef.current = ts * 0.001 * speed
      ctx.clearRect(0, 0, size, size)

      ctx.globalAlpha = opacity
      ctx.save()

      // Draw tree
      const sway = Math.sin(timeRef.current * 0.5) * 8
      const trunkX = size / 2
      const trunkY = size - 20
      const trunkLen = size * 0.28

      ctx.strokeStyle = color
      drawBranch(ctx, trunkX, trunkY, -Math.PI / 2, trunkLen, MAX_DEPTH, color, sway)

      ctx.restore()

      // Spawn leaves from top branch tips (approximated)
      if (ts - lastSpawn > 200 / speed) {
        const tipSpread = trunkLen * 0.72 ** 6
        const tipY = trunkY - trunkLen * 2.2
        const tipX = trunkX + (Math.random() - 0.5) * tipSpread * 4
        spawnParticle(tipX, tipY)
        lastSpawn = ts
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= 1
        if (p.life <= 0) { particles.splice(i, 1); continue }
        p.x += p.vx + Math.sin(timeRef.current * 2 + i) * 0.2
        p.y += p.vy
        p.vy += 0.01
        const lifeRatio = p.life / p.maxLife
        ctx.globalAlpha = p.alpha * lifeRatio * opacity

        // Draw oval leaf
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(Math.sin(timeRef.current + i) * 0.5)
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size, p.size * 1.6, 0, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.restore()
      }

      ctx.globalAlpha = 1

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
    }
  }, [size, speed, particleCount, opacity, color, leafColor])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
      aria-label="Animated generative tree"
    />
  )
}
