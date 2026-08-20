import React, { useState, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  RotateCcw,
  Star,
  Eye,
  Layers,
  Award,
  CircleDot,
  ChevronDown,
  FileImage,
  Printer,
  ShieldCheck,
  Wand2,
  Flame,
  Snowflake,
  Sun,
  Contrast,
  Zap,
  Crop,
  Share2,
  FileText,
  Smartphone,
  Globe,
  Aperture,
  Focus,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Crosshair,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { HeadshotItem, ImageAdjustments, CropSettings, CropAspectRatio } from '../types';
import { exportAdjustedHeadshot, exportPlatformHeadshot } from '../utils/portraitCanvas';
import { QUICK_EDIT_FILTERS, QuickEditFilter } from '../data/filters';
import { PLATFORM_EXPORT_PRESETS, PlatformExportPreset } from '../data/platformPresets';
import { ShareModal, SocialPlatform } from './ShareModal';

export function getApertureInfo(blurPercent: number = 0): {
  fStop: string;
  label: string;
  depthDescription: string;
} {
  if (!blurPercent || blurPercent <= 0) {
    return {
      fStop: 'f/16',
      label: 'Deep Focus',
      depthDescription: 'Full depth-of-field, sharp studio backdrop',
    };
  }
  if (blurPercent <= 20) {
    return {
      fStop: 'f/8.0',
      label: 'Studio Standard',
      depthDescription: 'Subtle natural separation from background',
    };
  }
  if (blurPercent <= 40) {
    return {
      fStop: 'f/4.0',
      label: 'Environmental Blur',
      depthDescription: 'Soft atmospheric blur isolating the subject',
    };
  }
  if (blurPercent <= 65) {
    return {
      fStop: 'f/2.8',
      label: '85mm Portrait Prime',
      depthDescription: 'Classic optical separation & creamy studio bokeh',
    };
  }
  if (blurPercent <= 85) {
    return {
      fStop: 'f/1.8',
      label: 'Fast Prime Lens',
      depthDescription: 'Prominent background melt & cinematic bokeh',
    };
  }
  return {
    fStop: 'f/1.2',
    label: 'Ultra-Wide Aperture',
    depthDescription: 'Ultra-shallow depth of field & dreamy dissolve',
  };
}


interface HeadshotViewerProps {
  item: HeadshotItem;
  onUpdateAdjustments: (adj: ImageAdjustments) => void;
  onToggleFavorite: (id: string) => void;
  onGenerateAnother: () => void;
}

export const HeadshotViewer: React.FC<HeadshotViewerProps> = ({
  item,
  onUpdateAdjustments,
  onToggleFavorite,
  onGenerateAnother,
}) => {
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'crop' | 'avatar'>('slider');
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png-master' | 'jpeg-linkedin' | 'png-print'>('png-master');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePlatformOverride, setSharePlatformOverride] = useState<SocialPlatform | undefined>(undefined);
  const [activePlatformMockup, setActivePlatformMockup] = useState<'linkedin' | 'twitter' | 'instagram' | 'instagram-portrait' | 'resume'>('linkedin');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'adjustments' | 'platforms' | 'critique'>('adjustments');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingCrop = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0, startOffX: 0, startOffY: 0 });

  const currentCrop: CropSettings = item.adjustments.crop || {
    aspectRatio: 'original',
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
  };

  const isCropped =
    currentCrop.aspectRatio !== 'original' ||
    (currentCrop.zoom && currentCrop.zoom > 1.01) ||
    currentCrop.offsetX !== 0 ||
    currentCrop.offsetY !== 0;

  const handleUpdateCrop = (updated: Partial<CropSettings>) => {
    onUpdateAdjustments({
      ...item.adjustments,
      crop: {
        ...currentCrop,
        ...updated,
      },
    });
  };

  const resetCrop = () => {
    onUpdateAdjustments({
      ...item.adjustments,
      crop: {
        aspectRatio: 'original',
        zoom: 1.0,
        offsetX: 0,
        offsetY: 0,
      },
    });
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    isDraggingCrop.current = true;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      startOffX: currentCrop.offsetX || 0,
      startOffY: currentCrop.offsetY || 0,
    };
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const sensitivity = 0.25;
    const newOffX = Math.max(-50, Math.min(50, dragStartPos.current.startOffX - dx * sensitivity));
    const newOffY = Math.max(-50, Math.min(50, dragStartPos.current.startOffY - dy * sensitivity));
    handleUpdateCrop({ offsetX: Math.round(newOffX), offsetY: Math.round(newOffY) });
  };

  const handleCropMouseUp = () => {
    isDraggingCrop.current = false;
  };

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handlePlatformExport = async (preset: PlatformExportPreset) => {
    setIsDownloading(true);
    setShowPlatformMenu(false);
    setShowDownloadMenu(false);
    try {
      const exportUrl = await exportPlatformHeadshot(
        item.headshotUrl,
        item.adjustments,
        preset.targetWidth,
        preset.targetHeight,
        preset.format
      );

      const ext = preset.format === 'jpeg' ? 'jpg' : 'png';
      const filename = `headshot-${preset.platform}-${preset.targetWidth}x${preset.targetHeight}-${Date.now()}.${ext}`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = exportUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccessMessage(
        `Exported for ${preset.name} (${preset.targetWidth} × ${preset.targetHeight} px)`
      );
      setTimeout(() => {
        setDownloadSuccessMessage(null);
      }, 4500);
    } catch (err) {
      console.error('Platform export failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = async (

    format: 'png-master' | 'jpeg-linkedin' | 'png-print' = downloadFormat
  ) => {
    setIsDownloading(true);
    setShowDownloadMenu(false);
    try {
      let mimeType: 'image/png' | 'image/jpeg' = 'image/png';
      let targetDim: number | undefined = undefined;
      let fileExt = 'png';
      let label = 'Ultra-HD Master PNG';

      if (format === 'png-master') {
        mimeType = 'image/png';
        targetDim = 2048;
        fileExt = 'png';
        label = 'Ultra-HD Master PNG (2048px)';
      } else if (format === 'jpeg-linkedin') {
        mimeType = 'image/jpeg';
        targetDim = 1080;
        fileExt = 'jpg';
        label = 'LinkedIn Square JPG (1080px)';
      } else if (format === 'png-print') {
        mimeType = 'image/png';
        targetDim = 3000;
        fileExt = 'png';
        label = 'Print-Ready Master (3000px)';
      }

      const exportUrl = await exportAdjustedHeadshot(
        item.headshotUrl,
        item.adjustments,
        mimeType,
        targetDim
      );

      const link = document.createElement('a');
      const filename = `headshot-${item.styleId}-${Date.now()}.${fileExt}`;
      link.download = filename;
      link.href = exportUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccessMessage(`Saved: ${filename} (${label})`);
      setTimeout(() => {
        setDownloadSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const exportUrl = await exportAdjustedHeadshot(
        item.headshotUrl,
        item.adjustments,
        'image/png',
        1200
      );
      const res = await fetch(exportUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const resetAdjustments = () => {
    onUpdateAdjustments({
      exposure: 0,
      contrast: 0,
      warmth: 0,
      vignette: 0,
      sharpness: 0,
      backgroundBlur: 0,
      skinEnhance: false,
      crop: {
        aspectRatio: 'original',
        zoom: 1.0,
        offsetX: 0,
        offsetY: 0,
      },
      isBlackAndWhite: false,
    });
  };

  const isFilterActive = (filter: QuickEditFilter) => {
    const adj = item.adjustments;
    const fAdj = filter.adjustments;
    return (
      adj.exposure === fAdj.exposure &&
      adj.contrast === fAdj.contrast &&
      adj.warmth === fAdj.warmth &&
      adj.vignette === fAdj.vignette &&
      (adj.backgroundBlur || 0) === (fAdj.backgroundBlur || 0) &&
      (adj.skinEnhance || false) === (fAdj.skinEnhance || false) &&
      adj.isBlackAndWhite === fAdj.isBlackAndWhite
    );
  };

  const handleApplyFilter = (filter: QuickEditFilter) => {
    onUpdateAdjustments({
      ...filter.adjustments,
      sharpness: item.adjustments.sharpness,
      crop: item.adjustments.crop,
    });
  };

  // Compute CSS filter, aperture blur, and crop transform for live preview
  const brightness = 100 + item.adjustments.exposure;
  const contrastVal = 100 + item.adjustments.contrast;
  const grayVal = item.adjustments.isBlackAndWhite ? 100 : 0;
  const sepiaVal = item.adjustments.warmth > 0 ? item.adjustments.warmth * 0.4 : 0;
  const imageFilterStyle = `brightness(${brightness}%) contrast(${contrastVal}%) grayscale(${grayVal}%) sepia(${sepiaVal}%)`;
  const bgBlur = item.adjustments.backgroundBlur || 0;
  const bgBlurPx = (bgBlur / 100) * 14;
  const apertureInfo = getApertureInfo(bgBlur);
  const isSkinEnhanced = !!item.adjustments.skinEnhance;

  const cropZoom = currentCrop.zoom || 1.0;
  const cropTranslateX = -((currentCrop.offsetX || 0) / 50) * (((cropZoom - 1) / cropZoom) * 45);
  const cropTranslateY = -((currentCrop.offsetY || 0) / 50) * (((cropZoom - 1) / cropZoom) * 45);
  const cropTransformStyle =
    cropZoom > 1.001 || cropTranslateX !== 0 || cropTranslateY !== 0
      ? `scale(${cropZoom}) translate(${cropTranslateX}%, ${cropTranslateY}%)`
      : undefined;

  const getCropContainerAspectClass = (ar: string) => {
    switch (ar) {
      case '1:1':
        return 'aspect-square max-w-[500px]';
      case '3:4':
        return 'aspect-[3/4] max-w-[430px]';
      case '4:5':
        return 'aspect-[4/5] max-w-[450px]';
      case '16:9':
        return 'aspect-[16/9] max-w-[640px]';
      case '3:2':
        return 'aspect-[3/2] max-w-[600px]';
      case 'original':
      default:
        return 'aspect-square max-w-[500px]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Style & Controls */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold text-stone-100">
                {item.styleName} Headshot
              </h2>
              {item.critique?.score && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  {item.critique.grade} Score: {item.critique.score}/100
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              Wardrobe: {item.wardrobe} • Lighting: {item.lighting}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Direct Header Download & Platform Export */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 rounded-xl bg-stone-950 p-1 border border-stone-800">
            <button
              id="view-mode-slider"
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'slider'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Slider</span>
            </button>

            <button
              id="view-mode-sidebyside"
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>

            <button
              id="view-mode-crop"
              onClick={() => setViewMode('crop')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'crop'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Crop className="h-3.5 w-3.5" />
              <span>Crop & Framing</span>
              {isCropped && (
                <span className="rounded bg-stone-950/20 px-1 py-0.2 text-[9px] font-bold font-mono">
                  {currentCrop.aspectRatio === 'original' ? `${currentCrop.zoom}x` : currentCrop.aspectRatio}
                </span>
              )}
            </button>

            <button
              id="view-mode-avatar"
              onClick={() => setViewMode('avatar')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === 'avatar'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CircleDot className="h-3.5 w-3.5" />
              <span>Platform Previews</span>
            </button>
          </div>

          {/* Platform Export Preset Dropdown */}
          <div className="relative">
            <button
              id="btn-platform-export-dropdown"
              onClick={() => {
                setShowPlatformMenu(!showPlatformMenu);
                setShowDownloadMenu(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-stone-200 shadow-sm transition-all hover:border-amber-500 hover:bg-stone-850 hover:text-white"
            >
              <Crop className="h-3.5 w-3.5 text-amber-400" />
              <span>Platform Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
            </button>

            {/* Platform Presets Dropdown Menu */}
            {showPlatformMenu && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-stone-700 bg-stone-900/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="mb-1.5 flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Platform Auto-Crop & Resize
                  </span>
                  <span className="text-[9px] text-stone-500 font-mono">1-Click Export</span>
                </div>

                <div className="space-y-1">
                  {PLATFORM_EXPORT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      id={`preset-export-${preset.id}`}
                      disabled={isDownloading}
                      onClick={() => handlePlatformExport(preset)}
                      className="group flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-all hover:bg-stone-800"
                    >
                      <div
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: preset.brandColor }}
                      >
                        {preset.platform === 'linkedin' ? 'in' :
                         preset.platform === 'twitter' ? '𝕏' :
                         preset.platform === 'instagram' ? 'IG' :
                         preset.platform === 'resume' ? 'CV' : 'GH'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-stone-100 group-hover:text-amber-300 truncate">
                            {preset.name}
                          </span>
                          <span className="rounded bg-stone-800 px-1 py-0.5 text-[9px] font-bold text-stone-400 shrink-0">
                            {preset.format.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">{preset.subLabel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Share to Socials Button in Header */}
          <button
            id="btn-header-share"
            onClick={() => {
              setSharePlatformOverride(undefined);
              setIsShareModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:border-amber-400 hover:bg-stone-850 hover:text-amber-200 active:scale-95"
            title="Share with pre-formatted posts on LinkedIn, X, Facebook, Threads, Instagram"
          >
            <Share2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Share</span>
            <span className="hidden xl:inline-block rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
              Social Hub
            </span>
          </button>

          {/* Facebook Share Button in Header */}
          <button
            id="btn-header-facebook-share"
            onClick={() => {
              setSharePlatformOverride('facebook');
              setIsShareModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#1877f2]/50 bg-[#1877f2]/15 px-3 py-1.5 text-xs font-semibold text-sky-200 shadow-sm transition-all hover:border-[#1877f2] hover:bg-[#1877f2]/30 hover:text-white active:scale-95"
            title="Share on Facebook with pre-formatted announcement and image preview link"
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1877f2] text-white font-bold text-[9px] leading-none">
              f
            </span>
            <span>Facebook</span>
          </button>

          {/* Quick Header Download Action */}
          <div className="relative">
            <div className="flex items-center">
              <button
                id="btn-header-download"
                disabled={isDownloading}
                onClick={() => handleDownload('png-master')}
                className="flex items-center gap-1.5 rounded-l-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-stone-950 shadow-md shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isDownloading ? 'Exporting...' : 'Download'}</span>
              </button>
              <button
                id="btn-header-download-menu"
                onClick={() => {
                  setShowDownloadMenu(!showDownloadMenu);
                  setShowPlatformMenu(false);
                }}
                className="rounded-r-xl border-l border-amber-600 bg-amber-500 px-1.5 py-1.5 text-stone-950 transition-colors hover:bg-amber-400"
                title="Choose download format and resolution"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Dropdown Options */}
            {showDownloadMenu && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-stone-700 bg-stone-900 p-1.5 shadow-2xl backdrop-blur-xl">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Select Export Resolution
                </div>
                <button
                  onClick={() => handleDownload('png-master')}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-stone-200 transition-colors hover:bg-stone-800"
                >
                  <FileImage className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-100">Ultra-HD Master PNG</div>
                    <div className="text-[10px] text-stone-400">2048 × 2048 px · Lossless Studio Master</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDownload('jpeg-linkedin')}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-stone-200 transition-colors hover:bg-stone-800"
                >
                  <CircleDot className="mt-0.5 h-4 w-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-100">LinkedIn Square JPEG</div>
                    <div className="text-[10px] text-stone-400">1080 × 1080 px · Web & Social Profile</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDownload('png-print')}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-stone-200 transition-colors hover:bg-stone-800"
                >
                  <Printer className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-100">Print High-Res Master</div>
                    <div className="text-[10px] text-stone-400">3000 × 3000 px · 300 DPI Press & Print</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Success Notification Banner */}
      {downloadSuccessMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Main Studio Showcase Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Center Display */}
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 p-3 shadow-2xl">
            {viewMode === 'slider' && (
              /* Interactive Split Slider */
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onClick={(e) => handleSliderMove(e.clientX)}
                className={`relative ${getCropContainerAspectClass(currentCrop.aspectRatio)} max-h-[580px] w-full mx-auto cursor-ew-resize select-none overflow-hidden rounded-xl bg-stone-900`}
              >
                {/* Background Image: Original Casual Selfie */}
                <img
                  src={item.originalImage}
                  alt="Original Casual Selfie"
                  referrerPolicy="no-referrer"
                  style={{
                    transform: cropTransformStyle,
                    transformOrigin: 'center center',
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 z-10 rounded-full bg-stone-950/80 px-3 py-1 text-xs font-semibold text-stone-300 backdrop-blur-md">
                  Original Casual Selfie
                </div>

                {/* Foreground Image: Professional Generated Headshot (Clipped by slider percentage) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  {/* Aperture Bokeh Background Blur Layer */}
                  {bgBlurPx > 0 && (
                    <img
                      src={item.headshotUrl}
                      alt="Blurred Bokeh Background"
                      referrerPolicy="no-referrer"
                      style={{
                        filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                        transform: cropTransformStyle ? `${cropTransformStyle} scale(1.06)` : 'scale(1.06)',
                        transformOrigin: 'center center',
                        width: containerRef.current?.clientWidth || '100%',
                        height: containerRef.current?.clientHeight || '100%',
                      }}
                      className="absolute top-0 left-0 max-w-none h-full w-full object-cover"
                    />
                  )}

                  <img
                    src={item.headshotUrl}
                    alt="AI Studio Professional Headshot"
                    referrerPolicy="no-referrer"
                    style={{
                      filter: imageFilterStyle,
                      transform: cropTransformStyle,
                      transformOrigin: 'center center',
                      width: containerRef.current?.clientWidth || '100%',
                      height: containerRef.current?.clientHeight || '100%',
                      ...(bgBlurPx > 0
                        ? {
                            WebkitMaskImage:
                              'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                            maskImage:
                              'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                          }
                        : {}),
                    }}
                    className="absolute top-0 left-0 max-w-none h-full w-full object-cover"
                  />

                  {/* AI Enhance Skin Smoothing Mask Layer */}
                  {isSkinEnhanced && (
                    <img
                      src={item.headshotUrl}
                      alt="AI Skin Smoothing Layer"
                      referrerPolicy="no-referrer"
                      style={{
                        filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                        transform: cropTransformStyle,
                        transformOrigin: 'center center',
                        width: containerRef.current?.clientWidth || '100%',
                        height: containerRef.current?.clientHeight || '100%',
                        WebkitMaskImage:
                          'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                        maskImage:
                          'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                        opacity: 0.85,
                        pointerEvents: 'none',
                      }}
                      className="absolute top-0 left-0 max-w-none h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute top-4 left-4 z-10 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-stone-950 shadow-md flex items-center gap-1.5">
                    <span>AI Studio 85mm</span>
                    {bgBlurPx > 0 && (
                      <span className="rounded bg-stone-950/20 px-1 py-0.2 text-[10px] font-mono font-bold">
                        {apertureInfo.fStop}
                      </span>
                    )}
                    {isSkinEnhanced && (
                      <span className="flex items-center gap-0.5 rounded bg-stone-950/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-stone-950">
                        <Sparkles className="h-2.5 w-2.5 inline" />
                        <span>Skin</span>
                      </span>
                    )}
                    {isCropped && (
                      <span className="rounded bg-stone-950/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-stone-950">
                        {currentCrop.aspectRatio === 'original' ? `${currentCrop.zoom}x` : currentCrop.aspectRatio}
                      </span>
                    )}
                  </div>
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 z-20 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-950 bg-amber-400 text-stone-950 shadow-xl">
                    <span className="text-[10px] font-bold">‹ ›</span>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-4 inset-x-0 flex justify-center">
                  <span className="rounded-full bg-stone-950/80 px-3 py-1 text-[11px] font-medium text-stone-400 backdrop-blur-md">
                    Drag slider or click anywhere to compare
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'side-by-side' && (
              /* Side by Side Mode */
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-400 block text-center">
                    Original Casual Selfie
                  </span>
                  <div className={`relative ${getCropContainerAspectClass(currentCrop.aspectRatio)} overflow-hidden rounded-xl border border-stone-800 bg-stone-900 mx-auto`}>
                    <img
                      src={item.originalImage}
                      alt="Original Casual"
                      referrerPolicy="no-referrer"
                      style={{
                        transform: cropTransformStyle,
                        transformOrigin: 'center center',
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-amber-400 block text-center">
                    AI Studio Headshot
                  </span>
                  <div className={`relative ${getCropContainerAspectClass(currentCrop.aspectRatio)} overflow-hidden rounded-xl border border-amber-500/40 bg-stone-900 mx-auto`}>
                    {bgBlurPx > 0 && (
                      <img
                        src={item.headshotUrl}
                        alt="Blurred Bokeh Background"
                        referrerPolicy="no-referrer"
                        style={{
                          filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                          transform: cropTransformStyle ? `${cropTransformStyle} scale(1.06)` : 'scale(1.06)',
                          transformOrigin: 'center center',
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <img
                      src={item.headshotUrl}
                      alt="Generated Headshot"
                      referrerPolicy="no-referrer"
                      style={{
                        filter: imageFilterStyle,
                        transform: cropTransformStyle,
                        transformOrigin: 'center center',
                        ...(bgBlurPx > 0
                          ? {
                              WebkitMaskImage:
                                'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                              maskImage:
                                'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                            }
                          : {}),
                      }}
                      className="relative h-full w-full object-cover"
                    />
                    {isSkinEnhanced && (
                      <img
                        src={item.headshotUrl}
                        alt="AI Skin Smoothing Layer"
                        referrerPolicy="no-referrer"
                        style={{
                          filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                          transform: cropTransformStyle,
                          transformOrigin: 'center center',
                          WebkitMaskImage:
                            'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                          maskImage:
                            'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                          opacity: 0.85,
                          pointerEvents: 'none',
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'crop' && (
              /* Dedicated Interactive Studio Cropping & Framing Utility */
              <div className="space-y-6">
                {/* Crop Aspect Ratio Selector & Viewfinder Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-stone-800 bg-stone-900/90 p-2.5 sm:px-4">
                  {/* Aspect Ratio Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-stone-400 mr-1 flex items-center gap-1">
                      <Crop className="h-3 w-3 text-amber-400" />
                      <span>Aspect:</span>
                    </span>

                    {[
                      { id: 'original', label: 'Original', sub: 'Full' },
                      { id: '1:1', label: '1:1 Square', sub: 'Avatar' },
                      { id: '4:5', label: '4:5 Portrait', sub: 'Editorial' },
                      { id: '3:4', label: '3:4 Portrait', sub: 'Resume' },
                      { id: '16:9', label: '16:9 Landscape', sub: 'Banner' },
                      { id: '3:2', label: '3:2 Landscape', sub: 'Classic' },
                    ].map((aspect) => {
                      const isSelected = currentCrop.aspectRatio === aspect.id;
                      return (
                        <button
                          key={aspect.id}
                          id={`crop-aspect-${aspect.id.replace(':', '-')}`}
                          type="button"
                          onClick={() =>
                            handleUpdateCrop({
                              aspectRatio: aspect.id as CropAspectRatio,
                            })
                          }
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-stone-950 shadow-sm ring-1 ring-amber-400'
                              : 'bg-stone-950/70 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                          }`}
                        >
                          <span>{aspect.label}</span>
                          <span
                            className={`rounded px-1 text-[9px] font-bold ${
                              isSelected ? 'bg-stone-950/20 text-stone-900' : 'text-stone-400'
                            }`}
                          >
                            {aspect.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Grid Overlay Toggle & Reset Action */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowGridOverlay(!showGridOverlay)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        showGridOverlay
                          ? 'bg-stone-800 text-amber-400 border border-amber-500/30'
                          : 'bg-stone-950/70 text-stone-400 border border-stone-800 hover:text-stone-200'
                      }`}
                      title="Toggle Rule-of-Thirds Composition Grid"
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                      <span>Grid 3×3</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetCrop}
                      className="flex items-center gap-1 rounded-lg bg-stone-950/70 px-2.5 py-1.5 text-xs font-medium text-stone-400 border border-stone-800 hover:text-amber-400 transition-all"
                      title="Reset Framing & Zoom to Default"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Viewfinder Canvas Stage */}
                <div className="relative flex flex-col items-center justify-center rounded-xl bg-stone-900/60 p-4 sm:p-6 border border-stone-800/80">
                  {/* Aspect-Ratio Framing Box with Interactive Drag-to-Pan */}
                  <div
                    className={`relative ${getCropContainerAspectClass(
                      currentCrop.aspectRatio
                    )} w-full max-h-[520px] overflow-hidden rounded-xl border-2 border-amber-500/60 shadow-2xl bg-stone-950 cursor-grab active:cursor-grabbing select-none group`}
                    onMouseDown={handleCropMouseDown}
                    onMouseMove={handleCropMouseMove}
                    onMouseUp={handleCropMouseUp}
                    onMouseLeave={handleCropMouseUp}
                    title="Click and drag to pan composition framing"
                  >
                    {/* Bokeh Background Blur Layer */}
                    {bgBlurPx > 0 && (
                      <img
                        src={item.headshotUrl}
                        alt="Background Bokeh"
                        referrerPolicy="no-referrer"
                        style={{
                          filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                          transform: cropTransformStyle ? `${cropTransformStyle} scale(1.06)` : 'scale(1.06)',
                          transformOrigin: 'center center',
                        }}
                        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                      />
                    )}

                    {/* Main Headshot Layer */}
                    <img
                      src={item.headshotUrl}
                      alt="Headshot"
                      referrerPolicy="no-referrer"
                      style={{
                        filter: imageFilterStyle,
                        transform: cropTransformStyle || 'none',
                        transformOrigin: 'center center',
                        ...(bgBlurPx > 0
                          ? {
                              WebkitMaskImage:
                                'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                              maskImage:
                                'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                            }
                          : {}),
                      }}
                      className="h-full w-full object-cover pointer-events-none transition-transform duration-75"
                    />

                    {/* AI Enhance Skin Smoothing Mask Layer */}
                    {isSkinEnhanced && (
                      <img
                        src={item.headshotUrl}
                        alt="AI Skin Smoothing Layer"
                        referrerPolicy="no-referrer"
                        style={{
                          filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                          transform: cropTransformStyle || 'none',
                          transformOrigin: 'center center',
                          WebkitMaskImage:
                            'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                          maskImage:
                            'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                          opacity: 0.85,
                          pointerEvents: 'none',
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}

                    {/* Camera Viewfinder Corner Markers */}
                    <div className="pointer-events-none absolute inset-2.5 z-20">
                      {/* Top-Left Corner Bracket */}
                      <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-amber-400" />
                      {/* Top-Right Corner Bracket */}
                      <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-amber-400" />
                      {/* Bottom-Left Corner Bracket */}
                      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-amber-400" />
                      {/* Bottom-Right Corner Bracket */}
                      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-amber-400" />
                    </div>

                    {/* Rule-of-Thirds Composition Grid Overlay */}
                    {showGridOverlay && (
                      <div className="pointer-events-none absolute inset-0 z-20">
                        {/* Horizontal Grid Lines */}
                        <div className="absolute top-[33.333%] inset-x-0 border-b border-amber-400/30 border-dashed" />
                        <div className="absolute top-[66.666%] inset-x-0 border-b border-amber-400/30 border-dashed" />

                        {/* Eye-Level Guide Badge */}
                        <div className="absolute top-[33.333%] right-2 -translate-y-1/2 rounded bg-amber-500/80 px-1.5 py-0.2 text-[8px] font-bold text-stone-950 uppercase tracking-wider backdrop-blur-sm">
                          Eye Level Guide
                        </div>

                        {/* Vertical Grid Lines */}
                        <div className="absolute left-[33.333%] inset-y-0 border-r border-amber-400/30 border-dashed" />
                        <div className="absolute left-[66.666%] inset-y-0 border-r border-amber-400/30 border-dashed" />

                        {/* Center Crosshair Target */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                          <Crosshair className="h-5 w-5 text-amber-400/40" />
                        </div>
                      </div>
                    )}

                    {/* Live Aspect Ratio Badge */}
                    <div className="pointer-events-none absolute top-3 left-3 z-30 rounded-full bg-stone-950/85 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                      <Square className="h-3 w-3" />
                      <span>
                        {currentCrop.aspectRatio === 'original'
                          ? 'Original Framing'
                          : `${currentCrop.aspectRatio} ${
                              currentCrop.aspectRatio === '1:1'
                                ? 'Square'
                                : currentCrop.aspectRatio === '4:5' || currentCrop.aspectRatio === '3:4'
                                ? 'Portrait'
                                : 'Landscape'
                            }`}
                      </span>
                      <span className="rounded bg-amber-500/20 px-1 text-[9px] font-mono text-amber-300">
                        {currentCrop.zoom.toFixed(2)}x
                      </span>
                    </div>

                    {/* Pan Hint Overlay */}
                    <div className="pointer-events-none absolute bottom-3 inset-x-0 z-30 flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="rounded-full bg-stone-950/85 px-3 py-1 text-[10px] font-medium text-stone-300 backdrop-blur-md border border-stone-800 flex items-center gap-1 shadow-md">
                        <Move className="h-3 w-3 text-amber-400" />
                        <span>Drag to reposition headshot inside frame</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Studio Framing Controls Deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-stone-800 bg-stone-900/90 p-4">
                  {/* Left Column: Zoom / Tightness Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
                        <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                        <span>Tightness / Zoom Control</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {Math.round(currentCrop.zoom * 100)}% ({currentCrop.zoom.toFixed(2)}x)
                      </span>
                    </div>

                    {/* Zoom Slider */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCrop({
                            zoom: Math.max(1.0, Number((currentCrop.zoom - 0.1).toFixed(2))),
                          })
                        }
                        disabled={currentCrop.zoom <= 1.0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white disabled:opacity-40 transition-colors"
                        title="Zoom out"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </button>

                      <input
                        id="crop-zoom-slider"
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.05"
                        value={currentCrop.zoom}
                        onChange={(e) =>
                          handleUpdateCrop({
                            zoom: parseFloat(e.target.value),
                          })
                        }
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-stone-800 accent-amber-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCrop({
                            zoom: Math.min(2.5, Number((currentCrop.zoom + 0.1).toFixed(2))),
                          })
                        }
                        disabled={currentCrop.zoom >= 2.5}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white disabled:opacity-40 transition-colors"
                        title="Zoom in"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Quick Zoom Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400">Presets:</span>
                      {[
                        { label: '1.0x (Fit)', value: 1.0 },
                        { label: '1.25x (Medium)', value: 1.25 },
                        { label: '1.5x (Tight)', value: 1.5 },
                        { label: '2.0x (Close-up)', value: 2.0 },
                      ].map((preset) => {
                        const active = Math.abs(currentCrop.zoom - preset.value) < 0.05;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleUpdateCrop({ zoom: preset.value })}
                            className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-all ${
                              active
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                                : 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Directional Nudge & Quick Composition Alignment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
                        <Move className="h-3.5 w-3.5 text-amber-400" />
                        <span>Composition & Framing Alignment</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        X: {currentCrop.offsetX > 0 ? `+${currentCrop.offsetX}` : currentCrop.offsetX}% · Y: {currentCrop.offsetY > 0 ? `+${currentCrop.offsetY}` : currentCrop.offsetY}%
                      </span>
                    </div>

                    {/* Quick Focus Targets */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateCrop({ offsetY: -25, zoom: Math.max(1.25, currentCrop.zoom) })}
                        className={`rounded-lg py-1.5 px-2 text-[10px] font-semibold text-center transition-all ${
                          currentCrop.offsetY <= -15
                            ? 'bg-amber-500 text-stone-950 ring-1 ring-amber-400 font-bold'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        👤 Face / Eyes Focus
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateCrop({ offsetX: 0, offsetY: 0 })}
                        className={`rounded-lg py-1.5 px-2 text-[10px] font-semibold text-center transition-all ${
                          currentCrop.offsetX === 0 && currentCrop.offsetY === 0
                            ? 'bg-amber-500 text-stone-950 ring-1 ring-amber-400 font-bold'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        ⚖️ Center Balanced
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateCrop({ offsetY: 25, zoom: Math.max(1.2, currentCrop.zoom) })}
                        className={`rounded-lg py-1.5 px-2 text-[10px] font-semibold text-center transition-all ${
                          currentCrop.offsetY >= 15
                            ? 'bg-amber-500 text-stone-950 ring-1 ring-amber-400 font-bold'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        👔 Upper Torso Focus
                      </button>
                    </div>

                    {/* Directional Nudge Pad */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCrop({ offsetX: Math.max(-50, currentCrop.offsetX - 10) })}
                          className="h-7 w-7 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center justify-center transition-colors"
                          title="Nudge Left"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCrop({ offsetY: Math.max(-50, currentCrop.offsetY - 10) })}
                          className="h-7 w-7 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center justify-center transition-colors"
                          title="Nudge Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCrop({ offsetY: Math.min(50, currentCrop.offsetY + 10) })}
                          className="h-7 w-7 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center justify-center transition-colors"
                          title="Nudge Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCrop({ offsetX: Math.min(50, currentCrop.offsetX + 10) })}
                          className="h-7 w-7 rounded bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center justify-center transition-colors"
                          title="Nudge Right"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-[10px] text-stone-400">
                        Use nudge arrows or drag image directly
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Smart Framing Presets */}
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3.5">
                  <div className="text-[11px] font-bold text-stone-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>1-Click Smart Framing Presets</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      {
                        title: 'Tight Avatar (1:1)',
                        aspect: '1:1',
                        zoom: 1.35,
                        offY: -15,
                        desc: 'Executive Head & Eyes',
                      },
                      {
                        title: 'Resume Bio (3:4)',
                        aspect: '3:4',
                        zoom: 1.15,
                        offY: -10,
                        desc: 'Standard CV & Speaker',
                      },
                      {
                        title: 'Editorial (4:5)',
                        aspect: '4:5',
                        zoom: 1.25,
                        offY: -10,
                        desc: 'Magazine & Instagram',
                      },
                      {
                        title: 'Keynote (16:9)',
                        aspect: '16:9',
                        zoom: 1.45,
                        offY: -20,
                        desc: 'Stage Banner & Slide',
                      },
                      {
                        title: 'Classic (3:2)',
                        aspect: '3:2',
                        zoom: 1.3,
                        offY: -15,
                        desc: '35mm Film Editorial',
                      },
                    ].map((preset) => {
                      const active =
                        currentCrop.aspectRatio === preset.aspect &&
                        Math.abs(currentCrop.zoom - preset.zoom) < 0.1;
                      return (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() =>
                            handleUpdateCrop({
                              aspectRatio: preset.aspect as CropAspectRatio,
                              zoom: preset.zoom,
                              offsetX: 0,
                              offsetY: preset.offY,
                            })
                          }
                          className={`rounded-lg p-2 text-left border transition-all ${
                            active
                              ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                              : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-950'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-stone-100 truncate">
                            {preset.title}
                          </div>
                          <div className="text-[9px] text-stone-400 truncate mt-0.5">
                            {preset.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('slider')}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500 hover:bg-stone-750 hover:text-white transition-all"
                  >
                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                    <span>Apply & Compare in Split Slider</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownload('png-master')}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Cropped Master PNG</span>
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'avatar' && (
              /* Platform Mockup & Live Framing Simulator */
              <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900/90 p-6 sm:p-8">
                {/* Platform Selector Tabs */}
                <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-stone-800 bg-stone-950 p-1">
                  <button
                    id="mockup-tab-linkedin"
                    onClick={() => setActivePlatformMockup('linkedin')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      activePlatformMockup === 'linkedin'
                        ? 'bg-[#0a66c2] text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>in</span>
                    <span>LinkedIn</span>
                  </button>
                  <button
                    id="mockup-tab-twitter"
                    onClick={() => setActivePlatformMockup('twitter')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      activePlatformMockup === 'twitter'
                        ? 'bg-stone-100 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>𝕏</span>
                    <span>Twitter / X</span>
                  </button>
                  <button
                    id="mockup-tab-instagram"
                    onClick={() => setActivePlatformMockup('instagram')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      activePlatformMockup === 'instagram'
                        ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>IG</span>
                    <span>Instagram Circle</span>
                  </button>
                  <button
                    id="mockup-tab-instagram-portrait"
                    onClick={() => setActivePlatformMockup('instagram-portrait')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      activePlatformMockup === 'instagram-portrait'
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>4:5</span>
                    <span>Instagram Post</span>
                  </button>
                  <button
                    id="mockup-tab-resume"
                    onClick={() => setActivePlatformMockup('resume')}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      activePlatformMockup === 'resume'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>CV</span>
                    <span>Resume 3:4</span>
                  </button>
                </div>

                {/* Mockup Preview Card */}
                {activePlatformMockup === 'linkedin' && (
                  <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl">
                    <div className="h-20 bg-gradient-to-r from-sky-800 to-blue-950 relative">
                      <div className="absolute right-3 top-3 text-[10px] font-bold text-sky-300/80 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-700/50">
                        LinkedIn Profile UI
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-0 relative">
                      <div className="-mt-12 mb-3 relative inline-block">
                        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-stone-950 ring-2 ring-[#0a66c2] shadow-xl bg-stone-900">
                          {bgBlurPx > 0 && (
                            <img
                              src={item.headshotUrl}
                              alt="Blurred Bokeh Background"
                              referrerPolicy="no-referrer"
                              style={{
                                filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                                transform: 'scale(1.08)',
                              }}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <img
                            src={item.headshotUrl}
                            alt="LinkedIn Avatar"
                            referrerPolicy="no-referrer"
                            style={{
                              filter: imageFilterStyle,
                              ...(bgBlurPx > 0
                                ? {
                                    WebkitMaskImage:
                                      'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                    maskImage:
                                      'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                  }
                                : {}),
                            }}
                            className="relative h-full w-full object-cover"
                          />
                          {isSkinEnhanced && (
                            <img
                              src={item.headshotUrl}
                              alt="AI Skin Smoothing Layer"
                              referrerPolicy="no-referrer"
                              style={{
                                filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                                WebkitMaskImage:
                                  'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                                maskImage:
                                  'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                                opacity: 0.85,
                                pointerEvents: 'none',
                              }}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a66c2] text-white text-[10px] font-bold ring-2 ring-stone-950">
                          ✓
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-serif text-base font-bold text-stone-100 flex items-center gap-1.5">
                            <span>Executive Portrait</span>
                            <span className="text-[10px] font-sans font-medium text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">1st</span>
                          </div>
                          <p className="text-xs text-stone-300 font-medium">Founder & Principal • Tech & Advisory</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">London, UK • 500+ connections</p>
                        </div>
                        <span className="rounded-full bg-[#0a66c2] px-3 py-1 text-xs font-bold text-white shadow">
                          Open to Work
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activePlatformMockup === 'twitter' && (
                  <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-800 bg-black p-5 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-stone-800 ring-2 ring-sky-500/40 shadow-xl bg-stone-900 shrink-0">
                        {bgBlurPx > 0 && (
                          <img
                            src={item.headshotUrl}
                            alt="Blurred Bokeh Background"
                            referrerPolicy="no-referrer"
                            style={{
                              filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                              transform: 'scale(1.08)',
                            }}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <img
                          src={item.headshotUrl}
                          alt="Twitter Avatar"
                          referrerPolicy="no-referrer"
                          style={{
                            filter: imageFilterStyle,
                            ...(bgBlurPx > 0
                              ? {
                                  WebkitMaskImage:
                                    'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                  maskImage:
                                    'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                }
                              : {}),
                          }}
                          className="relative h-full w-full object-cover"
                        />
                        {isSkinEnhanced && (
                          <img
                            src={item.headshotUrl}
                            alt="AI Skin Smoothing Layer"
                            referrerPolicy="no-referrer"
                            style={{
                              filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                              WebkitMaskImage:
                                'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                              maskImage:
                                'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                              opacity: 0.85,
                              pointerEvents: 'none',
                            }}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white">Executive Profile</span>
                          <span className="text-sky-400 text-xs">☑</span>
                          <span className="text-xs text-stone-500">@executive_leader · 2h</span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          Excited to announce our newest studio milestone. Polished 85mm optical headshots tailored for timeline clarity.
                        </p>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 max-w-xs">
                          <span>💬 48</span>
                          <span>🔁 124</span>
                          <span>❤️ 892</span>
                          <span>📊 14.2K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePlatformMockup === 'instagram' && (
                  <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-lg">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-stone-950 bg-stone-900">
                          {bgBlurPx > 0 && (
                            <img
                              src={item.headshotUrl}
                              alt="Blurred Bokeh Background"
                              referrerPolicy="no-referrer"
                              style={{
                                filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                                transform: 'scale(1.08)',
                              }}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                          <img
                            src={item.headshotUrl}
                            alt="Instagram Profile Avatar"
                            referrerPolicy="no-referrer"
                            style={{
                              filter: imageFilterStyle,
                              ...(bgBlurPx > 0
                                ? {
                                    WebkitMaskImage:
                                      'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                    maskImage:
                                      'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                  }
                                : {}),
                            }}
                            className="relative h-full w-full object-cover"
                          />
                          {isSkinEnhanced && (
                            <img
                              src={item.headshotUrl}
                              alt="AI Skin Smoothing Layer"
                              referrerPolicy="no-referrer"
                              style={{
                                filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                                WebkitMaskImage:
                                  'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                                maskImage:
                                  'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                                opacity: 0.85,
                                pointerEvents: 'none',
                              }}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>studio.portrait</span>
                          <span className="rounded bg-stone-800 px-2 py-0.5 text-[10px] font-semibold text-stone-300">
                            Edit Profile
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-stone-300">
                          <span><strong className="text-white">128</strong> posts</span>
                          <span><strong className="text-white">4.8k</strong> followers</span>
                          <span><strong className="text-white">412</strong> following</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePlatformMockup === 'instagram-portrait' && (
                  <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl">
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-800/80">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-stone-700">
                          <img
                            src={item.headshotUrl}
                            alt="Thumb"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-white">portrait.executive</span>
                      </div>
                      <span className="text-xs text-stone-500 font-bold">•••</span>
                    </div>
                    {/* 4:5 Aspect Ratio Box */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                      {bgBlurPx > 0 && (
                        <img
                          src={item.headshotUrl}
                          alt="Blurred Bokeh Background"
                          referrerPolicy="no-referrer"
                          style={{
                            filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                            transform: 'scale(1.08)',
                          }}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      <img
                        src={item.headshotUrl}
                        alt="Instagram 4:5 Feed Post"
                        referrerPolicy="no-referrer"
                        style={{
                          filter: imageFilterStyle,
                          ...(bgBlurPx > 0
                            ? {
                                WebkitMaskImage:
                                  'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                maskImage:
                                  'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                              }
                            : {}),
                        }}
                        className="relative h-full w-full object-cover"
                      />
                      {isSkinEnhanced && (
                        <img
                          src={item.headshotUrl}
                          alt="AI Skin Smoothing Layer"
                          referrerPolicy="no-referrer"
                          style={{
                            filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                            WebkitMaskImage:
                              'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                            maskImage:
                              'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                            opacity: 0.85,
                            pointerEvents: 'none',
                          }}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[9px] font-mono text-stone-300 backdrop-blur-md">
                        4:5 Portrait
                      </div>
                    </div>
                    <div className="p-3 text-xs text-stone-300">
                      <div className="flex items-center gap-3 text-stone-300 font-bold mb-1.5 text-sm">
                        <span>❤️</span>
                        <span>💬</span>
                        <span>✈️</span>
                      </div>
                      <p><strong className="text-white font-semibold">portrait.executive</strong> Updated executive portrait series. #headshot #leadership</p>
                    </div>
                  </div>
                )}

                {activePlatformMockup === 'resume' && (
                  <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-stone-900 to-stone-950 p-5 shadow-2xl">
                    <div className="flex items-start gap-4">
                      {/* 3:4 Aspect Ratio Frame */}
                      <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-500/50 shadow-md bg-stone-900">
                        {bgBlurPx > 0 && (
                          <img
                            src={item.headshotUrl}
                            alt="Blurred Bokeh Background"
                            referrerPolicy="no-referrer"
                            style={{
                              filter: `${imageFilterStyle} blur(${bgBlurPx}px)`,
                              transform: 'scale(1.08)',
                            }}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <img
                          src={item.headshotUrl}
                          alt="Resume 3:4 Crop"
                          referrerPolicy="no-referrer"
                          style={{
                            filter: imageFilterStyle,
                            ...(bgBlurPx > 0
                              ? {
                                  WebkitMaskImage:
                                    'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                  maskImage:
                                    'radial-gradient(ellipse 54% 64% at 50% 43%, black 35%, rgba(0,0,0,0.85) 60%, transparent 88%)',
                                }
                              : {}),
                          }}
                          className="relative h-full w-full object-cover"
                        />
                        {isSkinEnhanced && (
                          <img
                            src={item.headshotUrl}
                            alt="AI Skin Smoothing Layer"
                            referrerPolicy="no-referrer"
                            style={{
                              filter: `${imageFilterStyle} blur(3.5px) saturate(104%) brightness(101%)`,
                              WebkitMaskImage:
                                'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                              maskImage:
                                'radial-gradient(ellipse 28% 34% at 50% 41%, black 30%, rgba(0,0,0,0.65) 60%, transparent 95%)',
                              opacity: 0.85,
                              pointerEvents: 'none',
                            }}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-1 right-1 rounded bg-stone-950/80 px-1 text-[8px] font-bold text-emerald-400">
                          3:4
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Resume / Speaker Bio
                        </span>
                        <h4 className="mt-1.5 font-serif text-sm font-bold text-stone-100">
                          Alex Taylor, M.Sc.
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          VP of Engineering & Architecture
                        </p>
                        <p className="text-[10px] text-stone-500 mt-2 leading-relaxed">
                          3:4 crop proportion calibrated specifically for PDF bio briefs, conference speaker badges, and executive dossiers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Button for Selected Mockup */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => {
                      const found = PLATFORM_EXPORT_PRESETS.find(
                        (p) => p.platform === activePlatformMockup || (activePlatformMockup === 'instagram-portrait' && p.id === 'instagram-portrait-post')
                      ) || PLATFORM_EXPORT_PRESETS[0];
                      handlePlatformExport(found);
                    }}
                    disabled={isDownloading}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {activePlatformMockup === 'linkedin' && 'Export LinkedIn (800 × 800 px)'}
                      {activePlatformMockup === 'twitter' && 'Export Twitter / X (800 × 800 px)'}
                      {activePlatformMockup === 'instagram' && 'Export Instagram (1080 × 1080 px)'}
                      {activePlatformMockup === 'instagram-portrait' && 'Export 4:5 Portrait (1080 × 1350 px)'}
                      {activePlatformMockup === 'resume' && 'Export Resume 3:4 (1200 × 1600 px)'}
                    </span>
                  </button>
                </div>
              </div>
            )}


            {/* Quick Edit Aesthetic Looks Bar */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-stone-400">
                <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Quick Looks:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {QUICK_EDIT_FILTERS.map((f) => {
                  const active = isFilterActive(f);
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleApplyFilter(f)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                        active
                          ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                          : 'border-stone-800 bg-stone-900/90 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${f.previewGradient}`} />
                      <span>{f.name}</span>
                      {active && <Check className="h-3 w-3 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar under image */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 pt-3">
              <div className="flex items-center gap-2">
                <button
                  id="btn-favorite-headshot"
                  onClick={() => onToggleFavorite(item.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    item.isFavorite
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                  <span>{item.isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>

                <button
                  id="btn-copy-headshot"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-800"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-stone-400" />
                      <span>Copy Headshot</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-bottom-share-headshot"
                  onClick={() => {
                    setSharePlatformOverride(undefined);
                    setIsShareModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition-all hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-200"
                >
                  <Share2 className="h-4 w-4 text-amber-400" />
                  <span>Share</span>
                </button>

                <button
                  id="btn-bottom-facebook-share"
                  onClick={() => {
                    setSharePlatformOverride('facebook');
                    setIsShareModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-[#1877f2]/50 bg-[#1877f2]/15 px-3 py-2 text-xs font-semibold text-sky-200 transition-all hover:border-[#1877f2] hover:bg-[#1877f2]/30 hover:text-white"
                  title="Generate pre-formatted Facebook post message and image preview link"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-white font-bold text-[10px] leading-none">
                    f
                  </span>
                  <span>Share on Facebook</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-try-another-style"
                  onClick={onGenerateAnother}
                  className="rounded-lg border border-stone-700 bg-stone-900 px-3.5 py-2 text-xs font-medium text-stone-200 transition-colors hover:border-amber-500/50 hover:bg-stone-800"
                >
                  Try Another Style
                </button>

                {/* Primary High-Res Download Button */}
                <div className="relative">
                  <button
                    id="btn-download-headshot"
                    disabled={isDownloading}
                    onClick={() => handleDownload('png-master')}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {isDownloading
                        ? 'Exporting High-Res...'
                        : 'Download High-Res (PNG)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Studio Adjustments & AI Critique & High-Res Export Hub */}
        <div className="space-y-4 lg:col-span-4">
          {/* Tabs */}
          <div className="flex rounded-xl border border-stone-800 bg-stone-900/90 p-1">
            <button
              id="tab-studio-darkroom"
              onClick={() => setActiveTab('adjustments')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'adjustments'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Studio Darkroom</span>
            </button>

            <button
              id="tab-platform-crops"
              onClick={() => setActiveTab('platforms')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'platforms'
                  ? 'bg-stone-800 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Crop className="h-3.5 w-3.5 text-amber-400" />
              <span>Platform Crops</span>
            </button>

            <button
              id="tab-ai-critique"
              onClick={() => setActiveTab('critique')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'critique'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>AI Critique</span>
            </button>
          </div>

          {activeTab === 'adjustments' ? (

            /* Studio Adjustments */
            <div className="space-y-4">
              {/* Quick Edit Aesthetic Filters Panel */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-amber-400" />
                    <h3 className="font-serif text-sm font-semibold text-stone-100">
                      Quick Edit Aesthetic Filters
                    </h3>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    1-Click Looks
                  </span>
                </div>
                <p className="mb-3.5 text-xs text-stone-400 leading-relaxed">
                  One-click professional color grading, lighting tone, and editorial finishes.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_EDIT_FILTERS.map((filter) => {
                    const active = isFilterActive(filter);
                    return (
                      <button
                        key={filter.id}
                        id={`filter-${filter.id}`}
                        onClick={() => handleApplyFilter(filter)}
                        className={`group relative flex flex-col items-start overflow-hidden rounded-xl border p-2.5 text-left transition-all ${
                          active
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                            : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-950'
                        }`}
                      >
                        {/* Accent gradient line */}
                        <div
                          className={`h-1.5 w-full rounded-full bg-gradient-to-r ${filter.previewGradient} mb-1.5`}
                        />

                        <div className="flex w-full items-center justify-between gap-1">
                          <span
                            className={`text-xs font-semibold truncate ${
                              active ? 'text-amber-400' : 'text-stone-200 group-hover:text-white'
                            }`}
                          >
                            {filter.name}
                          </span>
                          {active ? (
                            <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          ) : filter.badge ? (
                            <span className="rounded bg-stone-800/80 px-1.5 py-0.5 text-[9px] font-medium text-stone-400">
                              {filter.badge}
                            </span>
                          ) : null}
                        </div>

                        <span className="mt-1 line-clamp-2 text-[10px] text-stone-400 leading-tight">
                          {filter.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Framing & Aspect Ratio Utility Card */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                      <Crop className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-stone-100">
                        Framing & Aspect Ratio
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Trim to square, portrait, or landscape framing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetCrop}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-400"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Aspect Ratio Selector Pills */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 block mb-1.5">
                      Aspect Ratio Framing
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'original', label: 'Original', sub: 'Full' },
                        { id: '1:1', label: '1:1', sub: 'Square' },
                        { id: '4:5', label: '4:5', sub: 'Social' },
                        { id: '3:4', label: '3:4', sub: 'Resume' },
                        { id: '16:9', label: '16:9', sub: 'Banner' },
                        { id: '3:2', label: '3:2', sub: 'Classic' },
                      ].map((aspect) => {
                        const active = currentCrop.aspectRatio === aspect.id;
                        return (
                          <button
                            key={aspect.id}
                            type="button"
                            onClick={() =>
                              handleUpdateCrop({
                                aspectRatio: aspect.id as CropAspectRatio,
                              })
                            }
                            className={`rounded-lg py-1.5 px-2 text-center text-xs transition-all ${
                              active
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                            }`}
                          >
                            <div>{aspect.label}</div>
                            <div className={`text-[9px] ${active ? 'text-stone-900' : 'text-stone-500'}`}>
                              {aspect.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zoom / Tightness Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                        <span>Tightness / Zoom</span>
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        {Math.round(currentCrop.zoom * 100)}% ({currentCrop.zoom.toFixed(2)}x)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.05"
                      value={currentCrop.zoom}
                      onChange={(e) =>
                        handleUpdateCrop({
                          zoom: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1.5 w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Quick Focus Targets */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-300 block mb-1.5">
                      Composition Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateCrop({ offsetY: -25, zoom: Math.max(1.25, currentCrop.zoom) })}
                        className={`rounded-lg py-1 px-2 text-[10px] font-medium text-center transition-all ${
                          currentCrop.offsetY <= -15
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        👤 Face Focus
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCrop({ offsetX: 0, offsetY: 0 })}
                        className={`rounded-lg py-1 px-2 text-[10px] font-medium text-center transition-all ${
                          currentCrop.offsetX === 0 && currentCrop.offsetY === 0
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        ⚖️ Center
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCrop({ offsetY: 25, zoom: Math.max(1.2, currentCrop.zoom) })}
                        className={`rounded-lg py-1 px-2 text-[10px] font-medium text-center transition-all ${
                          currentCrop.offsetY >= 15
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        👔 Torso
                      </button>
                    </div>
                  </div>

                  {/* Jump to Interactive Viewfinder */}
                  <button
                    type="button"
                    onClick={() => setViewMode('crop')}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
                  >
                    <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                    <span>Open Interactive Viewfinder Canvas</span>
                  </button>
                </div>
              </div>

              {/* Manual Fine-Tuning Sliders */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-stone-100">
                      Fine-Tune Adjustments
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Custom slider control over exposure and color balance
                    </p>
                  </div>
                  <button
                    onClick={resetAdjustments}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-400"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Background Blur / Aperture Simulation Slider */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                          <Aperture className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-100">
                            <span>Adjust Blur</span>
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                              {apertureInfo.fStop}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400">
                            {apertureInfo.depthDescription}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {item.adjustments.backgroundBlur || 0}%
                      </span>
                    </div>

                    <input
                      id="slider-adjust-blur"
                      type="range"
                      min="0"
                      max="100"
                      value={item.adjustments.backgroundBlur || 0}
                      onChange={(e) =>
                        onUpdateAdjustments({
                          ...item.adjustments,
                          backgroundBlur: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    {/* Quick Aperture Preset Pills */}
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      {[
                        { label: 'f/16 (Off)', value: 0 },
                        { label: 'f/5.6', value: 25 },
                        { label: 'f/2.8 (Prime)', value: 55 },
                        { label: 'f/1.8', value: 75 },
                        { label: 'f/1.2 (Max)', value: 100 },
                      ].map((preset) => {
                        const active = (item.adjustments.backgroundBlur || 0) === preset.value;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              onUpdateAdjustments({
                                ...item.adjustments,
                                backgroundBlur: preset.value,
                              })
                            }
                            className={`flex-1 rounded-md py-1 text-[9px] font-mono transition-all ${
                              active
                                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                                : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Enhance Skin Smoothing Toggle Card */}
                  <div
                    className={`rounded-xl border transition-all p-3.5 ${
                      item.adjustments.skinEnhance
                        ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                            item.adjustments.skinEnhance
                              ? 'bg-emerald-500 text-stone-950 shadow-sm'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-100">
                              AI Enhance Skin
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.2 text-[9px] font-semibold transition-all ${
                                item.adjustments.skinEnhance
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-stone-800 text-stone-500'
                              }`}
                            >
                              {item.adjustments.skinEnhance ? 'Active • Natural Smoothing' : 'Off'}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">
                            Light natural skin-smoothing mask for blemishes while keeping eyes & facial contours crisp.
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        id="toggle-ai-enhance-skin"
                        type="button"
                        role="switch"
                        aria-checked={!!item.adjustments.skinEnhance}
                        onClick={() =>
                          onUpdateAdjustments({
                            ...item.adjustments,
                            skinEnhance: !item.adjustments.skinEnhance,
                          })
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-stone-900 ${
                          item.adjustments.skinEnhance ? 'bg-emerald-500' : 'bg-stone-800'
                        }`}
                      >
                        <span className="sr-only">Toggle AI Enhance Skin</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow-md ring-0 transition duration-200 ease-in-out ${
                            item.adjustments.skinEnhance ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Exposure */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5">
                        Exposure
                      </span>
                      <span className="font-mono text-stone-400">
                        {item.adjustments.exposure > 0 ? `+${item.adjustments.exposure}` : item.adjustments.exposure}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={item.adjustments.exposure}
                      onChange={(e) =>
                        onUpdateAdjustments({
                          ...item.adjustments,
                          exposure: Number(e.target.value),
                        })
                      }
                      className="mt-1.5 w-full accent-amber-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5">
                        Contrast
                      </span>
                      <span className="font-mono text-stone-400">
                        {item.adjustments.contrast > 0 ? `+${item.adjustments.contrast}` : item.adjustments.contrast}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={item.adjustments.contrast}
                      onChange={(e) =>
                        onUpdateAdjustments({
                          ...item.adjustments,
                          contrast: Number(e.target.value),
                        })
                      }
                      className="mt-1.5 w-full accent-amber-500"
                    />
                  </div>

                  {/* Warmth */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5">
                        Color Temperature (Warmth)
                      </span>
                      <span className="font-mono text-stone-400">
                        {item.adjustments.warmth > 0 ? `+${item.adjustments.warmth}K` : `${item.adjustments.warmth}K`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={item.adjustments.warmth}
                      onChange={(e) =>
                        onUpdateAdjustments({
                          ...item.adjustments,
                          warmth: Number(e.target.value),
                        })
                      }
                      className="mt-1.5 w-full accent-amber-500"
                    />
                  </div>

                  {/* Vignette */}
                  <div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="flex items-center gap-1.5">
                        Studio Vignette
                      </span>
                      <span className="font-mono text-stone-400">
                        {item.adjustments.vignette}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={item.adjustments.vignette}
                      onChange={(e) =>
                        onUpdateAdjustments({
                          ...item.adjustments,
                          vignette: Number(e.target.value),
                        })
                      }
                      className="mt-1.5 w-full accent-amber-500"
                    />
                  </div>

                  {/* B&W Toggle */}
                  <div className="flex items-center justify-between border-t border-stone-800 pt-3">
                    <span className="text-xs font-medium text-stone-300">
                      Editorial Black & White Mode
                    </span>
                    <button
                      onClick={() =>
                        onUpdateAdjustments({
                          ...item.adjustments,
                          isBlackAndWhite: !item.adjustments.isBlackAndWhite,
                        })
                      }
                      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                        item.adjustments.isBlackAndWhite
                          ? 'bg-amber-500'
                          : 'bg-stone-800'
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-stone-950 transition-transform ${
                          item.adjustments.isBlackAndWhite
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dedicated High-Res Download Card */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-stone-900 to-stone-950 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-amber-400" />
                    <h3 className="font-serif text-sm font-semibold text-stone-100">
                      Save & Export Headshot
                    </h3>
                  </div>
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                    High Resolution
                  </span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  Export with all lighting, color adjustments, and vignettes baked in.
                </p>

                <div className="space-y-2">
                  <button
                    id="btn-download-master-png"
                    disabled={isDownloading}
                    onClick={() => handleDownload('png-master')}
                    className="flex w-full items-center justify-between rounded-xl border border-stone-700 bg-stone-800/80 px-3.5 py-2.5 text-xs text-stone-200 transition-all hover:border-amber-500 hover:bg-stone-800 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-amber-400" />
                      <div className="text-left">
                        <div className="font-bold text-stone-100">Ultra-HD Master PNG</div>
                        <div className="text-[10px] text-stone-400">2048 × 2048 px · Lossless Studio Master</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-stone-400" />
                  </button>

                  <button
                    id="btn-download-linkedin-jpg"
                    disabled={isDownloading}
                    onClick={() => handleDownload('jpeg-linkedin')}
                    className="flex w-full items-center justify-between rounded-xl border border-stone-700 bg-stone-800/80 px-3.5 py-2.5 text-xs text-stone-200 transition-all hover:border-amber-500 hover:bg-stone-800 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4 text-sky-400" />
                      <div className="text-left">
                        <div className="font-bold text-stone-100">LinkedIn Square JPEG</div>
                        <div className="text-[10px] text-stone-400">1080 × 1080 px · Social & Bio Ready</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-stone-400" />
                  </button>

                  <button
                    id="btn-download-print-png"
                    disabled={isDownloading}
                    onClick={() => handleDownload('png-print')}
                    className="flex w-full items-center justify-between rounded-xl border border-stone-700 bg-stone-800/80 px-3.5 py-2.5 text-xs text-stone-200 transition-all hover:border-amber-500 hover:bg-stone-800 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4 text-emerald-400" />
                      <div className="text-left">
                        <div className="font-bold text-stone-100">Print 300 DPI Master</div>
                        <div className="text-[10px] text-stone-400">3000 × 3000 px · Press & Resume Print</div>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-stone-400" />
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'platforms' ? (
            /* Platform Crops Hub */
            <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crop className="h-4 w-4 text-amber-400" />
                  <h3 className="font-serif text-sm font-semibold text-stone-100">
                    Platform Aspect Crops
                  </h3>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  Smart Auto-Crop
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Biased toward eye-level and focal composition. Click any preset to instantly re-crop, resize, and export.
              </p>

              <div className="space-y-2.5">
                {PLATFORM_EXPORT_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="rounded-xl border border-stone-800 bg-stone-950/80 p-3 transition-all hover:border-stone-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs shadow-md"
                          style={{ backgroundColor: preset.brandColor }}
                        >
                          {preset.platform === 'linkedin' ? 'in' :
                           preset.platform === 'twitter' ? '𝕏' :
                           preset.platform === 'instagram' ? 'IG' :
                           preset.platform === 'resume' ? 'CV' : 'GH'}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-100 flex items-center gap-2">
                            <span>{preset.name}</span>
                            <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[9px] font-mono text-stone-400">
                              {preset.targetWidth} × {preset.targetHeight}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">
                            {preset.subLabel}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-stone-800/80 pt-2.5 text-[10px]">
                      <span className="text-stone-500 font-mono">
                        {preset.aspectRatioLabel} · {preset.format.toUpperCase()} · {preset.cropType}
                      </span>

                      <button
                        id={`btn-sidebar-export-${preset.id}`}
                        disabled={isDownloading}
                        onClick={() => handlePlatformExport(preset)}
                        className="flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-2.5 py-1 text-xs font-semibold text-stone-200 hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950 transition-all disabled:opacity-50"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export Crop</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* AI Critique */
            <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">

              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-sm font-semibold text-stone-100">
                  Photographer's Audit
                </h3>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 ring-1 ring-amber-500/20">
                  {item.critique?.grade || 'A+'} Grade
                </span>
              </div>

              {item.critique ? (
                <div className="space-y-3 text-xs">
                  <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
                    <span className="font-semibold text-amber-400 block mb-0.5">
                      💡 Studio Lighting & Catchlights
                    </span>
                    <p className="text-stone-400 leading-relaxed">
                      {item.critique.critique.lighting}
                    </p>
                  </div>

                  <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
                    <span className="font-semibold text-amber-400 block mb-0.5">
                      👔 Wardrobe & Executive Poise
                    </span>
                    <p className="text-stone-400 leading-relaxed">
                      {item.critique.critique.wardrobe}
                    </p>
                  </div>

                  <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
                    <span className="font-semibold text-amber-400 block mb-0.5">
                      😊 Expression & Engagement
                    </span>
                    <p className="text-stone-400 leading-relaxed">
                      {item.critique.critique.expression}
                    </p>
                  </div>

                  {item.critique.recommendations && item.critique.recommendations.length > 0 && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <span className="font-semibold text-amber-300 block mb-1">
                        🚀 Best Usage Recommendations
                      </span>
                      <ul className="space-y-1 text-stone-300">
                        {item.critique.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-xs text-stone-400 py-6">
                  Evaluating portrait metrics...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Social Network Share Hub & Pre-Formatted Post Composer */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharePlatformOverride(undefined);
        }}
        item={item}
        imageFilterStyle={imageFilterStyle}
        initialPlatform={sharePlatformOverride}
      />
    </div>
  );
};
