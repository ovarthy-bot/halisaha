import { ShieldHalf, Trash2, Users } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import type { Player } from '../types'
import { overallRating } from '../types'

interface PlayerListProps {
  players: Player[]
  onDelete: (id: string) => void
  onToggleGoalkeeper: (id: string) => void
  onRename: (id: string, name: string) => void
}

export function PlayerList({ players, onDelete, onToggleGoalkeeper, onRename }: PlayerListProps) {
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
        <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2 text-sm"
            >
              <button
                onClick={() => onToggleGoalkeeper(player.id)}
                className={`shrink-0 rounded-md p-1 transition ${
                  player.isGoalkeeper
                    ? 'text-amber-400 hover:bg-amber-400/10'
                    : 'text-gray-600 hover:bg-white/10 hover:text-gray-300'
                }`}
                title={player.isGoalkeeper ? 'Kalecilikten çıkar' : 'Kaleci olarak işaretle'}
                aria-label={
                  player.isGoalkeeper ? `${player.name} için kaleciliği kaldır` : `${player.name} kaleci yap`
                }
              >
                <ShieldHalf size={14} />
              </button>

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
          ))}
        </ul>
      )}
    </div>
  )
}
