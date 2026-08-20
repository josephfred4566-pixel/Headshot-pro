import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { AppLogoMark } from './AppLogo';

interface GenerationProgressProps {
  styleName: string;
}

const STEPS = [
  { label: 'Analyzing facial features & likeness...', icon: Camera },
  { label: 'Setting up 3-point softbox studio lighting...', icon: Sliders },
  { label: 'Tailoring executive wardrobe & neckline...', icon: Sparkles },
  { label: 'Rendering 85mm f/1.4 optical bokeh & catchlights...', icon: Camera },
  { label: 'Finalizing high-resolution LinkedIn-ready portrait...', icon: CheckCircle2 },
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ styleName }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/90 p-8 text-center shadow-2xl">
      {/* Animated Studio Aperture / Shutter */}
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-400" style={{ animationDuration: '3s' }} />
        {/* Inner logo mark */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-950 border border-stone-800 shadow-xl shadow-amber-500/10">
          <AppLogoMark size={64} />
        </div>
      </div>

      <h3 className="font-serif text-xl font-semibold text-stone-100">
        Developing Your Professional Headshot
      </h3>
      <p className="mt-1 text-xs text-amber-400 font-medium">
        Style: {styleName}
      </p>

      {/* Steps checklist */}
      <div className="mt-6 w-full max-w-md space-y-2.5 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-lg border px-3.5 py-2 transition-all ${
                isCurrent
                  ? 'border-amber-500/60 bg-amber-500/10 text-stone-100 ring-1 ring-amber-500/30'
                  : isDone
                  ? 'border-stone-800 bg-stone-950/40 text-emerald-400'
                  : 'border-transparent text-stone-600'
              }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <StepIcon
                    className={`h-4 w-4 ${
                      isCurrent ? 'animate-pulse text-amber-400' : 'text-stone-600'
                    }`}
                  />
                )}
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
