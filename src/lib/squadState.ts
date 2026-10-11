import type { Player, Rule, TeamSettings } from '../types'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STATE_ID = 'default'

export interface SquadState {
  players: Player[]
  rules: Rule[]
  teamSize: number
  team1Settings: TeamSettings
  team2Settings: TeamSettings
}

interface AppStateRow {
  id: string
  players: Player[]
  rules: Rule[]
  team_size: number
  team1: TeamSettings
  team2: TeamSettings
}

export async function loadSquadState(): Promise<SquadState | null> {
  if (!supabase) return null

  const { data, error } = await supabase.from('app_state').select('*').eq('id', STATE_ID).maybeSingle<AppStateRow>()

  if (error || !data) return null

  return {
    players: data.players ?? [],
    rules: data.rules ?? [],
    teamSize: data.team_size ?? 6,
    team1Settings: data.team1 ?? { name: 'Team 1', color: '#22c55e' },
    team2Settings: data.team2 ?? { name: 'Team 2', color: '#3b82f6' },
  }
}

export async function saveSquadState(state: SquadState): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase.from('app_state').upsert({
    id: STATE_ID,
    players: state.players,
    rules: state.rules,
    team_size: state.teamSize,
    team1: state.team1Settings,
    team2: state.team2Settings,
    updated_at: new Date().toISOString(),
  })

  return !error
}

export { isSupabaseConfigured }
