"use client"

import { useState, useEffect, useRef } from "react"
import type { Card } from "./types"
import { LOGO_URLS, TECHNOLOGIES } from "./constants"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  radius: number
  life: number
}

const COLORS = ["#b320fd", "#f95a00", "#f3348a"]

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    initializeGame()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const initializeGame = () => {
    const shuffledCards = [...TECHNOLOGIES, ...TECHNOLOGIES]
      .sort(() => Math.random() - 0.5)
      .map((name, index) => ({
        id: index,
        name,
        imageUrl: LOGO_URLS[name],
        flipped: false,
        matched: false,
      }))
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
  }

  const createParticles = (x: number, y: number) => {
    for (let i = 0; i < 30; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 - 2,
        radius: Math.random() * 3 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 60,
      })
    }
  }

  const animateParticles = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life--

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()

      return particle.life > 0
    })

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animateParticles)
    }
  }

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return
    if (cards[id].matched) return
    if (flippedCards.length === 1 && flippedCards[0] === id) return

    const newCards = [...cards]
    newCards[id].flipped = true
    setCards(newCards)

    setFlippedCards([...flippedCards, id])
    setMoves(moves + 1)

    if (flippedCards.length === 1) {
      if (cards[flippedCards[0]].name === newCards[id].name) {
        newCards[flippedCards[0]].matched = true
        newCards[id].matched = true
        setMatchedPairs(matchedPairs + 1)
        setFlippedCards([])

        // Trigger particles for both matched cards
        const elements = document.querySelectorAll(`[data-card-id="${id}"], [data-card-id="${flippedCards[0]}"]`)
        elements.forEach((element) => {
          if (element instanceof HTMLElement) {
            const rect = element.getBoundingClientRect()
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2)
          }
        })
        animateParticles()
      } else {
        setTimeout(() => {
          newCards[flippedCards[0]].flipped = false
          newCards[id].flipped = false
          setCards(newCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] p-4">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute top-0 left-0 pointer-events-none"
      />
      <h1 className="text-3xl font-bold mb-4">YOUKNOW Memory Game</h1>
      <div className="mb-4 space-x-4">
        <span className="font-medium">Moves: {moves}</span>
        <span className="font-medium">Matched Pairs: {matchedPairs}</span>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {cards.map((card) => (
          <div
            key={card.id}
            data-card-id={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-24 h-24 flex items-center justify-center rounded-lg cursor-pointer
              transition-all duration-300 transform hover:scale-105
              ${card.flipped ? "bg-[#2ad48d]" : "bg-gray-200"}
              ${card.matched ? "opacity-70" : "opacity-100"}
            `}
          >
            {card.flipped && (
              <img src={card.imageUrl || "/placeholder.svg"} alt={card.name} className="w-16 h-16 object-contain" />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={initializeGame}
        className="mt-6 px-6 py-2 bg-[#2ad48d] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Reset Game
      </button>
    </div>
  )
}

