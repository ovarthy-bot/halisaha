import { BookmarkCheck, Trash2 } from 'lucide-react'
import type { SavedFormation } from '../types'

interface FavoritesPanelProps {
  favorites: SavedFormation[]
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export function FavoritesPanel({ favorites, onLoad, onDelete }: FavoritesPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gray-900/50 p-4 backdrop-blur-xl">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <BookmarkCheck size={16} className="text-cyan-400" />
        Favori Dizilimler
      </h2>

      {favorites.length === 0 ? (
        <p className="text-xs text-gray-500">Henüz favori dizilim kaydetmediniz.</p>
      ) : (
        <ul className="space-y-1.5">
          {favorites.map((favorite) => (
            <li
              key={favorite.id}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/30 px-2.5 py-2 text-xs"
            >
              <span className="flex-1 truncate text-gray-200">{favorite.name}</span>
              <button
                onClick={() => onLoad(favorite.id)}
                className="shrink-0 rounded-md border border-cyan-400/30 px-2 py-1 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                Yükle
              </button>
              <button
                onClick={() => onDelete(favorite.id)}
                className="shrink-0 rounded-md p-1 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label={`"${favorite.name}" dizilimini sil`}
                title="Favoriyi sil"
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
