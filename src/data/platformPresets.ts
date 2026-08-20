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

export const PLATFORM_EXPORT_PRESETS: PlatformExportPreset[] = [
  {
    id: 'linkedin-profile-hd',
    platform: 'linkedin',
    name: 'LinkedIn Profile Picture',
    subLabel: '800 × 800 px · 1:1 Square',
    targetWidth: 800,
    targetHeight: 800,
    aspectRatioLabel: '1:1 Square',
    cropType: 'circle',
    description: 'Optimized for high-DPI retina screens with circular crop safety margins.',
    format: 'jpeg',
    badge: 'Recommended',
    brandColor: '#0a66c2',
    bgGradient: 'from-sky-600 to-blue-700',
  },
  {
    id: 'twitter-profile-hd',
    platform: 'twitter',
    name: 'Twitter / X Profile Avatar',
    subLabel: '400 × 400 px (Hi-Res 800px) · 1:1',
    targetWidth: 800,
    targetHeight: 800,
    aspectRatioLabel: '1:1 Square',
    cropType: 'circle',
    description: 'Clean circular framing centered for dark and light timeline avatars.',
    format: 'png',
    badge: 'Popular',
    brandColor: '#1d9bf0',
    bgGradient: 'from-stone-800 to-stone-950',
  },
  {
    id: 'instagram-profile-hd',
    platform: 'instagram',
    name: 'Instagram Profile Photo',
    subLabel: '1080 × 1080 px · 1:1 Square',
    targetWidth: 1080,
    targetHeight: 1080,
    aspectRatioLabel: '1:1 Square',
    cropType: 'circle',
    description: 'Ultra-crisp 1080px resolution for mobile feed profile circles.',
    format: 'jpeg',
    badge: 'HQ',
    brandColor: '#e1306c',
    bgGradient: 'from-purple-600 via-rose-500 to-amber-500',
  },
  {
    id: 'instagram-portrait-post',
    platform: 'instagram',
    name: 'Instagram Portrait Feed Post',
    subLabel: '1080 × 1350 px · 4:5 Vertical',
    targetWidth: 1080,
    targetHeight: 1350,
    aspectRatioLabel: '4:5 Portrait',
    cropType: 'portrait',
    description: 'Maximizes vertical feed real estate for announcement and bio posts.',
    format: 'jpeg',
    badge: '4:5',
    brandColor: '#c13584',
    bgGradient: 'from-rose-500 to-purple-600',
  },
  {
    id: 'resume-print-master',
    platform: 'resume',
    name: 'Resume & Executive Bio',
    subLabel: '1200 × 1600 px · 3:4 Portrait',
    targetWidth: 1200,
    targetHeight: 1600,
    aspectRatioLabel: '3:4 Portrait',
    cropType: 'portrait',
    description: 'Standard 3:4 proportion tailored for PDF resumes, speaker cards, and press kits.',
    format: 'png',
    badge: 'Print 300DPI',
    brandColor: '#10b981',
    bgGradient: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'github-discord-avatar',
    platform: 'github',
    name: 'GitHub & Discord Developer Avatar',
    subLabel: '500 × 500 px · 1:1 Square',
    targetWidth: 500,
    targetHeight: 500,
    aspectRatioLabel: '1:1 Square',
    cropType: 'circle',
    description: 'High-contrast profile crop for developer portfolios, repos, and Discord servers.',
    format: 'png',
    badge: 'Dev',
    brandColor: '#6e5494',
    bgGradient: 'from-purple-700 to-stone-900',
  },
];
