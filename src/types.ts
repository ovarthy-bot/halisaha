export interface PlayerStats {
  attack: number
  defense: number
  playmaking: number
}

export type Position = 'gk' | 'def' | 'mid' | 'fwd'

export interface Player {
  id: string
  name: string
  position: Position
  isSubstitute: boolean
  stats: PlayerStats
}

export type TeamId = 'team1' | 'team2'

export type RuleType = 'together' | 'apart'

export interface Rule {
  id: string
  type: RuleType
  player1Id: string
  player2Id: string
}

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
