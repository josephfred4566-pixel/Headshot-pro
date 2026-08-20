import React from 'react';
import {
  Sparkles,
  Sliders,
  Shirt,
  SunMedium,
  Smile,
  Ratio,
  ArrowRight,
} from 'lucide-react';
import {
  WARDROBE_OPTIONS,
  LIGHTING_OPTIONS,
  EXPRESSION_PRESETS,
} from '../data/wardrobes';
import { WardrobeOption, LightingRig, ExpressionPreset } from '../types';

interface StudioControlsProps {
  selectedWardrobe: WardrobeOption;
  onSelectWardrobe: (w: WardrobeOption) => void;
  selectedLighting: LightingRig;
  onSelectLighting: (l: LightingRig) => void;
  selectedExpression: ExpressionPreset;
  onSelectExpression: (e: ExpressionPreset) => void;
  aspectRatio: '1:1' | '3:4' | '16:9';
  onSelectAspectRatio: (r: '1:1' | '3:4' | '16:9') => void;
  customNotes: string;
  onChangeCustomNotes: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasImage: boolean;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  selectedWardrobe,
  onSelectWardrobe,
  selectedLighting,
  onSelectLighting,
  selectedExpression,
  onSelectExpression,
  aspectRatio,
  onSelectAspectRatio,
  customNotes,
  onChangeCustomNotes,
  onGenerate,
  isGenerating,
  hasImage,
}) => {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl sm:p-6">
      <div className="mb-4">
        <h2 className="font-serif text-lg font-semibold tracking-tight text-stone-100">
          3. Studio Tailoring & Lighting
        </h2>
        <p className="text-xs text-stone-400">
          Customize executive wardrobe, studio softboxes, and facial expression.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Wardrobe selection */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-300">
            <Shirt className="h-3.5 w-3.5 text-amber-400" />
            <span>Wardrobe & Attire</span>
          </label>
          <div className="space-y-1.5">
            {WARDROBE_OPTIONS.map((w) => {
              const isSelected = selectedWardrobe.id === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWardrobe(w)}
                  className={`cursor-pointer rounded-lg border px-3 py-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-stone-950 ring-1 ring-amber-500/40 text-stone-100'
                      : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{w.name}</span>
                    <span className="rounded bg-stone-900 px-1.5 py-0.5 text-[10px] text-stone-500 capitalize">
                      {w.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-500 line-clamp-1">
                    {w.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lighting & Expression & Aspect Ratio */}
        <div className="space-y-4">
          {/* Lighting Rig */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-300">
              <SunMedium className="h-3.5 w-3.5 text-amber-400" />
              <span>Studio Lighting Rig</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {LIGHTING_OPTIONS.map((l) => {
                const isSelected = selectedLighting.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSelectLighting(l)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-stone-950 ring-1 ring-amber-500/40 text-stone-100'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                    }`}
                  >
                    <p className="truncate text-xs font-medium">{l.name}</p>
                    <span className="text-[10px] text-stone-500">{l.colorTemp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expression */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-300">
              <Smile className="h-3.5 w-3.5 text-amber-400" />
              <span>Facial Demeanor & Expression</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EXPRESSION_PRESETS.map((e) => {
                const isSelected = selectedExpression.id === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelectExpression(e)}
                    className={`rounded-lg border p-2 text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-stone-950 ring-1 ring-amber-500/40 text-stone-100'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                    }`}
                  >
                    <p className="text-xs font-medium">{e.name.split(' ')[0]}</p>
                    <span className="text-[10px] text-stone-500 truncate block">
                      {e.name.split(' ').slice(1).join(' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-300">
              <Ratio className="h-3.5 w-3.5 text-amber-400" />
              <span>Framing & Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: '1:1', label: '1:1 Square', use: 'LinkedIn / Avatar' },
                { id: '3:4', label: '3:4 Portrait', use: 'Resume & Print' },
                { id: '16:9', label: '16:9 Wide', use: 'Speaker Banner' },
              ].map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => onSelectAspectRatio(ar.id as any)}
                  className={`rounded-lg border p-2 text-center transition-all ${
                    aspectRatio === ar.id
                      ? 'border-amber-500 bg-stone-950 ring-1 ring-amber-500/40 text-stone-100'
                      : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                  }`}
                >
                  <p className="text-xs font-semibold">{ar.label}</p>
                  <span className="text-[10px] text-stone-500 block">{ar.use}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-300">
              Photographer's Fine-Tuning Notes (Optional)
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => onChangeCustomNotes(e.target.value)}
              placeholder="e.g. subtle smile, keep my silver framed glasses, warm skin tone"
              className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 border-t border-stone-800 pt-4">
        <button
          id="btn-generate-headshot"
          disabled={!hasImage || isGenerating}
          onClick={onGenerate}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40"
        >
          <Sparkles className="h-5 w-5 fill-stone-950" />
          <span>
            {isGenerating ? 'Synthesizing 85mm Headshot...' : 'Generate Professional Headshot'}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {!hasImage && (
          <p className="mt-2 text-center text-xs text-amber-400/80">
            Please upload a casual selfie or choose a test selfie above to generate.
          </p>
        )}
      </div>
    </div>
  );
};
