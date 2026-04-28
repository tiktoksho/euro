import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameState {
  money: number
  currentBet: number
  score: number
  highScore: number
  gameState: 'betting' | 'playing' | 'gameover'
  combo: number
  
  setMoney: (money: number) => void
  setBet: (bet: number) => void
  setScore: (score: number) => void
  addScore: (points: number) => void
  setGameState: (state: 'betting' | 'playing' | 'gameover') => void
  setCombo: (combo: number) => void
  startGame: () => void
  endGame: (won: boolean, multiplier: number) => void
  resetMoney: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      money: 20,
      currentBet: 1,
      score: 0,
      highScore: 0,
      gameState: 'betting',
      combo: 0,

      setMoney: (money) => set({ money }),
      setBet: (bet) => set({ currentBet: bet }),
      setScore: (score) => set({ score }),
      addScore: (points) => set((state) => ({ 
        score: state.score + points,
        highScore: Math.max(state.highScore, state.score + points)
      })),
      setGameState: (gameState) => set({ gameState }),
      setCombo: (combo) => set({ combo }),
      
      startGame: () => {
        const { money, currentBet } = get()
        if (money >= currentBet) {
          set({ 
            money: money - currentBet, 
            gameState: 'playing', 
            score: 0,
            combo: 0
          })
        }
      },
      
      endGame: (won, multiplier) => {
        const { currentBet, score, highScore } = get()
        const winnings = won ? Math.floor(currentBet * multiplier) : 0
        set((state) => ({ 
          money: state.money + winnings,
          gameState: 'gameover',
          highScore: Math.max(highScore, score)
        }))
      },
      
      resetMoney: () => set({ money: 20 }),
    }),
    {
      name: 'helix-jump-storage',
    }
  )
)
