import { Shirt } from 'lucide-react'
import type { CSSProperties } from 'react'
import { overallRating, type Player } from '../types'

interface PlayerJerseyProps {
  player: Player
  color: string
  main: number
  cross: number
}

function readableTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0a0f0d' : '#ffffff'
}

export function PlayerJersey({ player, color, main, cross }: PlayerJerseyProps) {
  const style = { '--main': `${main}%`, '--cross': `${cross}%` } as CSSProperties
  const textColor = readableTextColor(color)

  return (
    <div
      className="pitch-jersey absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
      style={style}
    >
      <div className="relative drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        <Shirt size={30} fill={color} color="rgba(0,0,0,0.35)" strokeWidth={1.25} />
        {player.isGoalkeeper && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/40 bg-amber-400 text-[8px] font-black text-black">
            GK
          </span>
        )}
        <span
          className="absolute inset-0 flex items-center justify-center pt-1 text-[9px] font-black"
          style={{ color: textColor }}
        >
          {overallRating(player.stats)}
        </span>
      </div>
      <span className="max-w-[72px] truncate rounded bg-black/60 px-1 text-[10px] leading-tight font-semibold text-white">
        {player.name}
      </span>
    </div>
  )
}
