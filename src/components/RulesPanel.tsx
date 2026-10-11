import { Link2, Shuffle, Trash2, Users2 } from 'lucide-react'
import { useId, useState } from 'react'
import type { Player, Rule, RuleType } from '../types'

interface RulesPanelProps {
  players: Player[]
  rules: Rule[]
  onAdd: (rule: Omit<Rule, 'id'>) => void
  onDelete: (id: string) => void
}

export function RulesPanel({ players, rules, onAdd, onDelete }: RulesPanelProps) {
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [type, setType] = useState<RuleType>('together')
  const selectId1 = useId()
  const selectId2 = useId()

  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? 'Unknown'

  const canAdd =
    player1Id &&
    player2Id &&
    player1Id !== player2Id &&
    !rules.some(
      (r) =>
        r.type === type &&
        ((r.player1Id === player1Id && r.player2Id === player2Id) ||
          (r.player1Id === player2Id && r.player2Id === player1Id)),
    )

  function handleAdd() {
    if (!canAdd) return
    onAdd({ type, player1Id, player2Id })
    setPlayer1Id('')
    setPlayer2Id('')
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Link2 size={16} className="text-violet-400" />
        Rules
      </h2>

      {players.length < 2 ? (
        <p className="text-xs text-gray-500">Add at least 2 players to create a rule.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <select
              id={selectId1}
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white focus:border-cyan-400/60 focus:outline-none"
            >
              <option value="" className="bg-gray-900">
                Player A
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === player2Id} className="bg-gray-900">
                  {p.name}
                </option>
              ))}
            </select>
            <select
              id={selectId2}
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white focus:border-cyan-400/60 focus:outline-none"
            >
              <option value="" className="bg-gray-900">
                Player B
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === player1Id} className="bg-gray-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('together')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                type === 'together'
                  ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Users2 size={13} />
              Must be together
            </button>
            <button
              type="button"
              onClick={() => setType('apart')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                type === 'apart'
                  ? 'border-orange-400/60 bg-orange-400/10 text-orange-300'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Shuffle size={13} />
              Must be apart
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full rounded-lg bg-violet-500/90 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Rule
          </button>
        </>
      )}

      {rules.length > 0 && (
        <ul className="space-y-1.5 pt-1">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2 text-xs"
            >
              {rule.type === 'together' ? (
                <Users2 size={13} className="shrink-0 text-emerald-400" />
              ) : (
                <Shuffle size={13} className="shrink-0 text-orange-400" />
              )}
              <span className="flex-1 truncate text-gray-200">
                {nameOf(rule.player1Id)} {rule.type === 'together' ? '+ ' : '≠ '}
                {nameOf(rule.player2Id)}
              </span>
              <button
                onClick={() => onDelete(rule.id)}
                className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete rule"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
