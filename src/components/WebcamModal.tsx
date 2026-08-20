import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Zap, AlertCircle, Grid, Sliders, Eye, Sparkles } from 'lucide-react';
import { CameraAlignmentGuide, GuidePreset } from './CameraAlignmentGuide';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Dynamic Alignment Guide States
  const [showGuide, setShowGuide] = useState(true);
  const [guidePreset, setGuidePreset] = useState<GuidePreset>('executive');
  const [showGrid, setShowGrid] = useState(true);
  const [showEyeLine, setShowEyeLine] = useState(true);
  const [guideScale, setGuideScale] = useState(1.0);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 1280 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please check browser permissions or upload an existing photo.'
      );
      setIsInitializing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  const triggerCapture = () => {
    if (countdown !== null) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Shutter snap!
      setFlashEffect(true);
      setTimeout(() => setFlashEffect(false), 200);

      if (videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 800;
        canvas.height = video.videoHeight || 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror horizontal like standard selfie preview
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          stopCamera();
          onCapture(dataUrl);
          onClose();
        }
      }
      setCountdown(null);
    }
  }, [countdown, onClose, onCapture, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-base font-semibold text-stone-100">
              Live Photo Booth
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative aspect-square w-full bg-stone-950 overflow-hidden">
          {flashEffect && (
            <div className="absolute inset-0 z-30 bg-white transition-opacity duration-150" />
          )}

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-400">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm font-medium">Opening studio camera...</p>
            </div>
          )}

          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-rose-300">
              <AlertCircle className="mb-3 h-10 w-10 text-rose-400" />
              <p className="mb-4 text-sm">{cameraError}</p>
              <button
                onClick={startCamera}
                className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-medium text-stone-200 hover:bg-stone-700"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover -scale-x-100"
              />

              {/* Dynamic Camera Alignment Guide (Head circle + Shoulder frame) */}
              {showGuide && (
                <CameraAlignmentGuide
                  guidePreset={guidePreset}
                  showRuleOfThirds={showGrid}
                  showEyeLine={showEyeLine}
                  scale={guideScale}
                  animated={true}
                />
              )}

              {/* Countdown overlay */}
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/40 backdrop-blur-xs">
                  <span className="animate-ping font-serif text-7xl font-bold text-amber-400">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alignment Guide Toolbar */}
        <div className="border-t border-stone-800/80 bg-stone-950/80 px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-stone-400 mr-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Guide:
              </span>
              <button
                type="button"
                onClick={() => setGuidePreset('executive')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  guidePreset === 'executive'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200 border border-transparent'
                }`}
              >
                Executive
              </button>
              <button
                type="button"
                onClick={() => setGuidePreset('avatar')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  guidePreset === 'avatar'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200 border border-transparent'
                }`}
              >
                Close-Up
              </button>
              <button
                type="button"
                onClick={() => setGuidePreset('wide')}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  guidePreset === 'wide'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-stone-400 hover:bg-stone-850 hover:text-stone-200 border border-transparent'
                }`}
              >
                Torso
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                  showGrid
                    ? 'bg-stone-800 text-stone-200'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
                title="Toggle Rule of Thirds Grid"
              >
                <Grid className="h-3 w-3" />
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEyeLine(!showEyeLine)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                  showEyeLine
                    ? 'bg-stone-800 text-sky-400'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
                title="Toggle Eye Level Line"
              >
                <Eye className="h-3 w-3" />
                <span>Eye Line</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  showGuide
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                {showGuide ? 'Guide: ON' : 'Guide: OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-stone-800 bg-stone-950/90 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>3s Auto Shutter</span>
          </div>

          <button
            id="btn-shutter-capture"
            disabled={isInitializing || Boolean(cameraError) || countdown !== null}
            onClick={triggerCapture}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            <span>{countdown !== null ? 'Taking shot...' : 'Capture Selfie'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
