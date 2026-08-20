import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  MessageSquare,
  Globe,
  Smartphone,
  Layers,
  Award,
  Hash,
  Send,
} from 'lucide-react';
import { HeadshotItem } from '../types';
import { exportAdjustedHeadshot, exportPlatformHeadshot } from '../utils/portraitCanvas';
import { PLATFORM_EXPORT_PRESETS } from '../data/platformPresets';

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'threads' | 'instagram';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HeadshotItem;
  imageFilterStyle?: string;
  initialPlatform?: SocialPlatform;
}

interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  shortName: string;
  brandColor: string;
  brandBg: string;
  iconText: string;
  charLimit?: number;
  tagline: string;
  hashtags: string[];
  templates: {
    title: string;
    description: string;
    text: (item: HeadshotItem) => string;
  }[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'in',
    brandColor: '#0a66c2',
    brandBg: 'bg-[#0a66c2]',
    iconText: 'in',
    charLimit: 3000,
    tagline: 'Professional Leadership & Career Update',
    hashtags: ['#ProfessionalHeadshot', '#ExecutivePresence', '#CareerGrowth', '#Leadership', '#PersonalBranding'],
    templates: [
      {
        title: 'Executive Milestone',
        description: 'Polished leadership & portfolio update for corporate networks',
        text: (item) =>
          `Excited to share my updated executive portrait produced with studio-grade 85mm optical rendering.

📸 Style: ${item.styleName} Studio Headshot
👔 Attire: ${item.wardrobe}
💡 Lighting: ${item.lighting}
${item.critique ? `⭐ Audit Score: ${item.critique.score}/100 (${item.critique.grade} rating)` : ''}

Refreshed and ready for upcoming keynotes, advisory engagements, and board profiles.

#PersonalBranding #ExecutiveLeadership #ProfessionalHeadshot #CareerGrowth #TechLeadership`,
      },
      {
        title: 'New Profile Photo Announcement',
        description: 'Friendly career update to announce your fresh look',
        text: (item) =>
          `Time for a profile picture refresh! 📸✨

Just upgraded my professional portrait to the ${item.styleName} look. Clean, sharp, and authentic lighting for 2026.

What do you think of this aesthetic for speaking bios and executive profiles?

#NewProfilePic #ProfessionalHeadshots #Networking #CareerDevelopment`,
      },
      {
        title: 'Tech & Modern Founder',
        description: 'Modern, concise update tailored for founders & engineers',
        text: (item) =>
          `Upgraded my digital presence with an 85mm studio portrait in ${item.styleName} aesthetic. 

High-definition visual identity crafted for conference decks, contributor bios, and leadership portfolios.

#FounderLife #TechLeadership #ExecutivePresence #AIStudio`,
      },
    ],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    shortName: '𝕏',
    brandColor: '#000000',
    brandBg: 'bg-black',
    iconText: '𝕏',
    charLimit: 280,
    tagline: 'Punchy timeline post with hashtags',
    hashtags: ['#AIHeadshot', '#ExecutiveStyle', '#TechLead', '#BuildInPublic'],
    templates: [
      {
        title: 'Punchy & Modern',
        description: 'Fits within the standard 280 character limit',
        text: (item) =>
          `Refreshed my headshot with crisp 85mm studio optics in "${item.styleName}" aesthetic. 📸✨

Calibrated for timeline clarity and conference bios.

#AIHeadshot #PersonalBranding #TechLead`,
      },
      {
        title: 'Milestone / Profile Pic',
        description: 'Quick announcement of your new avatar',
        text: (item) =>
          `New profile picture drop. 🎯

Upgraded with ${item.styleName} lighting & tailored ${item.wardrobe}.

#NewProfilePic #ExecutivePresence #Headshot`,
      },
      {
        title: 'Studio Quality Audit',
        description: 'Highlighting optical quality and score',
        text: (item) =>
          `New headshot unlocked: ${item.styleName} aesthetic with specular eye catchlights ${item.critique ? `(${item.critique.score}/100 score)` : ''}. 

85mm portrait simulation ready for 2026. #AIStudio #Headshot`,
      },
    ],
  },
  {
    id: 'threads',
    name: 'Threads',
    shortName: 'Threads',
    brandColor: '#101010',
    brandBg: 'bg-stone-900',
    iconText: '@',
    charLimit: 500,
    tagline: 'Conversational & authentic community update',
    hashtags: ['#headshots', '#portrait', '#career', '#photography'],
    templates: [
      {
        title: 'Conversational Update',
        description: 'Relaxed and engaging community tone',
        text: (item) =>
          `Finally updated my headshot! 📸 

Went with the "${item.styleName}" style featuring ${item.lighting.toLowerCase()} and ${item.wardrobe.toLowerCase()}. 

I love how the 85mm optical rendering brings out warm catchlights without feeling overly staged. How often do you refresh your professional photos?`,
      },
      {
        title: 'Aesthetic Showcase',
        description: 'Focus on color grade and portrait styling',
        text: (item) =>
          `Fresh portrait series in ${item.styleName} tone. 

Dialed in with high dynamic range, crisp depth-of-field, and executive styling. Ready for the next chapter. 💼✨ #career #portraits #branding`,
      },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'FB',
    brandColor: '#1877f2',
    brandBg: 'bg-[#1877f2]',
    iconText: 'f',
    charLimit: 2000,
    tagline: 'Connect with colleagues, friends & alumni',
    hashtags: ['#NewProfilePic', '#ProfessionalHeadshot', '#CareerMilestone', '#PersonalBranding'],
    templates: [
      {
        title: 'Friends & Colleagues Update',
        description: 'Warm and personal milestone announcement',
        text: (item) =>
          `Excited to share my updated professional headshot! 📸✨\n\nI recently refreshed my portrait using the "${item.styleName}" style featuring ${item.lighting.toLowerCase()} and ${item.wardrobe.toLowerCase()}.\n\nLooking forward to connecting with everyone as we kick off new projects this season. Hope everyone is having a wonderful week!\n\n#NewProfilePic #ProfessionalHeadshot #CareerMilestone`,
      },
      {
        title: 'Career & Profile Refresh',
        description: 'Focused on career transition or speaking engagements',
        text: (item) =>
          `New profile photo for upcoming conferences, articles, and work portfolio! 💼🌟\n\nDelighted with how this ${item.styleName} headshot turned out with natural studio lighting. Connecting my portfolio and profile across platforms.\n\nHave a great day everyone!\n\n#Professional #ExecutivePresence #PersonalBrand`,
      },
      {
        title: 'Executive & Portfolio Showcase',
        description: 'Polished executive announcement with styling breakdown',
        text: (item) =>
          `Just updated my professional headshot! 👔✨\n\nStyle: ${item.styleName}\nLighting: ${item.lighting}\nWardrobe: ${item.wardrobe}\n\nFeeling energized for the upcoming quarter and ready for new collaborations! 🚀\n\n#NewProfilePic #Leadership #StudioPortrait`,
      },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'IG',
    brandColor: '#e1306c',
    brandBg: 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600',
    iconText: 'IG',
    charLimit: 2200,
    tagline: 'Caption bundle + 1-click formatted photo export',
    hashtags: [
      '#portraitphotography',
      '#executiveportrait',
      '#headshots',
      '#studiolighting',
      '#corporateheadshot',
      '#professionalstyle',
      '#85mmphotography',
      '#personalbrand',
      '#portraitpage',
      '#aesthetic',
    ],
    templates: [
      {
        title: 'Full Feed Caption & Tags',
        description: 'Complete with curated aesthetic & photography hashtags',
        text: (item) =>
          `New visual identity. 📸✨

Style: ${item.styleName}
Wardrobe: ${item.wardrobe}
Optics: 85mm Portrait Prime • Studio Key Light
${item.critique ? `Audit Grade: ${item.critique.grade} (${item.critique.score}/100)` : ''}

Swipe for details on composition & lighting. 

.
.
#portraitphotography #headshots #executiveportrait #corporateheadshot #professionalstyle #85mmphotography #personalbrand #portraitpage #leadership #studiophotography`,
      },
      {
        title: 'Story / Carousel Caption',
        description: 'Short & punchy with key tags',
        text: (item) =>
          `Executive series ‘26. Captured in ${item.styleName} aesthetic. 

Lighting: ${item.lighting}
Attire: ${item.wardrobe}

#headshot #portraits #executivepresence #aesthetic #portraitmood`,
      },
    ],
  },
];

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
  imageFilterStyle,
  initialPlatform,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(initialPlatform || 'linkedin');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isDownloadingPreset, setIsDownloadingPreset] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // When modal opens with an initial platform, switch to it
  React.useEffect(() => {
    if (isOpen && initialPlatform) {
      setSelectedPlatform(initialPlatform);
      setSelectedTemplateIndex(0);
    }
  }, [isOpen, initialPlatform]);

  const activeConfig = useMemo(
    () => PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0],
    [selectedPlatform]
  );

  // Initialize or update message when platform or template changes
  React.useEffect(() => {
    if (activeConfig.templates[selectedTemplateIndex]) {
      setCustomMessage(activeConfig.templates[selectedTemplateIndex].text(item));
    } else {
      setCustomMessage(activeConfig.templates[0].text(item));
      setSelectedTemplateIndex(0);
    }
  }, [selectedPlatform, selectedTemplateIndex, item]);

  if (!isOpen) return null;

  const currentAppUrl = window.location.href;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentAppUrl);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.styleName} Professional Headshot`,
          text: customMessage,
          url: currentAppUrl,
        });
      } catch (err) {
        console.log('Native share canceled or failed:', err);
      }
    } else {
      handleCopyMessage();
    }
  };

  const handleOpenPlatformComposer = () => {
    const encodedText = encodeURIComponent(customMessage);
    const encodedUrl = encodeURIComponent(currentAppUrl);

    let shareUrl = '';

    switch (selectedPlatform) {
      case 'linkedin':
        // LinkedIn Web sharing endpoint
        shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
        break;
      case 'twitter':
        // X (Twitter) Web intent
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        // Facebook sharer
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'threads':
        // Threads intent
        shareUrl = `https://threads.net/intent/post?text=${encodedText}`;
        break;
      case 'instagram':
        // Instagram does not support direct query text sharing, open web app or copy kit
        shareUrl = 'https://www.instagram.com/';
        break;
      default:
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=650,height=600');
  };

  const handleDownloadPlatformPhoto = async () => {
    setIsDownloadingPreset(true);
    try {
      let targetPreset = PLATFORM_EXPORT_PRESETS.find(
        (p) => p.platform === selectedPlatform
      );

      if (!targetPreset) {
        targetPreset = PLATFORM_EXPORT_PRESETS[0];
      }

      const exportUrl = await exportPlatformHeadshot(
        item.headshotUrl,
        item.adjustments,
        targetPreset.targetWidth,
        targetPreset.targetHeight,
        targetPreset.format
      );

      const ext = targetPreset.format === 'jpeg' ? 'jpg' : 'png';
      const filename = `headshot-${selectedPlatform}-${targetPreset.targetWidth}x${targetPreset.targetHeight}-${Date.now()}.${ext}`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = exportUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccessToast(
        `Downloaded ${targetPreset.name} (${targetPreset.targetWidth} × ${targetPreset.targetHeight} px)`
      );
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to download platform photo:', err);
    } finally {
      setIsDownloadingPreset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                <span>Share Headshot</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  Pre-Formatted Posts
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Tailored announcements, hashtags, and cropped visual cards for your favorite networks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
            title="Close Share Hub"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Platform Selector Bar */}
        <div className="border-b border-stone-800/80 bg-stone-900/40 p-3 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {PLATFORMS.map((platform) => {
              const active = platform.id === selectedPlatform;
              return (
                <button
                  key={platform.id}
                  id={`share-tab-${platform.id}`}
                  onClick={() => {
                    setSelectedPlatform(platform.id);
                    setSelectedTemplateIndex(0);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shrink-0 ${
                    active
                      ? 'border border-amber-500/50 bg-stone-850 text-white shadow-md ring-1 ring-amber-500/20'
                      : 'border border-stone-800 bg-stone-950/80 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white shadow-sm ${platform.brandBg}`}
                  >
                    {platform.iconText}
                  </div>
                  <span>{platform.name}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Platform Live Preview Card */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Live Post Preview ({activeConfig.name})
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {activeConfig.tagline}
              </span>
            </div>

            {/* Platform Mockup Container */}
            {selectedPlatform === 'linkedin' && (
              <div className="rounded-2xl border border-stone-700 bg-stone-900/95 p-4 shadow-xl text-stone-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-stone-700 bg-stone-800 shrink-0">
                    <img
                      src={item.headshotUrl}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      style={{ filter: imageFilterStyle }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Your Name</span>
                      <span className="text-[10px] text-stone-400">• 1st</span>
                    </div>
                    <p className="text-[10px] text-stone-400 truncate">Executive & Advisory • AI & Tech Leadership</p>
                    <p className="text-[9px] text-stone-500">Just now • 🌐</p>
                  </div>
                </div>

                <p className="text-xs text-stone-200 line-clamp-4 whitespace-pre-line leading-relaxed font-sans">
                  {customMessage}
                </p>

                {/* Attached Image Card */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
                  <img
                    src={item.headshotUrl}
                    alt="Shared Headshot"
                    referrerPolicy="no-referrer"
                    style={{ filter: imageFilterStyle }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 rounded-lg bg-stone-950/80 px-2 py-1 text-[10px] font-semibold text-amber-300 backdrop-blur-md border border-amber-500/30">
                    {item.styleName} · 85mm Optical
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-800 pt-2 text-[11px] text-stone-400 font-medium">
                  <span>👍 84</span>
                  <span>💬 12 comments</span>
                </div>
              </div>
            )}

            {selectedPlatform === 'twitter' && (
              <div className="rounded-2xl border border-stone-800 bg-black p-4 shadow-xl text-stone-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-stone-800 bg-stone-900 shrink-0">
                    <img
                      src={item.headshotUrl}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      style={{ filter: imageFilterStyle }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">Alex Taylor</span>
                      <span className="text-sky-400 text-xs">☑</span>
                      <span className="text-xs text-stone-500">@alex_taylor · 1m</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                      {customMessage}
                    </p>

                    <div className="mt-3 relative aspect-square w-full overflow-hidden rounded-2xl border border-stone-800 bg-stone-950">
                      <img
                        src={item.headshotUrl}
                        alt="Shared Headshot"
                        referrerPolicy="no-referrer"
                        style={{ filter: imageFilterStyle }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPlatform === 'facebook' && (
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 shadow-xl text-stone-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-stone-700 bg-stone-800 shrink-0">
                    <img
                      src={item.headshotUrl}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      style={{ filter: imageFilterStyle }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Alex Taylor</span>
                    <p className="text-[10px] text-stone-400">Updated profile picture • 👥</p>
                  </div>
                </div>

                <p className="text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                  {customMessage}
                </p>

                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
                  <img
                    src={item.headshotUrl}
                    alt="Shared Headshot"
                    referrerPolicy="no-referrer"
                    style={{ filter: imageFilterStyle }}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {selectedPlatform === 'threads' && (
              <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 shadow-xl text-stone-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-stone-800 bg-stone-900 shrink-0">
                    <img
                      src={item.headshotUrl}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      style={{ filter: imageFilterStyle }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">alex.taylor</span>
                      <span className="text-xs text-stone-500">2m</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-200 whitespace-pre-line leading-relaxed">
                      {customMessage}
                    </p>
                    <div className="mt-3 relative aspect-square w-full overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
                      <img
                        src={item.headshotUrl}
                        alt="Shared Headshot"
                        referrerPolicy="no-referrer"
                        style={{ filter: imageFilterStyle }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPlatform === 'instagram' && (
              <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 shadow-xl text-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full overflow-hidden border border-stone-700">
                      <img
                        src={item.headshotUrl}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-white">alex.taylor.studio</span>
                  </div>
                  <span className="text-xs text-stone-500 font-bold">•••</span>
                </div>

                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-stone-800 bg-stone-900">
                  <img
                    src={item.headshotUrl}
                    alt="Shared Headshot"
                    referrerPolicy="no-referrer"
                    style={{ filter: imageFilterStyle }}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 right-2 rounded-full bg-stone-950/70 px-2 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur-md">
                    1:1 Square
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-stone-300">
                    <strong className="text-white mr-1.5">alex.taylor.studio</strong>
                    <span className="whitespace-pre-line">{customMessage.split('\n')[0]}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Quick Export Photo Button for Platform */}
            <div className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/60 p-3">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <Download className="h-4 w-4 text-amber-400" />
                <span>Need image file for manual upload?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadPlatformPhoto}
                disabled={isDownloadingPreset}
                className="flex items-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:border-amber-500 hover:text-amber-300 transition-all disabled:opacity-50"
              >
                <span>{isDownloadingPreset ? 'Saving...' : 'Save Cropped Image'}</span>
              </button>
            </div>
            {downloadSuccessToast && (
              <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>{downloadSuccessToast}</span>
              </div>
            )}
          </div>

          {/* Right Column: Pre-formatted Message Selector & Custom Editor */}
          <div className="space-y-4 lg:col-span-7">
            {/* Tone / Template Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center justify-between">
                <span>Select Pre-Formatted Post Template</span>
                <span className="text-[10px] text-amber-400 font-normal">
                  {activeConfig.templates.length} templates available
                </span>
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeConfig.templates.map((tpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTemplateIndex(idx)}
                    className={`rounded-xl p-3 text-left transition-all border ${
                      selectedTemplateIndex === idx
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-stone-800 bg-stone-900/80 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-100">
                        {tpl.title}
                      </span>
                      {selectedTemplateIndex === idx && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Post Composer Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                  <span>Customize Post Caption & Text</span>
                </label>
                {activeConfig.charLimit && (
                  <span
                    className={`text-[10px] font-mono ${
                      customMessage.length > activeConfig.charLimit
                        ? 'text-rose-400 font-bold'
                        : 'text-stone-500'
                    }`}
                  >
                    {customMessage.length} / {activeConfig.charLimit} chars
                  </span>
                )}
              </div>

              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={7}
                className="w-full rounded-xl border border-stone-800 bg-stone-900 p-3.5 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
                placeholder="Write your post caption..."
              />
            </div>

            {/* Hashtag Quick Cloud */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400 mb-2">
                <Hash className="h-3.5 w-3.5 text-amber-400" />
                <span>Suggested Hashtags for {activeConfig.name}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeConfig.hashtags.map((tag) => {
                  const isIncluded = customMessage.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!isIncluded) {
                          setCustomMessage((prev) => `${prev.trim()}\n${tag}`);
                        }
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all ${
                        isIncluded
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-stone-900 text-stone-400 border border-stone-800 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {tag} {isIncluded ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-stone-800 pt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Primary Direct Share Button */}
                <button
                  id="btn-direct-platform-share"
                  onClick={handleOpenPlatformComposer}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
                    selectedPlatform === 'linkedin' ? 'bg-[#0a66c2] hover:bg-[#004182]' :
                    selectedPlatform === 'twitter' ? 'bg-black border border-stone-700 hover:bg-stone-900' :
                    selectedPlatform === 'facebook' ? 'bg-[#1877f2] hover:bg-[#0e5fc2]' :
                    selectedPlatform === 'threads' ? 'bg-stone-900 border border-stone-700 hover:bg-stone-800' :
                    'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:brightness-110'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {selectedPlatform === 'instagram'
                      ? 'Open Instagram Web App'
                      : `Open & Share on ${activeConfig.name}`}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </button>

                {/* 2. Copy Message */}
                <button
                  id="btn-copy-share-caption"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-xs font-semibold text-stone-200 transition-all hover:border-amber-500 hover:text-white active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-amber-400" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Utility Links */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-stone-400 hover:text-amber-300 transition-colors"
                >
                  {isLinkCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Globe className="h-3.5 w-3.5" />}
                  <span>{isLinkCopied ? 'App Link Copied!' : 'Copy Studio Web Link'}</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Mobile Native Share Menu</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
