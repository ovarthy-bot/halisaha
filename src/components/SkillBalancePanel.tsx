import { Shield, SlidersHorizontal, Swords, Wand2 } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import type { Player, PlayerStats } from '../types'
import { overallRating } from '../types'

interface SkillBalancePanelProps {
  players: Player[]
  onUpdateStats: (id: string, stats: PlayerStats) => void
}

const STAT_FIELDS: { key: keyof PlayerStats; label: string; icon: ReactNode }[] = [
  { key: 'attack', label: 'Atak', icon: <Swords size={12} /> },
  { key: 'defense', label: 'Defans', icon: <Shield size={12} /> },
  { key: 'playmaking', label: 'Oyun Kurma', icon: <Wand2 size={12} /> },
]

export function SkillBalancePanel({ players, onUpdateStats }: SkillBalancePanelProps) {
  const [selectedId, setSelectedId] = useState('')
  const selectId = useId()

  const selected = players.find((p) => p.id === selectedId) ?? null

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <SlidersHorizontal size={16} className="text-emerald-400" />
        Beceri Dengeleme
      </h2>

      {players.length === 0 ? (
        <p className="text-xs text-gray-500">Puan ayarlamak için önce oyuncu ekleyin.</p>
      ) : (
        <>
          <select
            id={selectId}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
          >
            <option value="" className="bg-gray-900">
              Oyuncu seç...
            </option>
            {players.map((p) => (
              <option key={p.id} value={p.id} className="bg-gray-900">
                {p.name}
                {p.isSubstitute ? ' (yedek)' : ''}
              </option>
            ))}
          </select>

          {selected && (
            <div className="space-y-3 pt-1">
              {STAT_FIELDS.map(({ key, label, icon }) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                      {icon}
                      {label}
                    </span>
                    <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-emerald-300 tabular-nums">
                      {selected.stats[key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={selected.stats[key]}
                    onChange={(e) =>
                      onUpdateStats(selected.id, { ...selected.stats, [key]: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-400"
                    aria-label={`${selected.name} için ${label}`}
                  />
                </div>
              ))}
              <p className="text-[11px] text-gray-600">
                Toplam puan: <span className="font-semibold text-emerald-300">{overallRating(selected.stats)}</span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
