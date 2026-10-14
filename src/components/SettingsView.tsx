import { KIT_COLORS, TEAM_SIZE_OPTIONS } from '../constants'
import type { Player, PlayerStats, Rule, SavedFormation, TeamSettings } from '../types'
import { FavoritesPanel } from './FavoritesPanel'
import { PlayerForm } from './PlayerForm'
import { RulesPanel } from './RulesPanel'
import { SkillBalancePanel } from './SkillBalancePanel'

interface SettingsViewProps {
  teamSize: number
  onTeamSizeChange: (size: number) => void
  team1: TeamSettings
  team2: TeamSettings
  onTeam1Change: (settings: TeamSettings) => void
  onTeam2Change: (settings: TeamSettings) => void
  players: Player[]
  allPlayers: Player[]
  rules: Rule[]
  onAddRule: (rule: Omit<Rule, 'id'>) => void
  onDeleteRule: (id: string) => void
  onAddPlayer: (player: Omit<Player, 'id'>) => void
  onUpdateStats: (id: string, stats: PlayerStats) => void
  favorites: SavedFormation[]
  onLoadFavorite: (id: string) => void
  onDeleteFavorite: (id: string) => void
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
  teamSize,
  onTeamSizeChange,
  team1,
  team2,
  onTeam1Change,
  onTeam2Change,
  players,
  allPlayers,
  rules,
  onAddRule,
  onDeleteRule,
  onAddPlayer,
  onUpdateStats,
  favorites,
  onLoadFavorite,
  onDeleteFavorite,
}: SettingsViewProps) {
  return (
    <div className="space-y-4">
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
      </div>

      <FavoritesPanel favorites={favorites} onLoad={onLoadFavorite} onDelete={onDeleteFavorite} />

      <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
        <h2 className="text-sm font-semibold text-white">Takım Kitleri</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TeamKitEditor label="Takım 1" settings={team1} onChange={onTeam1Change} accent={team1.color} />
          <TeamKitEditor label="Takım 2" settings={team2} onChange={onTeam2Change} accent={team2.color} />
        </div>
      </div>

      <PlayerForm onAdd={onAddPlayer} />

      <SkillBalancePanel players={allPlayers} onUpdateStats={onUpdateStats} />

      <RulesPanel players={players} rules={rules} onAdd={onAddRule} onDelete={onDeleteRule} />
    </div>
  )
}
