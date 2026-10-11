import { ArrowLeftRight, ShieldHalf } from 'lucide-react'
import type { Player, TeamId, TeamSettings } from '../types'
import { overallRating } from '../types'

interface TeamRosterEditorProps {
  team1: Player[]
  team2: Player[]
  team1Settings: TeamSettings
  team2Settings: TeamSettings
  onMovePlayer: (playerId: string, from: TeamId) => void
}

function Column({
  team,
  settings,
  side,
  arrowDirection,
  onMovePlayer,
}: {
  team: Player[]
  settings: TeamSettings
  side: TeamId
  arrowDirection: 'left' | 'right'
  onMovePlayer: (playerId: string, from: TeamId) => void
}) {
  return (
    <div className="flex-1 space-y-1.5">
      <h3 className="truncate text-xs font-bold tracking-wide uppercase" style={{ color: settings.color }}>
        {settings.name || (side === 'team1' ? 'Team 1' : 'Team 2')}
      </h3>
      {team.map((player) => (
        <div
          key={player.id}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-black/30 px-2 py-1.5 text-xs"
        >
          {arrowDirection === 'left' && (
            <button
              onClick={() => onMovePlayer(player.id, side)}
              className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-white/10 hover:text-white"
              aria-label={`Move ${player.name} to the other team`}
            >
              <ArrowLeftRight size={12} />
            </button>
          )}
          {player.isGoalkeeper && <ShieldHalf size={12} className="shrink-0 text-amber-400" />}
          <span className="flex-1 truncate text-gray-100">{player.name}</span>
          <span className="rounded bg-gray-800 px-1 py-0.5 text-[10px] font-bold text-emerald-300 tabular-nums">
            {overallRating(player.stats)}
          </span>
          {arrowDirection === 'right' && (
            <button
              onClick={() => onMovePlayer(player.id, side)}
              className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-white/10 hover:text-white"
              aria-label={`Move ${player.name} to the other team`}
            >
              <ArrowLeftRight size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export function TeamRosterEditor({ team1, team2, team1Settings, team2Settings, onMovePlayer }: TeamRosterEditorProps) {
  if (team1.length === 0 && team2.length === 0) return null

  return (
    <div className="mx-auto mb-3 w-full max-w-xl rounded-xl border border-white/10 bg-gray-900/50 p-3 backdrop-blur-xl sm:max-w-none">
      <div className="flex gap-3">
        <Column team={team1} settings={team1Settings} side="team1" arrowDirection="right" onMovePlayer={onMovePlayer} />
        <div className="w-px shrink-0 bg-white/10" />
        <Column team={team2} settings={team2Settings} side="team2" arrowDirection="left" onMovePlayer={onMovePlayer} />
      </div>
    </div>
  )
}
