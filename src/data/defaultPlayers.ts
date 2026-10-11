import type { Player } from '../types'

const NAMES = [
  'Emin A.',
  'Burak',
  'İlhan',
  'Samet',
  'İsa',
  'Onur',
  'Fatih',
  'Serdar',
  'Emin D.',
  'Davut',
  'Alperen',
  'Ahmet',
  'Apo',
  'Koray',
]

export const defaultPlayers: Player[] = NAMES.map((name, index) => ({
  id: `seed-${index}`,
  name,
  isGoalkeeper: false,
  stats: { attack: 3, defense: 3, playmaking: 3 },
}))
