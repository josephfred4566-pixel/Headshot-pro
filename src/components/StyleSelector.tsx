import React, { useState } from 'react';
import {
  Briefcase,
  Laptop,
  Sun,
  Building2,
  Camera,
  Coffee,
  Sparkles,
  Check,
} from 'lucide-react';
import { HEADSHOT_STYLES } from '../data/styles';
import { HeadshotStyle, StyleCategory } from '../types';

interface StyleSelectorProps {
  selectedStyle: HeadshotStyle;
  onSelectStyle: (style: HeadshotStyle) => void;
}

const CATEGORIES: { id: StyleCategory; label: string }[] = [
  { id: 'all', label: 'All Styles' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'tech', label: 'Tech & Modern' },
  { id: 'outdoor', label: 'Natural Light' },
  { id: 'executive', label: 'Executive' },
  { id: 'creative', label: 'Creative / Editorial' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onSelectStyle,
}) => {
  const [activeCategory, setActiveCategory] = useState<StyleCategory>('all');

  const filteredStyles =
    activeCategory === 'all'
      ? HEADSHOT_STYLES
      : HEADSHOT_STYLES.filter((s) => s.category === activeCategory);

  const getStyleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="h-4 w-4" />;
      case 'Laptop':
        return <Laptop className="h-4 w-4" />;
      case 'Sun':
        return <Sun className="h-4 w-4" />;
      case 'Building2':
        return <Building2 className="h-4 w-4" />;
      case 'Camera':
        return <Camera className="h-4 w-4" />;
      case 'Coffee':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold tracking-tight text-stone-100">
            2. Choose Headshot Style
          </h2>
          <span className="text-xs text-amber-400 font-medium">
            {filteredStyles.length} Styles Available
          </span>
        </div>
        <p className="text-xs text-stone-400">
          Select the background environment, aesthetic, and photographic mood.
        </p>
      </div>

      {/* Category Pills */}
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'border border-stone-800 bg-stone-950/70 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStyles.map((style) => {
          const isSelected = selectedStyle.id === style.id;
          return (
            <div
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-amber-500 bg-stone-950 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/30'
                  : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-950'
              }`}
            >
              {/* Top ambient color bar */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${style.gradient}`}
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-900 border border-stone-800 text-amber-400'
                    }`}
                  >
                    {getStyleIcon(style.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-100">
                      {style.name}
                    </h3>
                  </div>
                </div>

                {style.badge && (
                  <span className="rounded-full bg-stone-900 border border-stone-800 px-2 py-0.5 text-[10px] font-medium text-stone-300">
                    {style.badge}
                  </span>
                )}
              </div>

              <p className="mt-2.5 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                {style.description}
              </p>

              {/* Backdrop & lighting tags */}
              <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-stone-900">
                <span className="rounded bg-stone-900 px-2 py-0.5 text-[10px] text-stone-400 font-mono">
                  85mm Prime
                </span>
                <span className="rounded bg-stone-900 px-2 py-0.5 text-[10px] text-stone-400 font-mono">
                  Studio Lighting
                </span>
              </div>

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="absolute right-3 bottom-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-stone-950">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
