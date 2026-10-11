import { Sparkles } from 'lucide-react'
import { TEAM_SIZE_OPTIONS } from '../constants'

interface SettingsPanelProps {
  teamSize: number
  onTeamSizeChange: (size: number) => void
  onGenerate: () => void
}

export function SettingsPanel({ teamSize, onTeamSizeChange, onGenerate }: SettingsPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <h2 className="text-sm font-semibold text-white">Maç Ayarları</h2>

      <div>
        <label htmlFor="team-size" className="mb-1 block text-xs font-medium text-gray-400">
          Takım Boyutu
        </label>
        <select
          id="team-size"
          value={teamSize}
          onChange={(e) => onTeamSizeChange(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
        >
          {TEAM_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size} className="bg-gray-900">
              {size}v{size} ({size * 2} oyuncu)
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onGenerate}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 py-2.5 text-sm font-bold text-black shadow-lg shadow-cyan-500/30 transition hover:brightness-110"
      >
        <Sparkles size={16} />
        Dengeli Takımlar Oluştur
      </button>
    </div>
  )
}
