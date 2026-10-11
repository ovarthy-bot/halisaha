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
