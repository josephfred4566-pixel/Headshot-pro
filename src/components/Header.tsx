import React from 'react';
import { Camera, Sparkles, Images, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  galleryCount: number;
  onOpenGallery: () => void;
  onNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({ galleryCount, onOpenGallery, onNewSession }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <div 
          onClick={onNewSession}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-md shadow-amber-900/20">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold tracking-tight text-stone-100">
                AI Headshot Photographer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/20">
                <Sparkles className="h-3 w-3" /> Studio 85mm
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Transform casual selfies into executive portraits in seconds
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/80 px-3 py-1.5 text-xs text-stone-400 md:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Identity-Preserving Engine</span>
          </div>

          <button
            id="btn-header-gallery"
            onClick={onOpenGallery}
            className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-stone-200 transition-colors hover:border-stone-700 hover:bg-stone-800"
          >
            <Images className="h-4 w-4 text-amber-400" />
            <span>Studio Gallery</span>
            {galleryCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-stone-950">
                {galleryCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
