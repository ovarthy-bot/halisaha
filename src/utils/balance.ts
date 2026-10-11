import { type Player, overallRating, type Rule, totalRating } from '../types'

export interface BalanceResult {
  team1: Player[]
  team2: Player[]
  team1Rating: number
  team2Rating: number
  difference: number
}

export type BalanceOutcome = { ok: true; result: BalanceResult } | { ok: false; error: string }

/** Union-find used to merge players tied together by "together" rules into one block. */
class UnionFind {
  private parent = new Map<string, string>()

  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x)
    const p = this.parent.get(x)!
    if (p !== x) {
      const root = this.find(p)
      this.parent.set(x, root)
      return root
    }
    return x
  }

  union(a: string, b: string) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent.set(ra, rb)
  }
}

interface Block {
  id: string
  players: Player[]
  size: number
  rating: number
}

function buildBlocks(
  players: Player[],
  togetherRules: Rule[],
): { blocksByPlayer: Map<string, string>; blocks: Map<string, Block> } {
  const uf = new UnionFind()
  for (const p of players) uf.find(p.id)
  for (const r of togetherRules) uf.union(r.player1Id, r.player2Id)

  const blocksByPlayer = new Map<string, string>()
  const blocks = new Map<string, Block>()
  for (const p of players) {
    const root = uf.find(p.id)
    blocksByPlayer.set(p.id, root)
    let block = blocks.get(root)
    if (!block) {
      block = { id: root, players: [], size: 0, rating: 0 }
      blocks.set(root, block)
    }
    block.players.push(p)
    block.size += 1
    block.rating += overallRating(p.stats)
  }
  return { blocksByPlayer, blocks }
}

/** 2-colors every block so that blocks linked by an "apart" edge end up in different colors. */
function colorBlocks(blockIds: string[], adjacency: Map<string, Set<string>>) {
  const colors = new Map<string, 0 | 1>()
  const componentOf = new Map<string, number>()
  let conflict = false
  let componentIndex = 0

  for (const start of blockIds) {
    if (colors.has(start)) continue
    colors.set(start, 0)
    componentOf.set(start, componentIndex)
    const queue = [start]
    while (queue.length) {
      const node = queue.shift()!
      const color = colors.get(node)!
      for (const neighbor of adjacency.get(node) ?? []) {
        if (!colors.has(neighbor)) {
          colors.set(neighbor, color === 0 ? 1 : 0)
          componentOf.set(neighbor, componentIndex)
          queue.push(neighbor)
        } else if (colors.get(neighbor) === color) {
          conflict = true
        }
      }
    }
    componentIndex += 1
  }

  return { colors, componentOf, conflict }
}

interface ComponentOption {
  sizeA: number
  ratingA: number
  blocksA: string[]
  sizeB: number
  ratingB: number
  blocksB: string[]
}

/**
 * Each connected component (a group of blocks chained by "apart" rules) can be placed
 * in one of two orientations. Picks an orientation per component — via an exact
 * subset-size-sum DP — so the two resulting groups have exactly `targetSize` and
 * `total - targetSize` players and as close to equal rating as possible.
 */
function solveComponents(
  components: ComponentOption[],
  targetSize: number,
): { group0BlockIds: Set<string>; group1BlockIds: Set<string> } | null {
  const n = components.length
  const total = components.reduce((sum, c) => sum + c.ratingA + c.ratingB, 0)

  if (targetSize < 0) return null

  const dp: boolean[][][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: targetSize + 1 }, () => new Array(total + 1).fill(false)),
  )
  dp[0][0][0] = true

  for (let i = 1; i <= n; i++) {
    const c = components[i - 1]
    for (let k = 0; k <= targetSize; k++) {
      for (let s = 0; s <= total; s++) {
        let ok = k >= c.sizeA && s >= c.ratingA && dp[i - 1][k - c.sizeA][s - c.ratingA]
        if (!ok && k >= c.sizeB && s >= c.ratingB) ok = dp[i - 1][k - c.sizeB][s - c.ratingB]
        dp[i][k][s] = ok
      }
    }
  }

  let bestSum = -1
  let bestDiff = Infinity
  for (let s = 0; s <= total; s++) {
    if (dp[n][targetSize][s]) {
      const diff = Math.abs(s - (total - s))
      if (diff < bestDiff) {
        bestDiff = diff
        bestSum = s
      }
    }
  }
  if (bestSum === -1) return null

  const group0BlockIds = new Set<string>()
  const group1BlockIds = new Set<string>()
  let k = targetSize
  let s = bestSum
  for (let i = n; i >= 1; i--) {
    const c = components[i - 1]
    const usedA = k >= c.sizeA && s >= c.ratingA && dp[i - 1][k - c.sizeA][s - c.ratingA]
    if (usedA) {
      for (const id of c.blocksA) group0BlockIds.add(id)
      for (const id of c.blocksB) group1BlockIds.add(id)
      k -= c.sizeA
      s -= c.ratingA
    } else {
      for (const id of c.blocksB) group0BlockIds.add(id)
      for (const id of c.blocksA) group1BlockIds.add(id)
      k -= c.sizeB
      s -= c.ratingB
    }
  }

  return { group0BlockIds, group1BlockIds }
}

export function generateBalancedTeams(players: Player[], teamSize: number, rules: Rule[] = []): BalanceOutcome {
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

  const keepersAll = players.filter((p) => p.isGoalkeeper)
  if (keepersAll.length < 2) {
    return {
      ok: false,
      error: `Not enough goalkeepers. Mark at least 2 players as Goalkeeper (1 per team) — currently ${keepersAll.length}.`,
    }
  }

  const playerIds = new Set(players.map((p) => p.id))
  const activeRules = rules.filter(
    (r) => playerIds.has(r.player1Id) && playerIds.has(r.player2Id) && r.player1Id !== r.player2Id,
  )
  const togetherRules = activeRules.filter((r) => r.type === 'together')
  const apartRules = activeRules.filter((r) => r.type === 'apart')

  const { blocksByPlayer, blocks } = buildBlocks(players, togetherRules)

  for (const r of apartRules) {
    if (blocksByPlayer.get(r.player1Id) === blocksByPlayer.get(r.player2Id)) {
      const p1 = players.find((p) => p.id === r.player1Id)
      const p2 = players.find((p) => p.id === r.player2Id)
      return {
        ok: false,
        error: `Rule conflict: ${p1?.name ?? '?'} and ${p2?.name ?? '?'} are marked both "together" and "apart".`,
      }
    }
  }

  let keeperA: Player | null = null
  let keeperB: Player | null = null
  for (let i = 0; i < keepersAll.length && !keeperA; i++) {
    for (let j = i + 1; j < keepersAll.length; j++) {
      if (blocksByPlayer.get(keepersAll[i].id) !== blocksByPlayer.get(keepersAll[j].id)) {
        keeperA = keepersAll[i]
        keeperB = keepersAll[j]
        break
      }
    }
  }
  if (!keeperA || !keeperB) {
    return {
      ok: false,
      error:
        'Goalkeepers can\'t be split across two teams — check your "together" rules. Each team needs its own goalkeeper.',
    }
  }

  const adjacency = new Map<string, Set<string>>()
  function addEdge(a: string, b: string) {
    if (!adjacency.has(a)) adjacency.set(a, new Set())
    if (!adjacency.has(b)) adjacency.set(b, new Set())
    adjacency.get(a)!.add(b)
    adjacency.get(b)!.add(a)
  }
  for (const r of apartRules) {
    addEdge(blocksByPlayer.get(r.player1Id)!, blocksByPlayer.get(r.player2Id)!)
  }
  addEdge(blocksByPlayer.get(keeperA.id)!, blocksByPlayer.get(keeperB.id)!)

  const allBlockIds = Array.from(blocks.keys())
  const { colors, componentOf, conflict } = colorBlocks(allBlockIds, adjacency)
  if (conflict) {
    return {
      ok: false,
      error: 'Your "apart" rules contradict each other — no split can satisfy all of them at once.',
    }
  }

  const componentGroups = new Map<number, { colorA: string[]; colorB: string[] }>()
  for (const blockId of allBlockIds) {
    const comp = componentOf.get(blockId)!
    const color = colors.get(blockId)!
    if (!componentGroups.has(comp)) componentGroups.set(comp, { colorA: [], colorB: [] })
    const entry = componentGroups.get(comp)!
    if (color === 0) entry.colorA.push(blockId)
    else entry.colorB.push(blockId)
  }

  const componentOptions: ComponentOption[] = []
  for (const { colorA, colorB } of componentGroups.values()) {
    const sizeA = colorA.reduce((s, id) => s + blocks.get(id)!.size, 0)
    const ratingA = colorA.reduce((s, id) => s + blocks.get(id)!.rating, 0)
    const sizeB = colorB.reduce((s, id) => s + blocks.get(id)!.size, 0)
    const ratingB = colorB.reduce((s, id) => s + blocks.get(id)!.rating, 0)
    componentOptions.push({ sizeA, ratingA, blocksA: colorA, sizeB, ratingB, blocksB: colorB })
  }

  const solved = solveComponents(componentOptions, teamSize)
  if (!solved) {
    return {
      ok: false,
      error: `Could not form two ${teamSize}v${teamSize} teams that satisfy all the rules — try removing a rule.`,
    }
  }

  const team1: Player[] = []
  const team2: Player[] = []
  for (const blockId of solved.group0BlockIds) team1.push(...blocks.get(blockId)!.players)
  for (const blockId of solved.group1BlockIds) team2.push(...blocks.get(blockId)!.players)

  const team1Rating = totalRating(team1)
  const team2Rating = totalRating(team2)
  const difference = Math.abs(team1Rating - team2Rating)

  return { ok: true, result: { team1, team2, team1Rating, team2Rating, difference } }
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
