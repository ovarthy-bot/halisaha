import type { BalancedTeams, PitchPositions, Player, Position, Rule, SavedFormation, TeamSettings } from '../types'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STATE_ID = 'default'
const LOCAL_STORAGE_KEY = 'hali-saha-app-state-v2'

export interface SquadState {
  players: Player[]
  rules: Rule[]
  teamSize: number
  team1Settings: TeamSettings
  team2Settings: TeamSettings
  balanced: BalancedTeams | null
  pitchPositions: PitchPositions
  favorites: SavedFormation[]
}

// Rows saved before the "position"/"isSubstitute" fields existed only had
// `isGoalkeeper`. Normalize on read so old saved data keeps working.
interface LegacyPlayerShape {
  id: string
  name: string
  position?: Position
  isGoalkeeper?: boolean
  isSubstitute?: boolean
  stats?: Player['stats']
}

interface LegacyBalancedShape {
  team1?: LegacyPlayerShape[]
  team2?: LegacyPlayerShape[]
}

interface LegacySavedFormation {
  id?: string
  name?: string
  balanced?: LegacyBalancedShape | null
  pitchPositions?: PitchPositions
  team1Settings?: TeamSettings
  team2Settings?: TeamSettings
  createdAt?: string
}

interface AppStateRow {
  id: string
  players: LegacyPlayerShape[]
  rules: Rule[]
  team_size: number
  team1: TeamSettings
  team2: TeamSettings
  balanced_teams?: LegacyBalancedShape | null
  pitch_positions?: PitchPositions | null
  favorites?: LegacySavedFormation[] | null
}

function normalizePlayer(raw: LegacyPlayerShape): Player {
  return {
    id: raw.id,
    name: raw.name,
    position: raw.position ?? (raw.isGoalkeeper ? 'gk' : 'mid'),
    isSubstitute: raw.isSubstitute ?? false,
    stats: raw.stats ?? { attack: 3, defense: 3, playmaking: 3 },
  }
}

function normalizeBalanced(raw?: LegacyBalancedShape | null): BalancedTeams | null {
  if (!raw || !Array.isArray(raw.team1) || !Array.isArray(raw.team2)) return null
  return {
    team1: raw.team1.map(normalizePlayer),
    team2: raw.team2.map(normalizePlayer),
  }
}

function normalizeFavorite(raw: LegacySavedFormation): SavedFormation | null {
  const balanced = normalizeBalanced(raw.balanced)
  if (!raw.id || !raw.name?.trim() || !balanced) return null
  return {
    id: raw.id,
    name: raw.name,
    balanced,
    pitchPositions: raw.pitchPositions ?? {},
    team1Settings: raw.team1Settings ?? { name: 'Takım 1', color: '#22c55e' },
    team2Settings: raw.team2Settings ?? { name: 'Takım 2', color: '#3b82f6' },
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

function normalizeDbRow(data: AppStateRow): SquadState {
  return {
    players: (data.players ?? []).map(normalizePlayer),
    rules: data.rules ?? [],
    teamSize: data.team_size ?? 6,
    team1Settings: data.team1 ?? { name: 'Takım 1', color: '#22c55e' },
    team2Settings: data.team2 ?? { name: 'Takım 2', color: '#3b82f6' },
    balanced: normalizeBalanced(data.balanced_teams),
    pitchPositions: data.pitch_positions ?? {},
    favorites: (data.favorites ?? []).map(normalizeFavorite).filter((value): value is SavedFormation => value !== null),
  }
}

function readLocalState(): SquadState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SquadState>
    if (!Array.isArray(parsed.players)) return null
    const balanced = normalizeBalanced(parsed.balanced)
    return {
      players: parsed.players.map((player) => normalizePlayer(player as LegacyPlayerShape)),
      rules: parsed.rules ?? [],
      teamSize: parsed.teamSize ?? 6,
      team1Settings: parsed.team1Settings ?? { name: 'Takım 1', color: '#22c55e' },
      team2Settings: parsed.team2Settings ?? { name: 'Takım 2', color: '#3b82f6' },
      balanced,
      pitchPositions: parsed.pitchPositions ?? {},
      favorites: (parsed.favorites ?? [])
        .map((favorite) => normalizeFavorite(favorite as LegacySavedFormation))
        .filter((value): value is SavedFormation => value !== null),
    }
  } catch {
    return null
  }
}

function writeLocalState(state: SquadState): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export interface LoadResult {
  ok: boolean
  state: SquadState | null
}

export async function loadSquadState(): Promise<LoadResult> {
  const localState = readLocalState()
  if (!supabase) return { ok: true, state: localState }

  const { data, error } = await supabase.from('app_state').select('*').eq('id', STATE_ID).maybeSingle<AppStateRow>()

  if (error) return { ok: false, state: localState }
  if (!data) return { ok: true, state: localState }

  const state = normalizeDbRow(data)
  // Refresh the local copy from the cloud so the app can still start with it offline.
  writeLocalState(state)
  return { ok: true, state }
}

export async function saveSquadState(state: SquadState): Promise<boolean> {
  const localOk = writeLocalState(state)
  if (!supabase) return localOk

  const { error } = await supabase.from('app_state').upsert({
    id: STATE_ID,
    players: state.players,
    rules: state.rules,
    team_size: state.teamSize,
    team1: state.team1Settings,
    team2: state.team2Settings,
    balanced_teams: state.balanced,
    pitch_positions: state.pitchPositions,
    favorites: state.favorites,
    updated_at: new Date().toISOString(),
  })

  return !error
}

export { isSupabaseConfigured }
