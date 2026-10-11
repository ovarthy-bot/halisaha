import { Armchair, Trash2, Undo2, Users } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { POSITION_COLORS, POSITION_HEX, POSITION_OPTIONS, POSITION_SHORT_LABELS } from '../constants'
import type { Player, Position } from '../types'
import { overallRating } from '../types'

interface PlayerListProps {
  players: Player[]
  onBench: (id: string) => void
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  onSetPosition: (id: string, position: Position) => void
  onRename: (id: string, name: string) => void
}

export function PlayerList({ players, onBench, onRestore, onDelete, onSetPosition, onRename }: PlayerListProps) {
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
    const isSub = player.isSubstitute
    return (
      <li
        key={player.id}
        className={`flex items-center gap-1.5 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2 text-sm ${
          isSub ? 'opacity-60' : ''
        }`}
      >
        {isSub && (
          <button
            onClick={() => onRestore(player.id)}
            className="shrink-0 rounded-md p-1 text-orange-400 transition hover:bg-orange-400/10"
            title="Kadroya al"
            aria-label={`${player.name} kadroya al`}
          >
            <Undo2 size={14} />
          </button>
        )}

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
          onClick={() => (isSub ? onDelete(player.id) : onBench(player.id))}
          className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
          title={isSub ? 'Kalıcı olarak sil' : 'Yedeğe taşı'}
          aria-label={isSub ? `${player.name} adlı oyuncuyu kalıcı olarak sil` : `${player.name} adlı oyuncuyu yedeğe taşı`}
        >
          <Trash2 size={14} />
        </button>
      </li>
    )
  }

  const activePlayers = players.filter((p) => !p.isSubstitute)
  const substitutePlayers = players.filter((p) => p.isSubstitute)

  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Users size={16} className="text-cyan-400" />
          Oyuncu Kadrosu
        </h2>
        <p className="py-6 text-center text-xs text-gray-500">Henüz oyuncu yok. İlk oyuncunu yukarıdan ekle.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Users size={16} className="text-cyan-400" />
          Oyuncu Kadrosu
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal text-gray-300">
            {activePlayers.length}
          </span>
        </h2>

        {activePlayers.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-500">Aktif oyuncu yok, hepsi yedekte.</p>
        ) : (
          <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">{activePlayers.map(renderRow)}</ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-300/80">
          <Armchair size={16} />
          Yedek Oyuncular
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-normal text-gray-300">
            {substitutePlayers.length}
          </span>
        </h2>

        {substitutePlayers.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-500">
            Henüz yedek yok. Kadrodaki bir oyuncuyu çöp kutusu ile buraya taşıyabilirsin.
          </p>
        ) : (
          <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">{substitutePlayers.map(renderRow)}</ul>
        )}
      </div>
    </div>
  )
}
