import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Check, RefreshCw, Eye, Sliders, UserCheck } from 'lucide-react';
import { SAMPLE_SELFIES } from '../data/sampleSelfies';
import { SampleSelfie } from '../types';
import { fileToDataUrl, urlToDataUrl } from '../utils/portraitCanvas';
import { CameraAlignmentGuide, GuidePreset } from './CameraAlignmentGuide';

interface SelfieUploaderProps {
  currentImage: string | null;
  onImageSelected: (dataUrl: string) => void;
  onClearImage: () => void;
  onOpenWebcam: () => void;
}

export const SelfieUploader: React.FC<SelfieUploaderProps> = ({
  currentImage,
  onImageSelected,
  onClearImage,
  onOpenWebcam,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [showGuideOverlay, setShowGuideOverlay] = useState(false);
  const [guidePreset, setGuidePreset] = useState<GuidePreset>('executive');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      try {
        const dataUrl = await fileToDataUrl(files[0]);
        onImageSelected(dataUrl);
      } catch (err) {
        console.error('File conversion error:', err);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.dataTransfer.files[0]);
        onImageSelected(dataUrl);
      } catch (err) {
        console.error('Drop error:', err);
      }
    }
  };

  const handleSelectSample = async (sample: SampleSelfie) => {
    setLoadingSampleId(sample.id);
    try {
      const dataUrl = await urlToDataUrl(sample.imageUrl);
      onImageSelected(dataUrl);
    } catch (err) {
      console.warn('Sample load failed via canvas proxy, using direct url:', err);
      onImageSelected(sample.imageUrl);
    } finally {
      setLoadingSampleId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl sm:p-6">
      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-tight text-stone-100">
            1. Source Casual Selfie
          </h2>
          <p className="text-xs text-stone-400">
            Upload any everyday smartphone selfie, portrait, or snapshot.
          </p>
        </div>

        {currentImage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-guide-overlay"
              onClick={() => setShowGuideOverlay(!showGuideOverlay)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                showGuideOverlay
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-stone-800 border border-stone-700 text-stone-300 hover:text-white hover:border-stone-600'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>{showGuideOverlay ? 'Hide Guide' : 'Check Alignment'}</span>
            </button>

            <button
              onClick={onClearImage}
              className="text-xs font-medium text-amber-400 transition-colors hover:text-amber-300"
            >
              Change Photo
            </button>
          </div>
        )}
      </div>

      {currentImage ? (
        /* Selected Image Preview with studio frame & dynamic alignment overlay */
        <div className="relative overflow-hidden rounded-xl border border-stone-700 bg-stone-950 p-2">
          <div className="group relative flex aspect-square max-h-[380px] w-full items-center justify-center overflow-hidden rounded-lg bg-stone-900">
            <img
              src={currentImage}
              alt="Source casual selfie"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />

            {/* Dynamic Alignment Guide Overlay when activated */}
            {showGuideOverlay && (
              <CameraAlignmentGuide
                guidePreset={guidePreset}
                showRuleOfThirds={true}
                showEyeLine={true}
                scale={1.0}
                animated={false}
              />
            )}

            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-stone-950/80 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md border border-emerald-500/30">
              <Check className="h-3.5 w-3.5" />
              <span>Selfie Loaded</span>
            </div>

            {showGuideOverlay && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-stone-950/90 p-1 border border-stone-800 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setGuidePreset('executive')}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    guidePreset === 'executive' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                  }`}
                >
                  Executive
                </button>
                <button
                  type="button"
                  onClick={() => setGuidePreset('avatar')}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    guidePreset === 'avatar' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                  }`}
                >
                  Close-Up
                </button>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/95 via-stone-950/50 to-transparent p-4 text-center">
              <p className="text-xs font-medium text-stone-200">
                {showGuideOverlay
                  ? 'Verify eyes match blue horizontal level and shoulders span the amber arch.'
                  : 'Ready for AI Studio Headshot Transformation'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'bg-amber-500/5'
                : 'bg-stone-950/70 hover:bg-stone-950'
            }`}
          >
            {/* 5-Second Rolling RGB Warm Amber & Golden Orange Light Beam on Dashed Border */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible rounded-xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="warmAmberBeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
                  <stop offset="20%" stopColor="#D97706" stopOpacity="0.4" />
                  <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#FDE047" stopOpacity="1" />
                  <stop offset="70%" stopColor="#F97316" stopOpacity="0.95" />
                  <stop offset="85%" stopColor="#EA580C" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
                </linearGradient>

                <filter id="warmAmberDashedGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Underlying Base Dashed Path */}
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="12"
                fill="none"
                stroke="#44403c"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* Ambient Glowing Dashed Beam Rolling Loop */}
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="12"
                fill="none"
                stroke="url(#warmAmberBeamGradient)"
                strokeWidth="4"
                strokeDasharray="6 6"
                filter="url(#warmAmberDashedGlow)"
                pathLength="100"
                className="animate-dashed-glow-5s opacity-70"
              />

              {/* Crisp Core Rolling Light Beam directly along Dashed Border */}
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="12"
                fill="none"
                stroke="url(#warmAmberBeamGradient)"
                strokeWidth="2"
                strokeDasharray="6 6"
                pathLength="100"
                className="animate-dashed-glow-5s"
              />
            </svg>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/heic"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 border border-stone-800 text-amber-400 shadow-lg group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold text-stone-200">
              Drag & drop your casual selfie here, or <span className="text-amber-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Supports JPG, PNG, WEBP • Works best with clear face & good lighting
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-px w-10 bg-stone-800" />
              <span className="text-[11px] uppercase tracking-wider text-stone-500">or</span>
              <span className="h-px w-10 bg-stone-800" />
            </div>

            <button
              type="button"
              id="btn-open-camera-guide"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWebcam();
              }}
              className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 px-4 py-2.5 text-xs font-semibold text-amber-300 shadow-lg shadow-amber-500/10 transition-all hover:border-amber-400 hover:bg-stone-800 hover:text-amber-200 hover:scale-[1.02] active:scale-95"
            >
              <Camera className="h-4 w-4 text-amber-400" />
              <span>Take Live Selfie with Alignment Guide</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                Head & Shoulder Frame
              </span>
            </button>
          </div>

          {/* Preset Sample Selfies for instant testing */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Or try one of {SAMPLE_SELFIES.length} test casual selfies:
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Scroll to browse all</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 max-h-[380px] overflow-y-auto pr-1.5">
              {SAMPLE_SELFIES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  disabled={loadingSampleId === sample.id}
                  className="group relative overflow-hidden rounded-xl border border-stone-800 bg-stone-950 p-1.5 text-left transition-all hover:border-amber-500/60 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-900">
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {loadingSampleId === sample.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs">
                        <RefreshCw className="h-5 w-5 animate-spin text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 px-1">
                    <p className="truncate text-xs font-semibold text-stone-200">
                      {sample.name}
                    </p>
                    <p className="truncate text-[10px] text-stone-400">
                      {sample.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
