import { Sparkles } from 'lucide-react'
import { KIT_COLORS, TEAM_SIZE_OPTIONS } from '../constants'
import type { TeamSettings } from '../types'

interface SettingsPanelProps {
  teamSize: number
  onTeamSizeChange: (size: number) => void
  team1: TeamSettings
  team2: TeamSettings
  onTeam1Change: (settings: TeamSettings) => void
  onTeam2Change: (settings: TeamSettings) => void
  onGenerate: () => void
}

function TeamKitEditor({
  label,
  settings,
  onChange,
  accent,
}: {
  label: string
  settings: TeamSettings
  onChange: (settings: TeamSettings) => void
  accent: string
}) {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: accent }}>
          {label}
        </span>
        <input
          type="color"
          value={settings.color}
          onChange={(e) => onChange({ ...settings, color: e.target.value })}
          className="h-6 w-8 cursor-pointer rounded border border-white/20 bg-transparent"
          aria-label={`${label} özel renk`}
        />
      </div>
      <input
        type="text"
        value={settings.name}
        onChange={(e) => onChange({ ...settings, name: e.target.value })}
        placeholder="Takım adı"
        className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-cyan-400/60 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {KIT_COLORS.map((kit) => (
          <button
            key={kit.value}
            type="button"
            onClick={() => onChange({ ...settings, color: kit.value })}
            title={kit.name}
            className={`h-5 w-5 rounded-full border-2 transition ${
              settings.color === kit.value ? 'scale-110 border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: kit.value }}
            aria-label={kit.name}
          />
        ))}
      </div>
    </div>
  )
}

export function SettingsPanel({
  teamSize,
  onTeamSizeChange,
  team1,
  team2,
  onTeam1Change,
  onTeam2Change,
  onGenerate,
}: SettingsPanelProps) {
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TeamKitEditor label="Takım 1" settings={team1} onChange={onTeam1Change} accent={team1.color} />
        <TeamKitEditor label="Takım 2" settings={team2} onChange={onTeam2Change} accent={team2.color} />
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
