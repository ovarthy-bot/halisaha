import { Sparkles } from 'lucide-react'

interface SettingsPanelProps {
  teamSize: number
  onGenerate: () => void
}

export function SettingsPanel({ teamSize, onGenerate }: SettingsPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Maç Ayarları</h2>
        <span className="text-xs text-gray-500">
          {teamSize}v{teamSize} ({teamSize * 2} oyuncu)
        </span>
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
