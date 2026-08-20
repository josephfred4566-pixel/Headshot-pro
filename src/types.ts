export type StyleCategory = 'all' | 'corporate' | 'tech' | 'outdoor' | 'creative' | 'executive';

export interface HeadshotStyle {
  id: string;
  name: string;
  category: StyleCategory;
  description: string;
  badge?: string;
  stylePrompt: string;
  backdropPrompt: string;
  lightingPrompt: string;
  attirePrompt: string;
  gradient: string;
  accentColor: string;
  icon: string;
}

export interface WardrobeOption {
  id: string;
  name: string;
  category: 'formal' | 'smart-casual' | 'casual' | 'creative';
  description: string;
  promptValue: string;
}

export interface LightingRig {
  id: string;
  name: string;
  description: string;
  promptValue: string;
  colorTemp: string;
}

export interface ExpressionPreset {
  id: string;
  name: string;
  description: string;
  promptValue: string;
}

export interface SampleSelfie {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female' | 'neutral';
  imageUrl: string;
  description: string;
}

export interface HeadshotCritique {
  score: number;
  grade: string;
  critique: {
    lighting: string;
    framing: string;
    wardrobe: string;
    expression: string;
  };
  recommendations: string[];
}

export type CropAspectRatio = 'original' | '1:1' | '3:4' | '4:5' | '16:9' | '3:2';

export interface CropSettings {
  aspectRatio: CropAspectRatio;
  zoom: number; // 1.0 (fit/default) to 2.5 (tight close-up)
  offsetX: number; // -50 to 50
  offsetY: number; // -50 to 50
}

export interface ImageAdjustments {
  exposure: number; // -50 to 50
  contrast: number; // -50 to 50
  warmth: number; // -50 to 50
  vignette: number; // 0 to 100
  sharpness: number; // 0 to 100
  backgroundBlur: number; // 0 to 100 (Aperture depth-of-field simulation from f/16 to f/1.2)
  skinEnhance?: boolean; // AI Enhance Skin: natural skin-smoothing & blemish softening mask
  crop?: CropSettings; // Cropping & Framing parameters
  isBlackAndWhite: boolean;
}

export interface QuickEditFilter {
  id: string;
  name: string;
  badge?: string;
  description: string;
  iconType: 'warm' | 'cool' | 'bw' | 'golden' | 'vivid' | 'moody' | 'neutral' | 'matte';
  previewGradient: string;
  adjustments: ImageAdjustments;
}

export interface PlatformExportPreset {
  id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'resume' | 'github' | 'general';
  name: string;
  subLabel: string;
  targetWidth: number;
  targetHeight: number;
  aspectRatioLabel: string;
  cropType: 'circle' | 'square' | 'portrait' | 'landscape';
  description: string;
  format: 'png' | 'jpeg';
  badge?: string;
  brandColor: string;
  bgGradient: string;
}

export interface HeadshotItem {

  id: string;
  originalImage: string;
  headshotUrl: string;
  styleId: string;
  styleName: string;
  wardrobe: string;
  lighting: string;
  expression: string;
  aspectRatio: '1:1' | '3:4' | '16:9';
  createdAt: string;
  critique?: HeadshotCritique;
  adjustments: ImageAdjustments;
  isFavorite?: boolean;
}
