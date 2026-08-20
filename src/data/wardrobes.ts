import { WardrobeOption, LightingRig, ExpressionPreset } from '../types';

export const WARDROBE_OPTIONS: WardrobeOption[] = [
  {
    id: 'navy-suit',
    name: 'Tailored Navy Suit & Shirt',
    category: 'formal',
    description: 'Crisp bespoke navy blue blazer with a pressed white collared dress shirt.',
    promptValue: 'fitted modern navy blue suit blazer with sharp lapels, crisp pressed white dress shirt, neat collar',
  },
  {
    id: 'charcoal-blazer-tshirt',
    name: 'Tech Blazer & Premium Crewneck',
    category: 'smart-casual',
    description: 'Modern structured charcoal blazer over a high-thread-count dark crewneck.',
    promptValue: 'tailored charcoal grey unstructured blazer over a minimalist dark crewneck shirt, clean modern tech aesthetic',
  },
  {
    id: 'silk-blouse-jacket',
    name: 'Executive Silk Blouse & Jacket',
    category: 'formal',
    description: 'Structured tailored jacket with a soft silk blouse underneath in jewel or neutral tones.',
    promptValue: 'structured executive blazer with elegant jewel-toned silk blouse, refined neckline, polished leadership look',
  },
  {
    id: 'oxford-buttondown',
    name: 'Crisp Oxford Button-Down',
    category: 'smart-casual',
    description: 'Timeless light blue or white oxford cotton button-down shirt with a natural roll collar.',
    promptValue: 'crisp light blue oxford cotton dress shirt with open top button, uncreased fabric, relaxed professional finish',
  },
  {
    id: 'merino-turtleneck',
    name: 'Architectural Merino Turtleneck',
    category: 'creative',
    description: 'Steve Jobs/Designer-inspired fitted black or charcoal fine-knit merino wool turtleneck.',
    promptValue: 'fitted fine-gauge black merino wool turtleneck sweater, sleek artistic silhouette, high fashion finish',
  },
  {
    id: 'keep-original-attire',
    name: 'Elevate Original Casual Clothes',
    category: 'casual',
    description: 'Keep the style of your original clothing but remove wrinkles, adjust fit, and upgrade fabric texture.',
    promptValue: 'original clothing upgraded to pristine wrinkle-free tailored condition with enhanced fabric drape',
  },
];

export const LIGHTING_OPTIONS: LightingRig[] = [
  {
    id: 'rembrandt-softbox',
    name: '3-Point Studio Rembrandt',
    description: 'Classic triangular cheek highlight, gentle fill, and subtle rim light for depth.',
    promptValue: 'flattering Rembrandt 3-point softbox studio lighting with distinct catchlights in the pupils',
    colorTemp: '5600K Daylight',
  },
  {
    id: 'beauty-dish-diffused',
    name: 'Soft Beauty Wrap (Zero Shadows)',
    description: 'Large diffused key light creating smooth skin tones and soft gentle contours.',
    promptValue: 'large diffused beauty dish key light offering even, ultra-flattering complexion illumination',
    colorTemp: '5400K Neutral',
  },
  {
    id: 'golden-rim',
    name: 'Golden Hour Cinematic Rim',
    description: 'Warm rim lighting on hair and shoulders with warm organic fill.',
    promptValue: 'cinematic golden hour warm backlight creating a luminous hair rim and sunlit glow',
    colorTemp: '3200K Golden Warm',
  },
  {
    id: 'editorial-split',
    name: 'High-Contrast Editorial Drama',
    description: 'Sculpted directional light with rich deep shadows and crisp edge separation.',
    promptValue: 'dramatic directional studio light with sculpted jawline definition and high dynamic range',
    colorTemp: '6000K Cool Studio',
  },
];

export const EXPRESSION_PRESETS: ExpressionPreset[] = [
  {
    id: 'warm-smile',
    name: 'Warm & Approachable Smile',
    description: 'Friendly genuine smile showing approachable warmth and enthusiasm.',
    promptValue: 'genuine, warm and approachable smile with crinkling around the eyes, engaging trustworthy expression',
  },
  {
    id: 'confident-executive',
    name: 'Confident & Visionary',
    description: 'Direct eye contact with a subtle, composed, reassuring half-smile.',
    promptValue: 'confident executive gaze, poised, direct eye contact with camera, subtle confident pleasant expression',
  },
  {
    id: 'relaxed-natural',
    name: 'Authentic & Relaxed',
    description: 'Natural resting pleasant expression, open and relatable.',
    promptValue: 'relaxed and natural expression, calm, serene, candid professional demeanor',
  },
];
