'use client'

import dynamic from 'next/dynamic'

const HelixJumpGame = dynamic(() => import('@/components/helix-jump-game'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-gradient-to-b from-pink-100 to-pink-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-600 font-bold">Carregando jogo...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return <HelixJumpGame />
}
