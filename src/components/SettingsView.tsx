import { KIT_COLORS } from '../constants'
import type { Player, Rule, TeamSettings } from '../types'
import { PlayerForm } from './PlayerForm'
import { RulesPanel } from './RulesPanel'

interface SettingsViewProps {
  team1: TeamSettings
  team2: TeamSettings
  onTeam1Change: (settings: TeamSettings) => void
  onTeam2Change: (settings: TeamSettings) => void
  players: Player[]
  rules: Rule[]
  onAddRule: (rule: Omit<Rule, 'id'>) => void
  onDeleteRule: (id: string) => void
  onAddPlayer: (player: Omit<Player, 'id'>) => void
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

export function SettingsView({
  team1,
  team2,
  onTeam1Change,
  onTeam2Change,
  players,
  rules,
  onAddRule,
  onDeleteRule,
  onAddPlayer,
}: SettingsViewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
        <h2 className="text-sm font-semibold text-white">Takım Kitleri</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TeamKitEditor label="Takım 1" settings={team1} onChange={onTeam1Change} accent={team1.color} />
          <TeamKitEditor label="Takım 2" settings={team2} onChange={onTeam2Change} accent={team2.color} />
        </div>
      </div>

      <PlayerForm onAdd={onAddPlayer} />

      <RulesPanel players={players} rules={rules} onAdd={onAddRule} onDelete={onDeleteRule} />
    </div>
  )
}
