import type { Position } from './types'

export const TEAM_SIZE_OPTIONS = [5, 6, 7, 8, 9, 11] as const

export const POSITION_OPTIONS: Position[] = ['gk', 'def', 'mid', 'fwd']

export const POSITION_LABELS: Record<Position, string> = {
  gk: 'Kaleci',
  def: 'Defans',
  mid: 'Orta Saha',
  fwd: 'Forvet',
}

export const POSITION_SHORT_LABELS: Record<Position, string> = {
  gk: 'KL',
  def: 'DF',
  mid: 'OS',
  fwd: 'FV',
}

export const POSITION_COLORS: Record<Position, string> = {
  gk: 'text-amber-400',
  def: 'text-sky-400',
  mid: 'text-violet-400',
  fwd: 'text-rose-400',
}

// <option> text color only reliably follows inline style in most browsers,
// not Tailwind classes, so keep a hex copy alongside POSITION_COLORS.
export const POSITION_HEX: Record<Position, string> = {
  gk: '#fbbf24',
  def: '#38bdf8',
  mid: '#a78bfa',
  fwd: '#fb7185',
}

export const KIT_COLORS = [
  { name: 'Neon Yeşil', value: '#22c55e' },
  { name: 'Camgöbeği', value: '#22d3ee' },
  { name: 'Elektrik Mavisi', value: '#3b82f6' },
  { name: 'Kırmızı', value: '#ef4444' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Mor', value: '#a855f7' },
  { name: 'Pembe', value: '#ec4899' },
  { name: 'Beyaz', value: '#f8fafc' },
]
