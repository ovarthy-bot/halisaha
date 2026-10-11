export interface PlayerStats {
  attack: number
  defense: number
  playmaking: number
}

export interface Player {
  id: string
  name: string
  isGoalkeeper: boolean
  stats: PlayerStats
}

export type TeamId = 'team1' | 'team2'

export interface TeamSettings {
  name: string
  color: string
}

export interface BalancedTeams {
  team1: Player[]
  team2: Player[]
}

export function overallRating(stats: PlayerStats): number {
  return stats.attack + stats.defense + stats.playmaking
}

export function totalRating(players: Player[]): number {
  return players.reduce((sum, p) => sum + overallRating(p.stats), 0)
}
