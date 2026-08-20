import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SelfieUploader } from './components/SelfieUploader';
import { StyleSelector } from './components/StyleSelector';
import { StudioControls } from './components/StudioControls';
import { GenerationProgress } from './components/GenerationProgress';
import { HeadshotViewer } from './components/HeadshotViewer';
import { HeadshotGallery } from './components/HeadshotGallery';
import { WebcamModal } from './components/WebcamModal';
import { HEADSHOT_STYLES } from './data/styles';
import { WARDROBE_OPTIONS, LIGHTING_OPTIONS, EXPRESSION_PRESETS } from './data/wardrobes';
import {
  HeadshotStyle,
  WardrobeOption,
  LightingRig,
  ExpressionPreset,
  HeadshotItem,
  ImageAdjustments,
} from './types';
import { generateStudioSimulationHeadshot } from './utils/portraitCanvas';

export default function App() {
  const [currentSelfie, setCurrentSelfie] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle>(HEADSHOT_STYLES[0]);
  const [selectedWardrobe, setSelectedWardrobe] = useState<WardrobeOption>(WARDROBE_OPTIONS[0]);
  const [selectedLighting, setSelectedLighting] = useState<LightingRig>(LIGHTING_OPTIONS[0]);
  const [selectedExpression, setSelectedExpression] = useState<ExpressionPreset>(EXPRESSION_PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '16:9'>('1:1');
  const [customNotes, setCustomNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState<'studio' | 'generating' | 'result'>('studio');
  const [currentItem, setCurrentItem] = useState<HeadshotItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<HeadshotItem[]>([]);

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Load stored gallery on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_headshot_gallery');
      if (stored) {
        setGalleryItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load gallery from localStorage:', e);
    }
  }, []);

  // Save gallery on updates
  const saveGallery = (newItems: HeadshotItem[]) => {
    setGalleryItems(newItems);
    try {
      localStorage.setItem('ai_headshot_gallery', JSON.stringify(newItems));
    } catch (e) {
      console.warn('Could not save gallery to localStorage:', e);
    }
  };

  const handleGenerateHeadshot = async () => {
    if (!currentSelfie) return;

    setIsGenerating(true);
    setActiveStep('generating');

    try {
      const response = await fetch('/api/generate-headshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentSelfie,
          styleId: selectedStyle.id,
          styleName: selectedStyle.name,
          stylePrompt: selectedStyle.stylePrompt,
          backdropPrompt: selectedStyle.backdropPrompt,
          wardrobe: selectedWardrobe.promptValue,
          lighting: selectedLighting.promptValue,
          expression: selectedExpression.promptValue,
          aspectRatio,
          enhancementNotes: customNotes,
        }),
      });

      const data = await response.json();
      let finalHeadshotUrl = data.headshotUrl;

      if (!finalHeadshotUrl) {
        // Fallback simulation generator with photographic processing
        finalHeadshotUrl = await generateStudioSimulationHeadshot(
          currentSelfie,
          selectedStyle,
          aspectRatio
        );
      }

      // Fetch AI Critique & LinkedIn audit
      let critiqueData = undefined;
      try {
        const critiqueRes = await fetch('/api/critique-headshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: finalHeadshotUrl,
            styleName: selectedStyle.name,
          }),
        });
        critiqueData = await critiqueRes.json();
      } catch (err) {
        console.warn('Critique endpoint error:', err);
      }

      const defaultAdjustments: ImageAdjustments = {
        exposure: 0,
        contrast: 0,
        warmth: 0,
        vignette: selectedStyle.id === 'creative-monochrome' ? 25 : 10,
        sharpness: 0,
        backgroundBlur: 0,
        skinEnhance: false,
        isBlackAndWhite: selectedStyle.id === 'creative-monochrome',
      };

      const newItem: HeadshotItem = {
        id: `hs-${Date.now()}`,
        originalImage: currentSelfie,
        headshotUrl: finalHeadshotUrl,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        wardrobe: selectedWardrobe.name,
        lighting: selectedLighting.name,
        expression: selectedExpression.name,
        aspectRatio,
        createdAt: new Date().toISOString(),
        critique: critiqueData,
        adjustments: defaultAdjustments,
        isFavorite: false,
      };

      setCurrentItem(newItem);
      const updatedGallery = [newItem, ...galleryItems];
      saveGallery(updatedGallery);
      setActiveStep('result');
    } catch (err) {
      console.error('Error generating headshot:', err);
      // Fallback in case of unexpected failure
      const fallbackUrl = await generateStudioSimulationHeadshot(
        currentSelfie,
        selectedStyle,
        aspectRatio
      );

      const newItem: HeadshotItem = {
        id: `hs-${Date.now()}`,
        originalImage: currentSelfie,
        headshotUrl: fallbackUrl,
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        wardrobe: selectedWardrobe.name,
        lighting: selectedLighting.name,
        expression: selectedExpression.name,
        aspectRatio,
        createdAt: new Date().toISOString(),
        adjustments: {
          exposure: 0,
          contrast: 0,
          warmth: 0,
          vignette: 10,
          sharpness: 0,
          backgroundBlur: 0,
          skinEnhance: false,
          isBlackAndWhite: false,
        },
      };

      setCurrentItem(newItem);
      saveGallery([newItem, ...galleryItems]);
      setActiveStep('result');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateAdjustments = (adj: ImageAdjustments) => {
    if (!currentItem) return;
    const updatedItem = { ...currentItem, adjustments: adj };
    setCurrentItem(updatedItem);
    const updatedList = galleryItems.map((item) =>
      item.id === currentItem.id ? updatedItem : item
    );
    saveGallery(updatedList);
  };

  const handleToggleFavorite = (id: string) => {
    const updatedList = galleryItems.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveGallery(updatedList);
    if (currentItem && currentItem.id === id) {
      setCurrentItem({ ...currentItem, isFavorite: !currentItem.isFavorite });
    }
  };

  const handleDeleteItem = (id: string) => {
    const updatedList = galleryItems.filter((item) => item.id !== id);
    saveGallery(updatedList);
    if (currentItem && currentItem.id === id) {
      if (updatedList.length > 0) {
        setCurrentItem(updatedList[0]);
      } else {
        setCurrentItem(null);
        setActiveStep('studio');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      {/* Studio Header */}
      <Header
        galleryCount={galleryItems.length}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onNewSession={() => {
          setActiveStep('studio');
        }}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Step 1 & 2: Studio Setup Screen */}
        {activeStep === 'studio' && (
          <div className="space-y-6">
            {/* Top Intro Section */}
            <div className="rounded-2xl border border-stone-800 bg-gradient-to-b from-stone-900 via-stone-900/80 to-stone-950 p-6 sm:p-8">
              <div className="max-w-3xl">
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
                  AI Commercial Portrait Photography
                </span>
                <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-stone-100 sm:text-3xl lg:text-4xl">
                  Transform Any Casual Selfie into a Professional Executive Headshot
                </h1>
                <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                  Upload a casual snapshot, choose your backdrop aesthetic (Corporate Grey, Modern Tech Office, or Outdoor Natural Light), and our studio AI generates flawless high-resolution portraits with 85mm prime depth of field.
                </p>
              </div>
            </div>

            {/* Step 1: Upload Selfie */}
            <SelfieUploader
              currentImage={currentSelfie}
              onImageSelected={(dataUrl) => setCurrentSelfie(dataUrl)}
              onClearImage={() => setCurrentSelfie(null)}
              onOpenWebcam={() => setIsWebcamOpen(true)}
            />

            {/* Step 2: Choose Style */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onSelectStyle={(style) => setSelectedStyle(style)}
            />

            {/* Step 3: Wardrobe & Lighting Controls */}
            <StudioControls
              selectedWardrobe={selectedWardrobe}
              onSelectWardrobe={(w) => setSelectedWardrobe(w)}
              selectedLighting={selectedLighting}
              onSelectLighting={(l) => setSelectedLighting(l)}
              selectedExpression={selectedExpression}
              onSelectExpression={(e) => setSelectedExpression(e)}
              aspectRatio={aspectRatio}
              onSelectAspectRatio={(ar) => setAspectRatio(ar)}
              customNotes={customNotes}
              onChangeCustomNotes={(notes) => setCustomNotes(notes)}
              onGenerate={handleGenerateHeadshot}
              isGenerating={isGenerating}
              hasImage={Boolean(currentSelfie)}
            />
          </div>
        )}

        {/* Step: Generating in Progress */}
        {activeStep === 'generating' && (
          <div className="mx-auto max-w-2xl py-8">
            <GenerationProgress styleName={selectedStyle.name} />
          </div>
        )}

        {/* Step 3: Result Showcase Screen */}
        {activeStep === 'result' && currentItem && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveStep('studio')}
                className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-amber-400 transition-colors"
              >
                ← Back to Studio Controls
              </button>
            </div>

            <HeadshotViewer
              item={currentItem}
              onUpdateAdjustments={handleUpdateAdjustments}
              onToggleFavorite={handleToggleFavorite}
              onGenerateAnother={() => setActiveStep('studio')}
            />
          </div>
        )}
      </main>

      {/* Webcam Photo Booth Modal */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(dataUrl) => {
          setCurrentSelfie(dataUrl);
          setIsWebcamOpen(false);
        }}
      />

      {/* History & Gallery Drawer Modal */}
      <HeadshotGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={galleryItems}
        onSelectItem={(item) => {
          setCurrentItem(item);
          setActiveStep('result');
        }}
        onDeleteItem={handleDeleteItem}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
