'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Obstacle {
  x: number
  passed: boolean
}

export default function JumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'results'>('menu')
  const [balance, setBalance] = useState(20)
  const [bet, setBet] = useState(5)
  const [score, setScore] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [timeLeft, setTimeLeft] = useState(60)
  const [finalWinnings, setFinalWinnings] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  
  const ballRef = useRef({ y: 250, vy: 0, jumping: false })
  const coinSoundRef = useRef<HTMLAudioElement | null>(null)
  const obstaclesRef = useRef<Obstacle[]>([])
  const scoreRef = useRef(0)
  const multiplierRef = useRef(1)
  const gameActiveRef = useRef(false)
  const animationRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const betRef = useRef(1)

  // Load balance from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jumpGameBalance')
    if (saved) {
      setBalance(parseFloat(saved))
    } else {
      setBalance(20)
      setShowWelcome(true)
      setTimeout(() => setShowWelcome(false), 4000)
    }
    
    // Create coin sound
    coinSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+dlJqSk5SYkIFkWVphcIucoJ+VjomLjZCUk46BZ1VZZG+BkZqbmZONiIaGiY6SkoqAdGRfZG14iJOYmJaQi4eFhoiNkZGLgXJoY2dwfouUl5eUj4uHhYWIjJCQi4BxZ2JocX2Lk5eXlI+Lh4WFiIyQkIqAcWdiZ3F9i5OXl5SPi4eFhYiMkJCKgHFnYmdxfYuTl5eUj4uHhYWIjJCQioBxZ2JncX2Lk5eXlI+Lh4WFiIyQkIqAcWdiZ3F9i5OXl5SPi4eFhYiMkJCKgHFnYmdxfYuTl5eUj4uHhYWIjJCQioBxZ2JncX2Lk5eXlI+Lh4WFiIyQkIp/cGZhZnB8io+UlJKOioeGhomNkJCLgHJoY2hyfouUmJiVkIuHhYaJjZGRi4FzaWRpcoGMlZiYlZCLh4aGiY2RkYuBc2lkaXKBjJWYmJWQi4eGhomNkZGLgHNpZGlygYyVmJiVkIuHhoaJjZGRi4FzaWRpc4KNlpmZlpGMiIaGiY2SkYuBdGplam6CjpaZmZWRi4eGhomNkpGKgHNpZGhxgIuUmJiVkIuHhoaJjZGRi4BzaGRpcX+LlJeXlI+Lh4aGiY2RkYuAc2hkaXF/i5SXl5SPi4eGhomNkZGLgHNoZGlxf4uUl5eUj4uHhoaJjZGRi4BzaGRpcX+LlJeXlI+Lh4aGiY2RkYuAc2hkaXF/i5SXl5SPi4eGhomNkZGLgHNoZGlxf4uUl5eUj4uHhoaJjZGRi4BzaGRpcX+LlJeXlI+Lh4aGiY2RkYuAc2hkaXF/i5SXl5SPi4eGhomNkZGLgHNoZGlxf4uUl5eUj4uHhoaJjZGRi4BzaGRpcX+LlJeXlI+Lh4aGiY2RkYt/cmdjZ3B8i5OXl5SPi4aGh4mNkZGKf3JnY2hwfIqSl5eUj4uHhoaJjZGRin9yZ2NocHyKkpeXlI+Lh4aGiY2RkYp/cmdjZ3B8ipKXl5SPi4eGhomNkZGKf3JnY2dwfIqSl5eUj4uHhoaJjZGRin9yZ2NncHyKkpeXlI+Lh4aGiY2RkYp/cmdjZ3B8ipKXl5SPi4eGhomNkZGKf3JnY2dwfIqSl5eUj4uHhoaJjZGRin9yZ2NncHyKkpeXlI+Lh4aGiY2RkYp/cmdjZ3B8ipKXl5SPi4eGhomNkZGKf3JmYmZvfImRlpaUj4qGhoaJjZCQin9yZmJmb3yJkZaWlI+KhoaGiY2QkIp/cmZiZm98iZGWlpSPioaGhomNkJCKf3JmYmZvfImRlpaUj4qGhoaJjZCQin9yZmJmb3yJkZaWlI+KhoaGiY2QkIp/cmZiZm98iZGWlpSPioaGhomNkJCKf3JmYmZvfImRlpaUj4qGhoaJjZCQin9yZmJmb3yJkZaWlI+KhoaGiY2QkIp/cWZhZm57iJCVlZOOiYaFhomMkJCJfnFlYWVueoePk5OPi4eFhYeKjI+PiX5wZGBkbXmGjpKSj4qGhYWHioyPj4l+cGRgZG15ho6Sko+KhoWFh4qMj4+JfnBkYGRteYaOkpKPioaFhYeKjI+PiX5wZGBkbXmGjpKSj4qGhYWHioyPj4l+cGRgZG15ho6Sko+KhoWFh4qMj4+JfnBkYGRteYaOkpKPioaFhYeKjI+PiX5wZGBkbXmGjpKSj4qGhYWHioyPj4l+cGRgZG15ho6Sko+KhoWFh4qMj4+JfnBkYGRteYaOkpKPioaFhYeKjI+PiX5vY19jbHiFjZGRjoqFhISGioyOjoh9b2NfY2x4hY2RkY6KhYSEhoqMjo6IfW9jX2NseIWNkZGOioWEhIaKjI6OiH1vY19jbHiFjZGRjoqFhISGioyOjoh9b2NfY2x4hY2RkY6KhYSEhoqMjo6IfW9jX2NseIWNkZGOioWEhIaKjI6OiH1vY19jbHiFjZGRjoqFhISGioyOjoh9b2NfY2x4hY2RkY6KhYSEhoqMjo6IfW9jX2NseIWNkZGOioWEhIaKjI6OiH1vY19jbHiFjZGRjoqFhISGioyOjoh9b2NfY2x4hY2RkY6KhYSEhoqMjo6IfW5iXmJrd4SMkJCNiYSEhIaKjI6OiH1uYl5ia3eEjJCQjYmEhISGioyOjoh9bmJeYmt3hIyQkI2JhISEhoqMjo6IfW5iXmJrd4SMkJCNiYSEhIaKjI6OiH1uYl5ia3eEjJCQjYmEhISGioyOjoh9bmJeYmt3hIyQkI2JhISEhoqMjo6IfW5iXmJrd4SMkJCNiYSEhIaKjI6OiH1uYl5ia3eEjJCQjYmEhISGioyOjoh9bmJeYmt3hIyQkI2JhISEhoqMjo6IA')
  }, [])

  // Save balance to localStorage
  useEffect(() => {
    localStorage.setItem('jumpGameBalance', balance.toString())
  }, [balance])

  const jump = useCallback(() => {
    if (!gameActiveRef.current) return
    if (!ballRef.current.jumping) {
      ballRef.current.vy = -14
      ballRef.current.jumping = true
    }
  }, [])

  const endGame = useCallback((won: boolean) => {
    gameActiveRef.current = false
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    
    if (won && scoreRef.current > 0) {
      const winnings = betRef.current * multiplierRef.current
      setFinalWinnings(winnings)
      setBalance(prev => prev + winnings)
      setGameState('results')
    } else {
      setFinalWinnings(0)
      setGameState('gameover')
    }
  }, [])

  const startGame = useCallback((continueWithWinnings = false) => {
    let currentBet = bet
    
    if (continueWithWinnings && finalWinnings > 0) {
      currentBet = finalWinnings
    } else {
      if (balance < bet) return
    }
    
    betRef.current = currentBet
    
    if (!continueWithWinnings) {
      setBalance(prev => prev - bet)
    } else {
      setBalance(prev => prev - finalWinnings)
    }
    
    setGameState('playing')
    setScore(0)
    setMultiplier(1)
    setTimeLeft(60)
    
    ballRef.current = { y: 270, vy: 0, jumping: false }
    obstaclesRef.current = [{ x: 500, passed: false }]
    scoreRef.current = 0
    multiplierRef.current = 1
    gameActiveRef.current = true

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [balance, bet, finalWinnings, endGame])

  const resetBalance = useCallback(() => {
    setBalance(20)
    setGameState('menu')
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const groundY = 300
    const gravity = 0.6
    const ballX = 80

    const gameLoop = () => {
      if (!gameActiveRef.current) return

      ctx.fillStyle = '#fce7f3'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#f9a8d4'
      ctx.fillRect(0, groundY, canvas.width, 100)

      const ball = ballRef.current
      ball.vy += gravity
      ball.y += ball.vy

      if (ball.y >= groundY - 25) {
        ball.y = groundY - 25
        ball.vy = 0
        ball.jumping = false
      }

      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(ballX, ball.y, 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 3
      ctx.stroke()

      const obstacles = obstaclesRef.current
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i]
        obs.x -= 3.5

        ctx.fillStyle = '#1f2937'
        ctx.fillRect(obs.x, groundY - 60, 30, 60)

        if (!obs.passed && obs.x + 30 < ballX - 25) {
          obs.passed = true
          scoreRef.current++
          multiplierRef.current = parseFloat((multiplierRef.current + 0.5).toFixed(2))
          setScore(scoreRef.current)
          setMultiplier(multiplierRef.current)
          
          // Play coin sound
          if (coinSoundRef.current) {
            coinSoundRef.current.currentTime = 0
            coinSoundRef.current.play().catch(() => {})
          }
        }

        if (
          ballX + 23 > obs.x &&
          ballX - 23 < obs.x + 30 &&
          ball.y + 23 > groundY - 60
        ) {
          endGame(false)
          return
        }

        if (obs.x < -50) {
          obstacles.splice(i, 1)
        }
      }

      const lastObs = obstacles[obstacles.length - 1]
      if (!lastObs || lastObs.x < canvas.width - 350) {
        obstacles.push({ x: canvas.width + 50, passed: false })
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameState, endGame])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 flex flex-col items-center justify-center p-4">
      {/* Welcome notification */}
      {showWelcome && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl">
            <p className="text-lg font-bold text-center">Parabens! Voce ganhou</p>
            <p className="text-3xl font-bold text-center">R$ 20,00</p>
            <p className="text-sm text-center opacity-90">para comecar a jogar!</p>
          </div>
        </div>
      )}

      {gameState === 'menu' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center">
          <h1 className="text-2xl font-bold text-pink-600 mb-1">Pula Obstaculos</h1>
          <p className="text-pink-400 text-sm mb-4">Clique para pular! Cada obstaculo = 2x</p>
          
          <div className="bg-yellow-100 rounded-xl p-3 mb-4">
            <p className="text-xs text-yellow-600">Seu saldo</p>
            <p className="text-2xl font-bold text-yellow-700">R$ {balance.toFixed(2)}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs text-pink-400 mb-2">Escolha sua aposta</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map(value => (
                <button
                  key={value}
                  onClick={() => setBet(value)}
                  disabled={balance < value}
                  className={`py-2 rounded-lg font-bold text-sm transition-all ${
                    bet === value
                      ? 'bg-pink-500 text-white scale-105'
                      : balance < value
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-pink-100 text-pink-600'
                  }`}
                >
                  R${value}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={balance < bet}
            className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl text-lg disabled:bg-gray-300"
          >
            JOGAR
          </button>

          {balance < 1 && (
            <button
              onClick={resetBalance}
              className="w-full mt-3 py-2 bg-gray-500 text-white font-bold rounded-xl"
            >
              Resetar (R$20)
            </button>
          )}
        </div>
      )}

      {gameState === 'playing' && (
        <div 
          className="w-full max-w-md"
          onClick={jump}
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
        >
          <div className="bg-white rounded-xl p-3 mb-3 flex justify-between items-center">
            <span className="text-pink-600 font-bold text-lg">{timeLeft}s</span>
            <span className="text-green-500 font-bold text-xl">{multiplier}x</span>
            <span className="text-pink-400 text-sm">R${(betRef.current * multiplier).toFixed(2)}</span>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full rounded-2xl shadow-xl cursor-pointer"
            style={{ touchAction: 'none' }}
          />

          <p className="text-center text-pink-500 mt-3 font-medium">
            Toque para pular!
          </p>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h2>
          <p className="text-gray-500 mb-4">Voce bateu no obstaculo</p>
          
          <div className="bg-red-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-red-400">Voce perdeu</p>
            <p className="text-xl font-bold text-red-500">-R$ {betRef.current.toFixed(2)}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400">Obstaculos: {score} | Saldo: R$ {balance.toFixed(2)}</p>
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl"
          >
            Voltar
          </button>
        </div>
      )}

      {gameState === 'results' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center">
          <h2 className="text-2xl font-bold text-green-500 mb-2">Tempo Esgotado!</h2>
          
          <div className="space-y-2 mb-4">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-400">Obstaculos</p>
              <p className="text-xl font-bold text-blue-600">{score}</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs text-purple-400">Multiplicador</p>
              <p className="text-xl font-bold text-purple-600">{multiplier}x</p>
            </div>

            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-400">Ganho</p>
              <p className="text-2xl font-bold text-green-500">R$ {finalWinnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-yellow-600">Novo saldo</p>
            <p className="text-xl font-bold text-yellow-700">R$ {balance.toFixed(2)}</p>
          </div>

          <button
            onClick={() => startGame(true)}
            disabled={balance < finalWinnings}
            className="w-full py-3 bg-purple-500 text-white font-bold rounded-xl mb-3 disabled:bg-gray-300"
          >
            Continuar e Multiplicar (R$ {finalWinnings.toFixed(2)})
          </button>

          <button
            onClick={() => window.location.href = 'https://v0-create-page-from-example.vercel.app'}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-xl"
          >
            Sacar Agora
          </button>
        </div>
      )}
    </div>
  )
}
