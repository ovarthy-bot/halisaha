import { Plus, Shield, ShieldHalf, Swords, Wand2 } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { POSITION_LABELS, POSITION_OPTIONS } from '../constants'
import type { Player, PlayerStats, Position } from '../types'

interface PlayerFormProps {
  onAdd: (player: Omit<Player, 'id'>) => void
}

const DEFAULT_STATS: PlayerStats = { attack: 3, defense: 3, playmaking: 3 }

const POSITION_ICONS: Record<Position, ReactNode> = {
  gk: <ShieldHalf size={13} />,
  def: <Shield size={13} />,
  mid: <Wand2 size={13} />,
  fwd: <Swords size={13} />,
}

function StatSlider({
  label,
  icon,
  value,
}: {
  label: string
  icon: ReactNode
  value: number
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          {icon}
          {label}
        </label>
        <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-gray-500 tabular-nums">
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        disabled
        readOnly
        className="w-full cursor-not-allowed opacity-40"
      />
    </div>
  )
}

export function PlayerForm({ onAdd }: PlayerFormProps) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position>('mid')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({ name: trimmed, position, isSubstitute: false, stats: DEFAULT_STATS })
    setName('')
    setPosition('mid')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Plus size={16} className="text-emerald-400" />
        Oyuncu Ekle
      </h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Oyuncu adı"
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-cyan-400/60 focus:outline-none"
      />

      <div>
        <span className="mb-1 block text-xs font-medium text-gray-400">Ana Mevki</span>
        <div className="grid grid-cols-2 gap-1.5">
          {POSITION_OPTIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                position === pos
                  ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {POSITION_ICONS[pos]}
              {POSITION_LABELS[pos]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <StatSlider label="Atak" icon={<Swords size={12} />} value={DEFAULT_STATS.attack} />
        <StatSlider label="Defans" icon={<Shield size={12} />} value={DEFAULT_STATS.defense} />
        <StatSlider label="Oyun Kurma" icon={<Wand2 size={12} />} value={DEFAULT_STATS.playmaking} />
        <p className="text-[11px] text-gray-600">Beceri puanları şu an pasif — yakında aktif edilecek.</p>
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Kadroya Ekle
      </button>
    </form>
  )
}
