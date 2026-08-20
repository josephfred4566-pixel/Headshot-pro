import React from 'react';

interface AppLogoProps {
  variant?: 'full' | 'horizontal' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const AppLogoMark: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-10 h-10',
  size = 40,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 160"
      width={size}
      height={(size * 2) / 3}
      className={className}
      fill="none"
    >
      <defs>
        <radialGradient id="apertureGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFA000" stopOpacity="1" />
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="1" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="bracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* 4 Viewfinder Corner Brackets */}
      {/* Top-Left Corner */}
      <path
        d="M 28 42 L 28 22 L 48 22"
        stroke="url(#bracketGrad)"
        strokeWidth="6"
        strokeLinecap="square"
      />
      {/* Top-Right Corner */}
      <path
        d="M 212 42 L 212 22 L 192 22"
        stroke="url(#bracketGrad)"
        strokeWidth="6"
        strokeLinecap="square"
      />
      {/* Bottom-Left Corner */}
      <path
        d="M 28 118 L 28 138 L 48 138"
        stroke="url(#bracketGrad)"
        strokeWidth="6"
        strokeLinecap="square"
      />
      {/* Bottom-Right Corner */}
      <path
        d="M 212 118 L 212 138 L 192 138"
        stroke="url(#bracketGrad)"
        strokeWidth="6"
        strokeLinecap="square"
      />

      {/* Outer Stylized Eye Outline */}
      <path
        d="M 32 80 C 65 34 175 34 208 80 C 175 126 65 126 32 80 Z"
        stroke="#F59E0B"
        strokeWidth="5.5"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Shutter / Iris Outer Circle */}
      <circle
        cx="120"
        cy="80"
        r="38"
        fill="#141414"
        stroke="#F59E0B"
        strokeWidth="4"
      />

      {/* Iris Diaphragm Shutter Blades (Aperture Iris) */}
      <g stroke="#141414" strokeWidth="2.2" strokeLinejoin="round">
        {/* Blade 1 */}
        <path
          d="M 120 44 C 132 44 148 54 154 66 L 129 73 Z"
          fill="url(#apertureGlow)"
        />
        {/* Blade 2 */}
        <path
          d="M 154 66 C 158 76 156 94 148 106 L 129 88 Z"
          fill="url(#apertureGlow)"
        />
        {/* Blade 3 */}
        <path
          d="M 148 106 C 138 114 122 116 110 114 L 119 90 Z"
          fill="url(#apertureGlow)"
        />
        {/* Blade 4 */}
        <path
          d="M 110 114 C 98 112 88 102 86 92 L 110 86 Z"
          fill="url(#apertureGlow)"
        />
        {/* Blade 5 */}
        <path
          d="M 86 92 C 84 80 88 64 96 54 L 112 72 Z"
          fill="url(#apertureGlow)"
        />
        {/* Blade 6 */}
        <path
          d="M 96 54 C 104 46 114 44 120 44 L 122 70 Z"
          fill="url(#apertureGlow)"
        />
      </g>

      {/* Center Hexagonal Dark Aperture Hole */}
      <polygon
        points="120,70 129,75 129,85 120,90 111,85 111,75"
        fill="#121212"
        stroke="#F59E0B"
        strokeWidth="1.5"
      />

      {/* Subtle Inner Catchlight Reflection */}
      <circle cx="116" cy="76" r="2" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      case 'md':
      default:
        return 44;
    }
  };

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <AppLogoMark size={getIconSize()} />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative mb-2">
          <AppLogoMark size={getIconSize() * 1.5} />
        </div>
        <div className="tracking-[0.22em] font-sans font-bold text-amber-400 text-sm sm:text-base uppercase">
          HEADSHOT PHOTOGRAPHER
        </div>
        {showSubtitle && (
          <div className="tracking-[0.3em] font-sans font-medium text-stone-400 text-[10px] sm:text-[11px] uppercase mt-0.5">
            photography studio
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (Ideal for Headers / Navbars)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0">
        <AppLogoMark size={getIconSize()} />
      </div>
      <div className="flex flex-col">
        <span className="font-sans font-extrabold text-stone-100 tracking-[0.15em] text-sm sm:text-base uppercase leading-tight group-hover:text-amber-400 transition-colors">
          HEADSHOT PHOTOGRAPHER
        </span>
        {showSubtitle && (
          <span className="font-sans font-medium text-stone-400 tracking-[0.25em] text-[9px] sm:text-[10px] uppercase">
            photography studio
          </span>
        )}
      </div>
    </div>
  );
};
