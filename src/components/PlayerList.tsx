import { Armchair, Trash2, Users } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { POSITION_COLORS, POSITION_HEX, POSITION_OPTIONS, POSITION_SHORT_LABELS } from '../constants'
import type { Player, Position } from '../types'
import { overallRating } from '../types'

interface PlayerListProps {
  players: Player[]
  onDelete: (id: string) => void
  onSetPosition: (id: string, position: Position) => void
  onToggleSubstitute: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function PlayerList({ players, onDelete, onSetPosition, onToggleSubstitute, onRename }: PlayerListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')

  function startEditing(player: Player) {
    setEditingId(player.id)
    setDraftName(player.name)
  }

  function commitEdit() {
    if (editingId) {
      const trimmed = draftName.trim()
      if (trimmed) onRename(editingId, trimmed)
    }
    setEditingId(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  function renderRow(player: Player) {
    return (
      <li
        key={player.id}
        className={`flex items-center gap-1.5 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2 text-sm ${
          player.isSubstitute ? 'opacity-60' : ''
        }`}
      >
        <button
          onClick={() => onToggleSubstitute(player.id)}
          className={`shrink-0 rounded-md p-1 transition ${
            player.isSubstitute
              ? 'text-orange-400 hover:bg-orange-400/10'
              : 'text-gray-600 hover:bg-white/10 hover:text-gray-300'
          }`}
          title={player.isSubstitute ? 'Kadroya al' : 'Yedek olarak işaretle'}
          aria-label={player.isSubstitute ? `${player.name} kadroya al` : `${player.name} yedek yap`}
        >
          <Armchair size={14} />
        </button>

        <select
          value={player.position}
          onChange={(e) => onSetPosition(player.id, e.target.value as Position)}
          className={`shrink-0 rounded-md border border-white/10 bg-black/40 px-1 py-1 text-[11px] font-bold focus:border-cyan-400/60 focus:outline-none ${POSITION_COLORS[player.position]}`}
          aria-label={`${player.name} için ana mevki`}
        >
          {POSITION_OPTIONS.map((pos) => (
            <option key={pos} value={pos} className="bg-gray-900" style={{ color: POSITION_HEX[pos] }}>
              {POSITION_SHORT_LABELS[pos]}
            </option>
          ))}
        </select>

        {editingId === player.id ? (
          <input
            type="text"
            value={draftName}
            autoFocus
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-md border border-cyan-400/60 bg-black/60 px-1.5 py-0.5 text-sm text-white focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => startEditing(player)}
            className="flex-1 truncate rounded-md px-1 py-0.5 text-left text-gray-100 transition hover:bg-white/5"
            title="Adı düzenlemek için tıkla"
          >
            {player.name}
          </button>
        )}

        <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-emerald-300 tabular-nums">
          {overallRating(player.stats)}
        </span>
        <button
          onClick={() => onDelete(player.id)}
          className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
          aria-label={`${player.name} adlı oyuncuyu sil`}
        >
          <Trash2 size={14} />
        </button>
      </li>
    )
  }

  const activePlayers = players.filter((p) => !p.isSubstitute)
  const substitutePlayers = players.filter((p) => p.isSubstitute)

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Users size={16} className="text-cyan-400" />
        Oyuncu Kadrosu
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal text-gray-300">
          {players.length}
        </span>
      </h2>

      {players.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">Henüz oyuncu yok. İlk oyuncunu yukarıdan ekle.</p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          <ul className="space-y-1.5">{activePlayers.map(renderRow)}</ul>

          {substitutePlayers.length > 0 && (
            <div>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-orange-300/80">
                <Armchair size={12} />
                Yedekler ({substitutePlayers.length})
              </h3>
              <ul className="space-y-1.5">{substitutePlayers.map(renderRow)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
