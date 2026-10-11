import { Plus, Shield, Swords, Wand2 } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import type { Player, PlayerStats } from '../types'

interface PlayerFormProps {
  onAdd: (player: Omit<Player, 'id'>) => void
}

const DEFAULT_STATS: PlayerStats = { attack: 3, defense: 3, playmaking: 3 }

function StatSlider({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: ReactNode
  value: number
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
          {icon}
          {label}
        </label>
        <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-cyan-300 tabular-nums">
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
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

export function PlayerForm({ onAdd }: PlayerFormProps) {
  const [name, setName] = useState('')
  const [isGoalkeeper, setIsGoalkeeper] = useState(false)
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({ name: trimmed, isGoalkeeper, stats })
    setName('')
    setIsGoalkeeper(false)
    setStats(DEFAULT_STATS)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Plus size={16} className="text-emerald-400" />
        Add Player
      </h2>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Player name"
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-cyan-400/60 focus:outline-none"
      />

      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={isGoalkeeper}
          onChange={(e) => setIsGoalkeeper(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-black/40 accent-cyan-400"
        />
        Goalkeeper
      </label>

      <div className="space-y-3 pt-1">
        <StatSlider
          label="Attack"
          icon={<Swords size={12} />}
          value={stats.attack}
          onChange={(v) => setStats((s) => ({ ...s, attack: v }))}
        />
        <StatSlider
          label="Defense"
          icon={<Shield size={12} />}
          value={stats.defense}
          onChange={(v) => setStats((s) => ({ ...s, defense: v }))}
        />
        <StatSlider
          label="Playmaking"
          icon={<Wand2 size={12} />}
          value={stats.playmaking}
          onChange={(v) => setStats((s) => ({ ...s, playmaking: v }))}
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add to Pool
      </button>
    </form>
  )
}
