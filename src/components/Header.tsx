import React from 'react';
import { Images, ShieldCheck } from 'lucide-react';
import { AppLogo } from './AppLogo';

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
          className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-95"
        >
          <AppLogo variant="horizontal" size="md" showSubtitle={true} />
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
