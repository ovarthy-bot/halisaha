import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { PitchPositions, Player, TeamSettings } from '../types'
import { assignPositions, type PositionedPlayer } from '../utils/balance'
import { PitchLines } from './PitchLines'
import { PlayerJersey } from './PlayerJersey'

interface PitchProps {
  team1: Player[]
  team2: Player[]
  team1Settings: TeamSettings
  team2Settings: TeamSettings
  positions: PitchPositions
  onPositionChange: (playerId: string, position: PitchPositions[string]) => void
  onPositionCommit: (playerId: string, position: PitchPositions[string]) => void
}

const ROLE_DEPTH: Record<PositionedPlayer['role'], number> = { gk: 0.14, def: 0.36, mid: 0.58, att: 0.82 }
const ROLE_ORDER: PositionedPlayer['role'][] = ['gk', 'def', 'mid', 'att']

function laneFor(index: number, count: number): number {
  if (count <= 1) return 50
  return 12 + (index / (count - 1)) * 76
}

interface LaidOutPlayer {
  player: Player
  main: number
  cross: number
}

function layoutTeam(team: Player[], side: 'left' | 'right', positions: PitchPositions): LaidOutPlayer[] {
  const positioned = assignPositions(team)
  const groups: Record<PositionedPlayer['role'], PositionedPlayer[]> = { gk: [], def: [], mid: [], att: [] }
  for (const entry of positioned) groups[entry.role].push(entry)

  return ROLE_ORDER.flatMap((role) => {
    const depth = ROLE_DEPTH[role]
    const main = side === 'left' ? depth * 50 : 100 - depth * 50
    return groups[role].map((entry, idx) => {
      const manual = positions[entry.player.id]
      return {
        player: entry.player,
        main: manual?.main ?? main,
        cross: manual?.cross ?? laneFor(idx, groups[role].length),
      }
    })
  })
}

function TeamLabel({ side, settings }: { side: 'left' | 'right'; settings: TeamSettings }) {
  const main = side === 'left' ? 25 : 75
  const style = { '--main': `${main}%`, '--cross': '18%' } as CSSProperties

  return (
    <div
      className="pitch-jersey absolute -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-lg backdrop-blur-sm"
      style={{ ...style, borderColor: settings.color, color: settings.color, backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      {settings.name || (side === 'left' ? 'Takım 1' : 'Takım 2')}
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function Pitch({
  team1,
  team2,
  team1Settings,
  team2Settings,
  positions,
  onPositionChange,
  onPositionCommit,
}: PitchProps) {
  const pitchRef = useRef<HTMLDivElement>(null)
  const draggingPlayerRef = useRef<string | null>(null)
  const hasPlayers = team1.length > 0 || team2.length > 0
  const team1Positions = team1.length > 0 ? layoutTeam(team1, 'left', positions) : []
  const team2Positions = team2.length > 0 ? layoutTeam(team2, 'right', positions) : []

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>, playerId: string) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    draggingPlayerRef.current = playerId
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function positionFromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const pitch = pitchRef.current
    if (!pitch) return null
    const rect = pitch.getBoundingClientRect()
    if (!rect.width || !rect.height) return null

    // At mobile widths the pitch is displayed vertically: main/cross axes swap.
    const portraitLayout = window.matchMedia('(max-width: 639.98px)').matches
    const mainPercent = portraitLayout
      ? ((event.clientY - rect.top) / rect.height) * 100
      : ((event.clientX - rect.left) / rect.width) * 100
    const crossPercent = portraitLayout
      ? ((event.clientX - rect.left) / rect.width) * 100
      : ((event.clientY - rect.top) / rect.height) * 100

    return {
      main: clamp(mainPercent, 5, 95),
      cross: clamp(crossPercent, 8, 92),
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const playerId = draggingPlayerRef.current
    if (!playerId) return
    event.preventDefault()
    const position = positionFromPointer(event)
    if (position) onPositionChange(playerId, position)
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const playerId = draggingPlayerRef.current
    if (playerId) {
      const position = positionFromPointer(event)
      if (position) onPositionCommit(playerId, position)
    }
    draggingPlayerRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      ref={pitchRef}
      className="relative mx-auto aspect-[2/3] h-full w-auto max-w-full overflow-hidden rounded-2xl border-4 border-emerald-950 shadow-2xl sm:h-auto sm:w-full sm:aspect-[16/10] sm:max-w-none"
    >
      <PitchLines />

      {!hasPlayers && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="rounded-xl bg-black/50 px-4 py-2 text-center text-sm text-gray-300 backdrop-blur-sm">
            Oyuncu ekleyip takımları oluşturunca sahada görünecekler
          </p>
        </div>
      )}

      {hasPlayers && (
        <>
          <TeamLabel side="left" settings={team1Settings} />
          <TeamLabel side="right" settings={team2Settings} />
        </>
      )}

      {team1Positions.map(({ player, main, cross }) => (
        <PlayerJersey
          key={player.id}
          player={player}
          color={team1Settings.color}
          main={main}
          cross={cross}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ))}
      {team2Positions.map(({ player, main, cross }) => (
        <PlayerJersey
          key={player.id}
          player={player}
          color={team2Settings.color}
          main={main}
          cross={cross}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ))}
    </div>
  )
}
