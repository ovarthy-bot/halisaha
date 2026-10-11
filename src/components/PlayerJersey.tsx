import { Shirt } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Player } from '../types'

interface PlayerJerseyProps {
  player: Player
  color: string
  main: number
  cross: number
}

export function PlayerJersey({ player, color, main, cross }: PlayerJerseyProps) {
  const style = { '--main': `${main}%`, '--cross': `${cross}%` } as CSSProperties

  return (
    <div
      className="pitch-jersey absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={style}
    >
      <div className="relative drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        <Shirt size={30} fill={color} color="rgba(0,0,0,0.35)" strokeWidth={1.25} />
        {player.position === 'gk' && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/40 bg-amber-400 text-[8px] font-black text-black">
            GK
          </span>
        )}
      </div>
      <span className="max-w-[72px] truncate rounded bg-black/60 px-1 text-[10px] leading-tight font-semibold text-white">
        {player.name}
      </span>
    </div>
  )
}
