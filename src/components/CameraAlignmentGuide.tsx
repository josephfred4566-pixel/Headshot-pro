import React from 'react';

export type GuidePreset = 'executive' | 'avatar' | 'wide';

interface CameraAlignmentGuideProps {
  guidePreset?: GuidePreset;
  showRuleOfThirds?: boolean;
  showEyeLine?: boolean;
  opacity?: number; // 0.2 to 1.0
  scale?: number; // 0.8 to 1.2
  animated?: boolean;
  className?: string;
}

export const CameraAlignmentGuide: React.FC<CameraAlignmentGuideProps> = ({
  guidePreset = 'executive',
  showRuleOfThirds = true,
  showEyeLine = true,
  opacity = 0.85,
  scale = 1.0,
  animated = true,
  className = '',
}) => {
  // Preset parameters for head and shoulders
  const getPresetConfig = () => {
    switch (guidePreset) {
      case 'avatar':
        return {
          headCy: 46,
          headRx: 28 * scale,
          headRy: 35 * scale,
          eyeY: 42,
          shoulderStartY: 76,
          shoulderControlY: 82,
          shoulderEndX: 96,
          shoulderEndY: 100,
        };
      case 'wide':
        return {
          headCy: 36,
          headRx: 19 * scale,
          headRy: 24 * scale,
          eyeY: 34,
          shoulderStartY: 58,
          shoulderControlY: 66,
          shoulderEndX: 98,
          shoulderEndY: 100,
        };
      case 'executive':
      default:
        return {
          headCy: 40,
          headRx: 23 * scale,
          headRy: 29 * scale,
          eyeY: 37,
          shoulderStartY: 66,
          shoulderControlY: 74,
          shoulderEndX: 96,
          shoulderEndY: 100,
        };
    }
  };

  const config = getPresetConfig();

  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          {/* Subtle amber gradient for guide lines */}
          <linearGradient id="guideGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="shoulderGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
          </linearGradient>

          {/* Filter for glowing neon guides */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Rule of Thirds Grid (Optional subtle guides) */}
        {showRuleOfThirds && (
          <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.25" strokeDasharray="1, 2">
            {/* Vertical thirds */}
            <line x1="33.33" y1="0" x2="33.33" y2="100" />
            <line x1="66.66" y1="0" x2="66.66" y2="100" />
            {/* Horizontal thirds */}
            <line x1="0" y1="33.33" x2="100" y2="33.33" />
            <line x1="0" y1="66.66" x2="100" y2="66.66" />
          </g>
        )}

        {/* Outer Corner Frame Brackets */}
        <g stroke="#f59e0b" strokeWidth="0.7" strokeOpacity="0.6" fill="none">
          {/* Top Left */}
          <path d="M 6 12 L 6 6 L 12 6" />
          {/* Top Right */}
          <path d="M 88 6 L 94 6 L 94 12" />
          {/* Bottom Left */}
          <path d="M 6 88 L 6 94 L 12 94" />
          {/* Bottom Right */}
          <path d="M 88 94 L 94 94 L 94 88" />
        </g>

        {/* Center Vertical Symmetry Axis */}
        <line
          x1="50"
          y1="8"
          x2="50"
          y2="92"
          stroke="rgba(245, 158, 11, 0.35)"
          strokeWidth="0.3"
          strokeDasharray="1.5, 2"
        />

        {/* 1. SHOULDER & TORSO GUIDE FRAME */}
        <g className={animated ? 'animate-pulse' : ''} style={{ animationDuration: '3.5s' }}>
          {/* Left Shoulder Slope */}
          <path
            d={`M 50 ${config.shoulderStartY} Q ${50 - config.headRx * 0.9} ${config.shoulderControlY}, ${100 - config.shoulderEndX} ${config.shoulderEndY}`}
            fill="none"
            stroke="url(#guideGlow)"
            strokeWidth="0.65"
            strokeDasharray="2.5, 1.5"
            filter="url(#neonGlow)"
          />
          {/* Right Shoulder Slope */}
          <path
            d={`M 50 ${config.shoulderStartY} Q ${50 + config.headRx * 0.9} ${config.shoulderControlY}, ${config.shoulderEndX} ${config.shoulderEndY}`}
            fill="none"
            stroke="url(#guideGlow)"
            strokeWidth="0.65"
            strokeDasharray="2.5, 1.5"
            filter="url(#neonGlow)"
          />

          {/* Shoulder Silhouette Gradient Fill Area */}
          <path
            d={`M 50 ${config.shoulderStartY} 
                Q ${50 - config.headRx * 0.9} ${config.shoulderControlY}, ${100 - config.shoulderEndX} ${config.shoulderEndY} 
                L ${config.shoulderEndX} ${config.shoulderEndY} 
                Q ${50 + config.headRx * 0.9} ${config.shoulderControlY}, 50 ${config.shoulderStartY} Z`}
            fill="url(#shoulderGlow)"
            opacity="0.25"
          />
        </g>

        {/* 2. HEAD & FACE CIRCLE / OVAL GUIDE */}
        <g filter="url(#neonGlow)">
          {/* Outer Head Oval with Soft Pulsing Outline */}
          <ellipse
            cx="50"
            cy={config.headCy}
            rx={config.headRx}
            ry={config.headRy}
            fill="rgba(245, 158, 11, 0.03)"
            stroke="url(#guideGlow)"
            strokeWidth="0.8"
            strokeDasharray="3, 1.5"
            className={animated ? 'animate-pulse' : ''}
            style={{ animationDuration: '2.5s' }}
          />

          {/* Inner Alignment Ticks on Head Oval */}
          {/* Top Crown Tick */}
          <line
            x1="50"
            y1={config.headCy - config.headRy - 2}
            x2="50"
            y2={config.headCy - config.headRy + 2}
            stroke="#fbbf24"
            strokeWidth="0.7"
          />
          {/* Bottom Chin Tick */}
          <line
            x1="50"
            y1={config.headCy + config.headRy - 2}
            x2="50"
            y2={config.headCy + config.headRy + 2}
            stroke="#fbbf24"
            strokeWidth="0.7"
          />
          {/* Left Cheek Tick */}
          <line
            x1={50 - config.headRx - 2}
            y1={config.headCy}
            x2={50 - config.headRx + 2}
            y2={config.headCy}
            stroke="#fbbf24"
            strokeWidth="0.7"
          />
          {/* Right Cheek Tick */}
          <line
            x1={50 + config.headRx - 2}
            y1={config.headCy}
            x2={50 + config.headRx + 2}
            y2={config.headCy}
            stroke="#fbbf24"
            strokeWidth="0.7"
          />
        </g>

        {/* 3. EYE LEVEL HORIZONTAL GUIDELINE */}
        {showEyeLine && (
          <g>
            <line
              x1={50 - config.headRx * 0.8}
              y1={config.eyeY}
              x2={50 + config.headRx * 0.8}
              y2={config.eyeY}
              stroke="#38bdf8"
              strokeWidth="0.5"
              strokeDasharray="1.5, 1.5"
              opacity="0.85"
            />
            {/* Eye Crosshair Ticks */}
            <circle cx={50 - config.headRx * 0.4} cy={config.eyeY} r="0.8" fill="#38bdf8" />
            <circle cx={50 + config.headRx * 0.4} cy={config.eyeY} r="0.8" fill="#38bdf8" />
          </g>
        )}

        {/* Chin Level Arc */}
        <path
          d={`M ${50 - config.headRx * 0.45} ${config.headCy + config.headRy * 0.85} Q 50 ${config.headCy + config.headRy}, ${50 + config.headRx * 0.45} ${config.headCy + config.headRy * 0.85}`}
          fill="none"
          stroke="rgba(245, 158, 11, 0.6)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Floating Tactical Guide Labels */}
      <div className="absolute inset-x-0 top-3 flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-stone-950/80 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md border border-amber-500/30 shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Head & Shoulder Alignment Guide</span>
        </div>
      </div>

      {showEyeLine && (
        <div
          className="absolute text-[9px] font-bold tracking-wider text-sky-300/90 font-mono"
          style={{ top: `${config.eyeY - 2.5}%`, right: '12%' }}
        >
          ✦ EYE LEVEL
        </div>
      )}

      <div
        className="absolute text-[9px] font-medium tracking-wide text-amber-300/70 font-mono text-center w-full"
        style={{ bottom: '8%' }}
      >
        ALIGN SHOULDERS WITH ARCH
      </div>
    </div>
  );
};
