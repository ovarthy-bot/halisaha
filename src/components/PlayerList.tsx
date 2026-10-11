import { ShieldHalf, Trash2, Users } from 'lucide-react'
import type { Player } from '../types'
import { overallRating } from '../types'

interface PlayerListProps {
  players: Player[]
  onDelete: (id: string) => void
}

export function PlayerList({ players, onDelete }: PlayerListProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Users size={16} className="text-cyan-400" />
        Player Pool
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal text-gray-300">
          {players.length}
        </span>
      </h2>

      {players.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">No players yet. Add your first player above.</p>
      ) : (
        <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2 text-sm"
            >
              {player.isGoalkeeper && (
                <ShieldHalf size={14} className="shrink-0 text-amber-400" aria-label="Goalkeeper" />
              )}
              <span className="flex-1 truncate text-gray-100">{player.name}</span>
              <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-emerald-300 tabular-nums">
                {overallRating(player.stats)}
              </span>
              <button
                onClick={() => onDelete(player.id)}
                className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label={`Delete ${player.name}`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
