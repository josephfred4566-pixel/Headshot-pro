import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Trash2,
  Columns,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { HeadshotItem } from '../types';
import { exportAdjustedHeadshot } from '../utils/portraitCanvas';

interface HeadshotGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  items: HeadshotItem[];
  onSelectItem: (item: HeadshotItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const HeadshotGallery: React.FC<HeadshotGalleryProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onToggleFavorite,
}) => {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);

  if (!isOpen) return null;

  const displayItems = filterFavorites ? items.filter((i) => i.isFavorite) : items;

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((x) => x !== id));
    } else {
      if (compareIds.length >= 2) {
        setCompareIds([compareIds[1], id]);
      } else {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  const compareItemA = items.find((i) => i.id === compareIds[0]);
  const compareItemB = items.find((i) => i.id === compareIds[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="font-serif text-lg font-semibold text-stone-100">
                Session Headshot Gallery ({items.length})
              </h2>
              <p className="text-xs text-stone-400">
                Compare multiple variations to select your primary profile photo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filterFavorites
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${filterFavorites ? 'fill-amber-400' : ''}`} />
              <span>Favorites Only</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2-Up Comparison Panel if 2 items selected */}
        {compareIds.length === 2 && compareItemA && compareItemB && (
          <div className="border-b border-stone-800 bg-stone-950/80 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Columns className="h-4 w-4" /> 2-Up Side-by-Side Comparison
              </span>
              <button
                onClick={() => setCompareIds([])}
                className="text-[11px] text-stone-400 hover:text-stone-200"
              >
                Clear Comparison
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-amber-500/50 bg-stone-900">
                <img
                  src={compareItemA.headshotUrl}
                  alt={compareItemA.styleName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-stone-950/80 px-2 py-1 text-[11px] font-medium text-stone-200 backdrop-blur-sm">
                  {compareItemA.styleName}
                </div>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-xl border border-amber-500/50 bg-stone-900">
                <img
                  src={compareItemB.headshotUrl}
                  alt={compareItemB.styleName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-stone-950/80 px-2 py-1 text-[11px] font-medium text-stone-200 backdrop-blur-sm">
                  {compareItemB.styleName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
              <Layers className="mb-3 h-10 w-10 text-stone-700" />
              <p className="text-sm font-medium">No headshots in this view.</p>
              <p className="mt-1 text-xs">
                Generate your first professional headshot to see it stored here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {displayItems.map((item) => {
                const isComparing = compareIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`group relative overflow-hidden rounded-xl border transition-all ${
                      isComparing
                        ? 'border-amber-500 ring-2 ring-amber-500/40 bg-stone-950 shadow-lg'
                        : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="relative aspect-square w-full cursor-pointer overflow-hidden bg-stone-900"
                    >
                      <img
                        src={item.headshotUrl}
                        alt={item.styleName}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-stone-950/70 p-1.5 text-stone-300 backdrop-blur-sm transition-colors hover:text-amber-400"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            item.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>

                      {/* Grade badge */}
                      {item.critique?.score && (
                        <div className="absolute top-2 left-2 rounded-md bg-stone-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
                          {item.critique.score}/100
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="truncate text-xs font-semibold text-stone-200">
                        {item.styleName}
                      </p>
                      <p className="truncate text-[10px] text-stone-500">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Actions */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-stone-900 pt-2 text-xs">
                        <button
                          onClick={() => toggleCompare(item.id)}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                            isComparing
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {isComparing ? 'Comparing' : 'Compare'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            title="Download Master PNG"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const exportUrl = await exportAdjustedHeadshot(
                                item.headshotUrl,
                                item.adjustments,
                                'image/png',
                                2048
                              );
                              const link = document.createElement('a');
                              link.download = `headshot-${item.styleId}-${Date.now()}.png`;
                              link.href = exportUrl;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="rounded p-1 text-stone-400 hover:bg-stone-850 hover:text-amber-400 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="rounded p-1 text-stone-500 hover:bg-stone-850 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
