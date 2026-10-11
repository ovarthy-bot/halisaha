import { Shirt } from 'lucide-react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Player } from '../types'

interface PlayerJerseyProps {
  player: Player
  color: string
  main: number
  cross: number
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>, playerId: string) => void
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
}

export function PlayerJersey({ player, color, main, cross, onPointerDown, onPointerMove, onPointerUp }: PlayerJerseyProps) {
  const style = { '--main': `${main}%`, '--cross': `${cross}%` } as CSSProperties

  return (
    <div
      className="pitch-jersey absolute z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none flex-col items-center gap-0.5 active:cursor-grabbing"
      style={style}
      onPointerDown={(event) => onPointerDown(event, player.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={`${player.name} oyuncusunu sahada sürükle`}
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
