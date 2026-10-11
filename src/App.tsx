import { ArrowLeft, Cloud, CloudOff, Goal, Loader2, Menu, Settings, Users, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Pitch } from './components/Pitch'
import { PlayerList } from './components/PlayerList'
import { SettingsPanel } from './components/SettingsPanel'
import { SettingsView } from './components/SettingsView'
import { TeamRosterEditor } from './components/TeamRosterEditor'
import { Toast, type ToastMessage } from './components/Toast'
import { TeamSummary } from './components/TeamSummary'
import { defaultPlayers } from './data/defaultPlayers'
import { isSupabaseConfigured, loadSquadState, saveSquadState } from './lib/squadState'
import type { BalancedTeams, Player, Position, Rule, TeamId, TeamSettings } from './types'
import { generateBalancedTeams } from './utils/balance'

type SyncStatus = 'offline' | 'loading' | 'saving' | 'saved' | 'error'

let nextId = 0
function createId() {
  nextId += 1
  return `player-${Date.now()}-${nextId}`
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>(defaultPlayers)
  const [rules, setRules] = useState<Rule[]>([])
  const [teamSize, setTeamSize] = useState(7)
  const [team1Settings, setTeam1Settings] = useState<TeamSettings>({ name: 'Takım 1', color: '#22c55e' })
  const [team2Settings, setTeam2Settings] = useState<TeamSettings>({ name: 'Takım 2', color: '#3b82f6' })
  const [balanced, setBalanced] = useState<BalancedTeams | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isSupabaseConfigured ? 'loading' : 'offline')

  const hasLoadedRef = useRef(!isSupabaseConfigured)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    loadSquadState().then(({ ok, state }) => {
      if (state) {
        setPlayers(state.players)
        setRules(state.rules)
        setTeamSize(state.teamSize)
        setTeam1Settings(state.team1Settings)
        setTeam2Settings(state.team2Settings)
      }
      hasLoadedRef.current = true
      setSyncStatus(ok ? 'saved' : 'error')
    })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !hasLoadedRef.current) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    setSyncStatus('saving')
    saveTimeoutRef.current = setTimeout(() => {
      saveSquadState({ players, rules, teamSize, team1Settings, team2Settings }).then((ok) => {
        setSyncStatus(ok ? 'saved' : 'error')
      })
    }, 800)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [players, rules, teamSize, team1Settings, team2Settings])

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
    setRules((prev) => prev.filter((r) => r.player1Id !== id && r.player2Id !== id))
    setBalanced(null)
  }

  function handleSetPosition(id: string, position: Position) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, position } : p)))
  }

  function handleToggleSubstitute(id: string) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, isSubstitute: !p.isSubstitute } : p)))
  }

  function handleRenamePlayer(id: string, name: string) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  function handleAddRule(rule: Omit<Rule, 'id'>) {
    setRules((prev) => [...prev, { ...rule, id: createId() }])
  }

  function handleDeleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  function handleGenerate() {
    const activePlayers = players.filter((p) => !p.isSubstitute)
    const outcome = generateBalancedTeams(activePlayers, teamSize, rules)
    if (!outcome.ok) {
      showToast(outcome.error, 'error')
      setBalanced(null)
      return
    }
    setBalanced({ team1: outcome.result.team1, team2: outcome.result.team2 })
    showToast(`Takımlar oluşturuldu! Puan farkı: ${outcome.result.difference}.`, 'success')
    setSidebarOpen(false)
    setSettingsOpen(false)
  }

  function handleMovePlayer(playerId: string, from: TeamId) {
    setBalanced((prev) => {
      if (!prev) return prev
      const source = from === 'team1' ? prev.team1 : prev.team2
      const target = from === 'team1' ? prev.team2 : prev.team1
      const player = source.find((p) => p.id === playerId)
      if (!player) return prev

      const nextSource = source.filter((p) => p.id !== playerId)
      const nextTarget = [...target, player]

      return from === 'team1' ? { team1: nextSource, team2: nextTarget } : { team1: nextTarget, team2: nextSource }
    })
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
            {settingsOpen ? (
              <Settings className="text-emerald-400" size={22} />
            ) : (
              <Goal className="text-emerald-400" size={22} />
            )}
            {settingsOpen ? 'Ayarlar' : 'Kadro Oluşturucu'}
          </h1>
          <div className="flex items-center gap-2">
            <SyncIndicator status={syncStatus} />
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label={settingsOpen ? 'Oyunculara dön' : 'Ayarları aç'}
              title={settingsOpen ? 'Oyunculara dön' : 'Ayarlar'}
            >
              {settingsOpen ? <ArrowLeft size={18} /> : <Settings size={18} />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 lg:hidden"
              aria-label="Paneli kapat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {settingsOpen ? (
          <SettingsView
            team1={team1Settings}
            team2={team2Settings}
            onTeam1Change={setTeam1Settings}
            onTeam2Change={setTeam2Settings}
            players={players.filter((p) => !p.isSubstitute)}
            rules={rules}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onAddPlayer={handleAddPlayer}
          />
        ) : (
          <div className="space-y-4">
            <SettingsPanel teamSize={teamSize} onTeamSizeChange={setTeamSize} onGenerate={handleGenerate} />
            <PlayerList
              players={players}
              onDelete={handleDeletePlayer}
              onSetPosition={handleSetPosition}
              onToggleSubstitute={handleToggleSubstitute}
              onRename={handleRenamePlayer}
            />
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Panel örtüsünü kapat"
        />
      )}

      {/* Main pitch area */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pb-24 lg:pb-4">
        {balanced && (
          <TeamSummary
            team1Settings={team1Settings}
            team2Settings={team2Settings}
            team1Rating={teamRatings.team1Rating}
            team2Rating={teamRatings.team2Rating}
            difference={difference}
          />
        )}

        <div className="flex min-h-0 flex-1 w-full items-center justify-center">
          <Pitch
            team1={balanced?.team1 ?? []}
            team2={balanced?.team2 ?? []}
            team1Settings={team1Settings}
            team2Settings={team2Settings}
          />
        </div>
      </main>

      {/* Roster drawer — slides in beside the pitch on mobile, and on lg+ genuinely narrows
          the pitch area (a static column) instead of overlaying it, so it's truly side-by-side. */}
      {balanced && (
        <aside
          className={`fixed inset-y-0 right-0 z-40 overflow-hidden border-l border-white/10 bg-gray-950/95 backdrop-blur-xl transition-all duration-300 lg:static lg:z-auto lg:bg-gray-950/60 ${
            rosterOpen
              ? 'w-full max-w-xs translate-x-0 sm:max-w-sm lg:w-[320px] lg:shrink-0'
              : 'w-full max-w-xs translate-x-full sm:max-w-sm lg:w-0 lg:translate-x-0 lg:border-l-0'
          }`}
        >
          <div className="h-full w-full max-w-xs overflow-y-auto p-4 sm:max-w-sm lg:w-[320px]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users size={16} className="text-cyan-400" />
                Kadrolar
              </h2>
              <button
                onClick={() => setRosterOpen(false)}
                className="rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Kadro listesini kapat"
              >
                <X size={18} />
              </button>
            </div>
            <TeamRosterEditor
              team1={balanced.team1}
              team2={balanced.team2}
              team1Settings={team1Settings}
              team2Settings={team2Settings}
              onMovePlayer={handleMovePlayer}
            />
          </div>
        </aside>
      )}

      {/* Roster drawer backdrop — mobile only; desktop shows it side-by-side with the pitch */}
      {balanced && rosterOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setRosterOpen(false)}
          aria-label="Kadro listesi örtüsünü kapat"
        />
      )}

      {/* Roster drawer toggle — hidden once the drawer is open; its own header has the close button */}
      {balanced && !rosterOpen && (
        <button
          onClick={() => setRosterOpen(true)}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2.5 text-sm font-bold text-black shadow-xl shadow-cyan-500/30"
          aria-label="Kadro listesini aç"
        >
          <Users size={18} />
        </button>
      )}

      {/* Mobile toggle button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-bold text-black shadow-xl shadow-emerald-500/30 lg:hidden"
        >
          <Menu size={18} />
          Oyuncuları Yönet ({players.length})
        </button>
      )}
    </div>
  )
}

function SyncIndicator({ status }: { status: SyncStatus }) {
  if (status === 'offline') {
    return (
      <span
        className="flex items-center gap-1 text-xs text-gray-500"
        title="Supabase yapılandırılmadı — değişiklikler yalnızca bu cihazda kalır"
      >
        <CloudOff size={13} />
        Yalnızca yerel
      </span>
    )
  }
  if (status === 'loading') {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Loader2 size={13} className="animate-spin" />
        Yükleniyor...
      </span>
    )
  }
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-cyan-300">
        <Loader2 size={13} className="animate-spin" />
        Kaydediliyor...
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400" title="Supabase'e ulaşılamadı">
        <CloudOff size={13} />
        Kayıt hatası
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-emerald-400">
      <Cloud size={13} />
      Kaydedildi
    </span>
  )
}
