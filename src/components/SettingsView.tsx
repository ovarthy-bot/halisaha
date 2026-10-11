import { Shield, Swords, Wand2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { KIT_COLORS } from '../constants'
import type { Player, Rule, TeamSettings } from '../types'
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

function DisabledStatPreview({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          {icon}
          {label}
        </span>
        <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-xs font-bold text-gray-500 tabular-nums">3</span>
      </div>
      <input type="range" min={1} max={5} value={3} disabled readOnly className="w-full cursor-not-allowed opacity-40" />
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

      <RulesPanel players={players} rules={rules} onAdd={onAddRule} onDelete={onDeleteRule} />

      <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
        <h2 className="text-sm font-semibold text-white">Beceri Dengeleme</h2>
        <div className="space-y-3">
          <DisabledStatPreview label="Atak" icon={<Swords size={12} />} />
          <DisabledStatPreview label="Defans" icon={<Shield size={12} />} />
          <DisabledStatPreview label="Oyun Kurma" icon={<Wand2 size={12} />} />
        </div>
        <p className="text-[11px] text-gray-600">
          Oyuncu beceri puanlarına göre dengeleme şu an pasif — yakında aktif edilecek.
        </p>
      </div>
    </div>
  )
}
