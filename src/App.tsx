import { Goal, Menu, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Pitch } from './components/Pitch'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { SettingsPanel } from './components/SettingsPanel'
import { Toast, type ToastMessage } from './components/Toast'
import { TeamSummary } from './components/TeamSummary'
import type { BalancedTeams, Player, TeamSettings } from './types'
import { generateBalancedTeams } from './utils/balance'

let nextId = 0
function createId() {
  nextId += 1
  return `player-${Date.now()}-${nextId}`
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teamSize, setTeamSize] = useState(6)
  const [team1Settings, setTeam1Settings] = useState<TeamSettings>({ name: 'Team 1', color: '#22c55e' })
  const [team2Settings, setTeam2Settings] = useState<TeamSettings>({ name: 'Team 2', color: '#3b82f6' })
  const [balanced, setBalanced] = useState<BalancedTeams | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const difference = useMemo(() => {
    if (!balanced) return 0
    const r1 = balanced.team1.reduce((s, p) => s + p.stats.attack + p.stats.defense + p.stats.playmaking, 0)
    const r2 = balanced.team2.reduce((s, p) => s + p.stats.attack + p.stats.defense + p.stats.playmaking, 0)
    return Math.abs(r1 - r2)
  }, [balanced])

  const teamRatings = useMemo(() => {
    if (!balanced) return { team1Rating: 0, team2Rating: 0 }
    const rate = (team: Player[]) => team.reduce((s, p) => s + p.stats.attack + p.stats.defense + p.stats.playmaking, 0)
    return { team1Rating: rate(balanced.team1), team2Rating: rate(balanced.team2) }
  }, [balanced])

  function showToast(text: string, variant: ToastMessage['variant']) {
    setToast({ id: Date.now(), text, variant })
  }

  function handleAddPlayer(player: Omit<Player, 'id'>) {
    setPlayers((prev) => [...prev, { ...player, id: createId() }])
  }

  function handleDeletePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
    setBalanced(null)
  }

  function handleGenerate() {
    const outcome = generateBalancedTeams(players, teamSize)
    if (!outcome.ok) {
      showToast(outcome.error, 'error')
      setBalanced(null)
      return
    }
    setBalanced({ team1: outcome.result.team1, team2: outcome.result.team2 })
    showToast(
      `Teams generated! Rating difference: ${outcome.result.difference}.`,
      'success',
    )
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0f0d] text-white lg:flex-row">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Sidebar */}
      <aside
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0a0f0d]/95 p-4 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:h-full lg:max-h-none lg:w-[380px] lg:translate-y-0 lg:shrink-0 lg:overflow-y-auto lg:rounded-none lg:border-t-0 lg:border-r lg:border-white/10 lg:bg-gray-950/60 ${
          sidebarOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Goal className="text-emerald-400" size={22} />
            Squad Builder
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 lg:hidden"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <SettingsPanel
            teamSize={teamSize}
            onTeamSizeChange={setTeamSize}
            team1={team1Settings}
            team2={team2Settings}
            onTeam1Change={setTeam1Settings}
            onTeam2Change={setTeam2Settings}
            onGenerate={handleGenerate}
          />
          <PlayerForm onAdd={handleAddPlayer} />
          <PlayerList players={players} onDelete={handleDeletePlayer} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close panel overlay"
        />
      )}

      {/* Main pitch area */}
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-4 pb-24 lg:pb-4">
        {balanced && (
          <TeamSummary
            team1Settings={team1Settings}
            team2Settings={team2Settings}
            team1Rating={teamRatings.team1Rating}
            team2Rating={teamRatings.team2Rating}
            difference={difference}
          />
        )}
        <Pitch
          team1={balanced?.team1 ?? []}
          team2={balanced?.team2 ?? []}
          team1Settings={team1Settings}
          team2Settings={team2Settings}
        />
      </main>

      {/* Mobile toggle button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-bold text-black shadow-xl shadow-emerald-500/30 lg:hidden"
        >
          <Menu size={18} />
          Manage Players ({players.length})
        </button>
      )}
    </div>
  )
}
