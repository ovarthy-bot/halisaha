import type { TeamSettings } from '../types'

interface TeamSummaryProps {
  team1Settings: TeamSettings
  team2Settings: TeamSettings
  team1Rating: number
  team2Rating: number
  difference: number
}

export function TeamSummary({ team1Settings, team2Settings, team1Rating, team2Rating, difference }: TeamSummaryProps) {
  const total = team1Rating + team2Rating || 1
  const team1Share = (team1Rating / total) * 100

  return (
    <div className="mx-auto mb-3 w-full max-w-xl rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3 backdrop-blur-xl sm:max-w-none">
      <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        <span style={{ color: team1Settings.color }}>
          {team1Settings.name || 'Takım 1'} · {team1Rating}
        </span>
        <span className="text-xs font-normal text-gray-400">
          {difference === 0 ? 'Mükemmel dengeli' : `Fark: ${difference}`}
        </span>
        <span style={{ color: team2Settings.color }}>
          {team2Settings.name || 'Takım 2'} · {team2Rating}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-black/40">
        <div style={{ width: `${team1Share}%`, backgroundColor: team1Settings.color }} />
        <div style={{ width: `${100 - team1Share}%`, backgroundColor: team2Settings.color }} />
      </div>
    </div>
  )
}
