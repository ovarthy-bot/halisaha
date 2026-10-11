import { type Player, overallRating, totalRating } from '../types'

export interface BalanceResult {
  team1: Player[]
  team2: Player[]
  team1Rating: number
  team2Rating: number
  difference: number
}

export type BalanceOutcome = { ok: true; result: BalanceResult } | { ok: false; error: string }

/**
 * Finds a subset of `pool` with exactly `groupSize` players whose summed rating
 * is as close as possible to `targetSum`, via an exact subset-size-sum DP.
 * Pool sizes here are small (<= ~20), so the DP stays cheap.
 */
function splitFieldPlayers(
  pool: Player[],
  groupSize: number,
  targetSum: number,
): { groupA: Player[]; groupB: Player[] } | null {
  const n = pool.length
  const ratings = pool.map((p) => overallRating(p.stats))
  const maxSum = ratings.reduce((a, b) => a + b, 0)

  if (groupSize < 0 || groupSize > n) return null

  // dp[i][k][s] = achievable using a subset of size k, summing to s, from the first i items
  const dp: boolean[][][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: groupSize + 1 }, () => new Array(maxSum + 1).fill(false)),
  )
  dp[0][0][0] = true

  for (let i = 1; i <= n; i++) {
    const rating = ratings[i - 1]
    for (let k = 0; k <= groupSize; k++) {
      for (let s = 0; s <= maxSum; s++) {
        const skip = dp[i - 1][k][s]
        const take = k > 0 && s - rating >= 0 ? dp[i - 1][k - 1][s - rating] : false
        dp[i][k][s] = skip || take
      }
    }
  }

  let bestSum = -1
  let bestDiff = Infinity
  for (let s = 0; s <= maxSum; s++) {
    if (dp[n][groupSize][s]) {
      const diff = Math.abs(s - targetSum)
      if (diff < bestDiff) {
        bestDiff = diff
        bestSum = s
      }
    }
  }
  if (bestSum === -1) return null

  const chosen = new Set<number>()
  let k = groupSize
  let s = bestSum
  for (let i = n; i >= 1; i--) {
    const rating = ratings[i - 1]
    if (dp[i - 1][k][s]) {
      // omitting item i-1 still reaches (k, s) from the first i-1 items — skip it
      continue
    }
    chosen.add(i - 1)
    k -= 1
    s -= rating
  }

  const groupA = pool.filter((_, idx) => chosen.has(idx))
  const groupB = pool.filter((_, idx) => !chosen.has(idx))
  return { groupA, groupB }
}

export function generateBalancedTeams(players: Player[], teamSize: number): BalanceOutcome {
  const required = teamSize * 2

  if (players.length === 0) {
    return { ok: false, error: 'Add some players before generating teams.' }
  }

  if (players.length !== required) {
    const word = players.length > required ? 'too many' : 'not enough'
    return {
      ok: false,
      error: `You have ${word} players for ${teamSize}v${teamSize}: need exactly ${required}, currently have ${players.length}.`,
    }
  }

  const keepers = players.filter((p) => p.isGoalkeeper)
  if (keepers.length < 2) {
    return {
      ok: false,
      error: `Not enough goalkeepers. Mark at least 2 players as Goalkeeper (1 per team) — currently ${keepers.length}.`,
    }
  }

  const [keeperA, keeperB] = keepers
  const fieldPool = players.filter((p) => p.id !== keeperA.id && p.id !== keeperB.id)
  const neededPerSide = teamSize - 1
  const totalField = fieldPool.reduce((sum, p) => sum + overallRating(p.stats), 0)

  let best: { diff: number; result: BalanceResult } | null = null

  const keeperOrderings: Array<[Player, Player]> = [
    [keeperA, keeperB],
    [keeperB, keeperA],
  ]

  for (const [kA, kB] of keeperOrderings) {
    const baseA = overallRating(kA.stats)
    const baseB = overallRating(kB.stats)
    const target = (totalField - baseA + baseB) / 2
    const split = splitFieldPlayers(fieldPool, neededPerSide, target)
    if (!split) continue

    const team1 = [kA, ...split.groupA]
    const team2 = [kB, ...split.groupB]
    const team1Rating = totalRating(team1)
    const team2Rating = totalRating(team2)
    const diff = Math.abs(team1Rating - team2Rating)

    if (!best || diff < best.diff) {
      best = { diff, result: { team1, team2, team1Rating, team2Rating, difference: diff } }
    }
  }

  if (!best) {
    return { ok: false, error: 'Could not generate balanced teams with the current player pool.' }
  }

  return { ok: true, result: best.result }
}

export interface Formation {
  defenders: number
  midfielders: number
  attackers: number
}

export function getFormation(outfieldCount: number): Formation {
  if (outfieldCount <= 0) return { defenders: 0, midfielders: 0, attackers: 0 }
  if (outfieldCount === 1) return { defenders: 0, midfielders: 0, attackers: 1 }
  if (outfieldCount === 2) return { defenders: 1, midfielders: 0, attackers: 1 }
  if (outfieldCount === 3) return { defenders: 1, midfielders: 1, attackers: 1 }

  let defenders = Math.max(2, Math.round(outfieldCount * 0.4))
  let attackers = Math.max(1, Math.round(outfieldCount * 0.2))
  let midfielders = outfieldCount - defenders - attackers

  if (midfielders < 1) {
    midfielders = 1
    defenders = Math.max(1, Math.floor((outfieldCount - midfielders) / 2))
    attackers = outfieldCount - midfielders - defenders
  }

  return { defenders, midfielders, attackers }
}

export interface PositionedPlayer {
  player: Player
  role: 'gk' | 'def' | 'mid' | 'att'
}

export function assignPositions(team: Player[]): PositionedPlayer[] {
  const gk = team.find((p) => p.isGoalkeeper) ?? team[0]
  const outfield = team.filter((p) => p.id !== gk.id)
  const formation = getFormation(outfield.length)

  const remaining = [...outfield]
  const byDefense = [...remaining].sort((a, b) => b.stats.defense - a.stats.defense)
  const defenders = byDefense.slice(0, formation.defenders)
  const afterDef = remaining.filter((p) => !defenders.includes(p))

  const byPlaymaking = [...afterDef].sort((a, b) => b.stats.playmaking - a.stats.playmaking)
  const midfielders = byPlaymaking.slice(0, formation.midfielders)
  const attackers = afterDef.filter((p) => !midfielders.includes(p))

  return [
    { player: gk, role: 'gk' as const },
    ...defenders.map((player) => ({ player, role: 'def' as const })),
    ...midfielders.map((player) => ({ player, role: 'mid' as const })),
    ...attackers.map((player) => ({ player, role: 'att' as const })),
  ]
}
