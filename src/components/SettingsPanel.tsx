interface SettingsPanelProps {
  teamSize: number
}

export function SettingsPanel({ teamSize }: SettingsPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Maç Ayarları</h2>
        <span className="text-xs text-gray-500">
          {teamSize}v{teamSize} ({teamSize * 2} oyuncu)
        </span>
      </div>
    </div>
  )
}
