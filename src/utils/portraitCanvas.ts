import { ImageAdjustments, HeadshotStyle, CropSettings } from '../types';

/**
 * Computes source bounding crop rectangle based on aspect ratio, zoom, and framing offset
 */
export function getCropRect(
  imgWidth: number,
  imgHeight: number,
  crop?: CropSettings
): { sx: number; sy: number; sw: number; sh: number; aspect: number } {
  if (!crop || crop.aspectRatio === 'original') {
    const zoom = crop ? Math.max(1, crop.zoom || 1) : 1;
    const sw = imgWidth / zoom;
    const sh = imgHeight / zoom;
    const maxShiftX = (imgWidth - sw) / 2;
    const maxShiftY = (imgHeight - sh) / 2;
    const offX = (crop?.offsetX ?? 0) / 50;
    const offY = (crop?.offsetY ?? 0) / 50;
    const sx = Math.max(0, Math.min(imgWidth - sw, (imgWidth - sw) / 2 + offX * maxShiftX));
    const sy = Math.max(0, Math.min(imgHeight - sh, (imgHeight - sh) / 2 + offY * maxShiftY));
    return { sx, sy, sw, sh, aspect: imgWidth / imgHeight };
  }

  let targetRatio = 1;
  if (crop.aspectRatio === '1:1') targetRatio = 1;
  else if (crop.aspectRatio === '3:4') targetRatio = 3 / 4;
  else if (crop.aspectRatio === '4:5') targetRatio = 4 / 5;
  else if (crop.aspectRatio === '16:9') targetRatio = 16 / 9;
  else if (crop.aspectRatio === '3:2') targetRatio = 3 / 2;

  const currentRatio = imgWidth / imgHeight;
  let baseW = imgWidth;
  let baseH = imgHeight;

  if (currentRatio > targetRatio) {
    baseW = imgHeight * targetRatio;
    baseH = imgHeight;
  } else {
    baseW = imgWidth;
    baseH = imgWidth / targetRatio;
  }

  const zoom = Math.max(1, crop.zoom || 1);
  const sw = baseW / zoom;
  const sh = baseH / zoom;

  // Center with bias towards upper portrait third to ensure full face and head are fully visible
  const centerShiftY = (imgHeight - sh) * 0.30;
  const centerShiftX = (imgWidth - sw) / 2;

  const maxShiftX = (imgWidth - sw) / 2;
  const maxShiftY = (imgHeight - sh) / 2;
  const offX = (crop.offsetX ?? 0) / 50;
  const offY = (crop.offsetY ?? 0) / 50;

  const sx = Math.max(0, Math.min(imgWidth - sw, centerShiftX + offX * maxShiftX));
  const sy = Math.max(0, Math.min(imgHeight - sh, centerShiftY + offY * maxShiftY));

  return { sx, sy, sw, sh, aspect: targetRatio };
}

/**
 * Converts a File or Blob into a base64 Data URL with optional downscaling to max dimension
 */
export async function fileToDataUrl(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch an image URL (such as sample selfies) and convert to base64 Data URL
 */
export async function urlToDataUrl(url: string, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Generates an enhanced high-fidelity studio simulation canvas if Gemini image model isn't active
 */
export async function generateStudioSimulationHeadshot(
  sourceDataUrl: string,
  style: HeadshotStyle,
  aspectRatio: '1:1' | '3:4' | '16:9'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let canvasW = 1000;
      let canvasH = 1000;

      if (aspectRatio === '3:4') {
        canvasW = 900;
        canvasH = 1200;
      } else if (aspectRatio === '16:9') {
        canvasW = 1280;
        canvasH = 720;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceDataUrl);
        return;
      }

      // 1. Draw Backdrop according to selected style
      const bgGradient = ctx.createRadialGradient(
        canvasW / 2,
        canvasH * 0.4,
        50,
        canvasW / 2,
        canvasH / 2,
        canvasW * 0.7
      );

      if (style.id === 'corporate-grey') {
        bgGradient.addColorStop(0, '#71717a');
        bgGradient.addColorStop(0.6, '#3f3f46');
        bgGradient.addColorStop(1, '#18181b');
      } else if (style.id === 'modern-tech-office') {
        bgGradient.addColorStop(0, '#38bdf8');
        bgGradient.addColorStop(0.4, '#0284c7');
        bgGradient.addColorStop(1, '#0f172a');
      } else if (style.id === 'outdoor-natural-light') {
        bgGradient.addColorStop(0, '#fef08a');
        bgGradient.addColorStop(0.5, '#d97706');
        bgGradient.addColorStop(1, '#064e3b');
      } else if (style.id === 'executive-boardroom') {
        bgGradient.addColorStop(0, '#60a5fa');
        bgGradient.addColorStop(0.5, '#1e3a8a');
        bgGradient.addColorStop(1, '#090d16');
      } else if (style.id === 'creative-monochrome') {
        bgGradient.addColorStop(0, '#52525b');
        bgGradient.addColorStop(0.7, '#27272a');
        bgGradient.addColorStop(1, '#09090b');
      } else if (style.id === 'warm-coffeehouse') {
        bgGradient.addColorStop(0, '#fdba74');
        bgGradient.addColorStop(0.5, '#c2410c');
        bgGradient.addColorStop(1, '#292524');
      } else {
        bgGradient.addColorStop(0, '#a8a29e');
        bgGradient.addColorStop(0.6, '#57534e');
        bgGradient.addColorStop(1, '#1c1917');
      }

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Add architectural bokeh / studio light spheres in background
      for (let i = 0; i < 7; i++) {
        const bx = (canvasW * 0.15) + (i * canvasW * 0.12);
        const by = canvasH * (0.2 + (i % 3) * 0.15);
        const br = 40 + (i % 4) * 25;
        const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        bGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Subject in Center with Portrait Depth & Framing (Focusing on full face and upper torso)
      const scale = Math.max(canvasW / img.width, canvasH / img.height) * 1.02;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (canvasW - drawW) / 2;
      const drawY = (canvasH - drawH) / 2 - (canvasH * 0.10);

      // Save before clipping & soft portrait feathering
      ctx.save();
      
      // Apply portrait photographic tone curve
      if (style.id === 'creative-monochrome') {
        ctx.filter = 'grayscale(100%) contrast(125%) brightness(105%)';
      } else if (style.id === 'outdoor-natural-light') {
        ctx.filter = 'saturate(115%) contrast(108%) brightness(104%) sepia(8%)';
      } else if (style.id === 'modern-tech-office') {
        ctx.filter = 'contrast(112%) brightness(106%) saturate(108%)';
      } else {
        ctx.filter = 'contrast(110%) brightness(103%) saturate(104%)';
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // 3. Studio 3-Point Light Overlay & Catchlight simulation
      const studioGlow = ctx.createRadialGradient(
        canvasW * 0.35,
        canvasH * 0.25,
        10,
        canvasW * 0.5,
        canvasH * 0.4,
        canvasW * 0.55
      );
      studioGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      studioGlow.addColorStop(0.6, 'rgba(255, 240, 220, 0.04)');
      studioGlow.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
      
      ctx.fillStyle = studioGlow;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 4. Subtle Studio Vignette
      const vignette = ctx.createRadialGradient(
        canvasW / 2,
        canvasH / 2,
        canvasW * 0.35,
        canvasW / 2,
        canvasH / 2,
        canvasW * 0.7
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvasW, canvasH);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = (e) => reject(e);
    img.src = sourceDataUrl;
  });
}

/**
 * Applies a natural skin smoothing and blemish softening mask to the facial portrait zone
 */
function applySkinSmoothingPass(
  targetCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  filterStyle: string,
  crop?: { sx: number; sy: number; sw: number; sh: number }
) {
  const smoothCanvas = document.createElement('canvas');
  smoothCanvas.width = width;
  smoothCanvas.height = height;
  const sCtx = smoothCanvas.getContext('2d');
  if (!sCtx) return;

  sCtx.imageSmoothingEnabled = true;
  sCtx.imageSmoothingQuality = 'high';

  // Apply subtle natural softening blur for skin frequency separation simulation
  const blurRadius = Math.max(2.5, Math.min(width, height) * 0.007);
  sCtx.filter = `${filterStyle} blur(${blurRadius}px) saturate(104%) brightness(101%)`;

  if (crop) {
    sCtx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
  } else {
    sCtx.drawImage(img, 0, 0, width, height);
  }

  // Create feathered facial skin zone gradient mask
  // Centered over T-zone and cheeks, feathering gently before eye rims, hairline, and jawline
  sCtx.globalCompositeOperation = 'destination-in';
  const skinGrad = sCtx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    Math.min(width, height) * 0.06,
    width * 0.5,
    height * 0.42,
    Math.max(width, height) * 0.32
  );
  skinGrad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  skinGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.65)');
  skinGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.35)');
  skinGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  sCtx.fillStyle = skinGrad;
  sCtx.fillRect(0, 0, width, height);

  // Overlay smoothed skin mask onto the target canvas
  targetCtx.save();
  targetCtx.filter = 'none';
  targetCtx.globalAlpha = 0.85;
  targetCtx.drawImage(smoothCanvas, 0, 0);
  targetCtx.restore();
}

/**
 * Export current headshot with user custom adjustments to downloadable Data URL
 * Supports optional target resolution (e.g., 2048 for high-res master, 1080 for LinkedIn)
 */
export async function exportAdjustedHeadshot(
  sourceUrl: string,
  adjustments: ImageAdjustments,
  mimeType: 'image/png' | 'image/jpeg' = 'image/png',
  targetDim?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let exportWidth = img.width;
      let exportHeight = img.height;

      const cropRect = getCropRect(img.width, img.height, adjustments.crop);
      const aspect = cropRect.aspect;

      if (targetDim) {
        if (aspect >= 1) {
          exportWidth = targetDim;
          exportHeight = Math.round(targetDim / aspect);
        } else {
          exportHeight = targetDim;
          exportWidth = Math.round(targetDim * aspect);
        }
      } else {
        const baseDim = 2048;
        if (aspect >= 1) {
          exportWidth = baseDim;
          exportHeight = Math.round(baseDim / aspect);
        } else {
          exportHeight = baseDim;
          exportWidth = Math.round(baseDim * aspect);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceUrl);
        return;
      }

      // Smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Compute CSS filter string for canvas
      const brightness = 100 + adjustments.exposure;
      const contrast = 100 + adjustments.contrast;
      const grayscale = adjustments.isBlackAndWhite ? 100 : 0;
      const sepia = adjustments.warmth > 0 ? adjustments.warmth * 0.4 : 0;
      const bgBlur = adjustments.backgroundBlur || 0;

      if (bgBlur > 0) {
        // Aperture Simulation: 1. Draw blurred background
        const blurPx = (bgBlur / 100) * (Math.max(exportWidth, exportHeight) * 0.02);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blurPx}px)`;
        const bleedX = exportWidth * 0.035;
        const bleedY = exportHeight * 0.035;
        ctx.drawImage(
          img,
          cropRect.sx,
          cropRect.sy,
          cropRect.sw,
          cropRect.sh,
          -bleedX,
          -bleedY,
          exportWidth + bleedX * 2,
          exportHeight + bleedY * 2
        );

        // 2. Draw Sharp Subject In-Focus using feathered elliptical mask
        const sharpCanvas = document.createElement('canvas');
        sharpCanvas.width = exportWidth;
        sharpCanvas.height = exportHeight;
        const sharpCtx = sharpCanvas.getContext('2d');
        if (sharpCtx) {
          sharpCtx.imageSmoothingEnabled = true;
          sharpCtx.imageSmoothingQuality = 'high';
          sharpCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
          sharpCtx.drawImage(
            img,
            cropRect.sx,
            cropRect.sy,
            cropRect.sw,
            cropRect.sh,
            0,
            0,
            exportWidth,
            exportHeight
          );

          sharpCtx.globalCompositeOperation = 'destination-in';
          const maskGrad = sharpCtx.createRadialGradient(
            exportWidth * 0.5,
            exportHeight * 0.43,
            Math.min(exportWidth, exportHeight) * 0.18,
            exportWidth * 0.5,
            exportHeight * 0.43,
            Math.max(exportWidth, exportHeight) * 0.48
          );
          maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          maskGrad.addColorStop(0.48, 'rgba(0, 0, 0, 1)');
          maskGrad.addColorStop(0.78, 'rgba(0, 0, 0, 0.7)');
          maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          sharpCtx.fillStyle = maskGrad;
          sharpCtx.fillRect(0, 0, exportWidth, exportHeight);

          ctx.filter = 'none';
          ctx.drawImage(sharpCanvas, 0, 0);
        }
      } else {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
        ctx.drawImage(
          img,
          cropRect.sx,
          cropRect.sy,
          cropRect.sw,
          cropRect.sh,
          0,
          0,
          exportWidth,
          exportHeight
        );
      }

      // AI Enhance Skin pass
      if (adjustments.skinEnhance) {
        applySkinSmoothingPass(
          ctx,
          img,
          exportWidth,
          exportHeight,
          `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`,
          cropRect
        );
      }

      // Shadow Brightening pass for facial definition
      if (adjustments.shadows && adjustments.shadows > 0) {
        try {
          const shadowLift = adjustments.shadows / 100;
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            if (luma < 0.72) {
              const shadowWeight = Math.pow(1 - luma, 1.8) * shadowLift * 0.42;
              data[i] = Math.min(255, Math.round(r + (255 - r) * shadowWeight));
              data[i + 1] = Math.min(255, Math.round(g + (255 - g) * shadowWeight));
              data[i + 2] = Math.min(255, Math.round(b + (255 - b) * shadowWeight));
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {
          console.warn('Shadow lift canvas processing fallback:', e);
        }
      }

      // Uniform Background Contrast pass to keep focus on subject
      if (adjustments.uniformBgContrast !== false) {
        const maxR = Math.max(canvas.width, canvas.height) * 0.75;
        const bgGrad = ctx.createRadialGradient(
          canvas.width * 0.5,
          canvas.height * 0.45,
          maxR * 0.35,
          canvas.width * 0.5,
          canvas.height * 0.45,
          maxR
        );
        bgGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        bgGrad.addColorStop(0.6, 'rgba(15, 15, 15, 0.06)');
        bgGrad.addColorStop(1, 'rgba(10, 10, 10, 0.22)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // If warmth < 0 (cooler), apply a gentle blue wash
      if (adjustments.warmth < 0) {
        ctx.fillStyle = `rgba(30, 64, 175, ${Math.abs(adjustments.warmth) * 0.003})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Apply vignette if > 0
      if (adjustments.vignette > 0) {
        const maxR = Math.max(canvas.width, canvas.height) * 0.7;
        const vigGrad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          maxR * 0.4,
          canvas.width / 2,
          canvas.height / 2,
          maxR
        );
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${adjustments.vignette * 0.007})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL(mimeType, mimeType === 'image/jpeg' ? 0.96 : 1.0));
    };
    img.onerror = (e) => reject(e);
    img.src = sourceUrl;
  });
}

/**
 * Export headshot cropped and resized precisely to platform specifications
 * (e.g. LinkedIn, Twitter/X, Instagram Square, Instagram 4:5 Portrait, Resume 3:4)
 */
export async function exportPlatformHeadshot(
  sourceUrl: string,
  adjustments: ImageAdjustments,
  targetWidth: number,
  targetHeight: number,
  format: 'png' | 'jpeg' = 'png'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(sourceUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Compute crop dimensions
      const srcW = img.width;
      const srcH = img.height;
      const srcAspect = srcW / srcH;
      const targetAspect = targetWidth / targetHeight;

      let cropX = 0;
      let cropY = 0;
      let cropW = srcW;
      let cropH = srcH;

      if (srcAspect > targetAspect) {
        // Source is wider than target aspect
        cropH = srcH;
        cropW = srcH * targetAspect;
        cropX = (srcW - cropW) / 2;
        cropY = 0;
      } else if (srcAspect < targetAspect) {
        // Source is taller than target aspect
        cropW = srcW;
        cropH = srcW / targetAspect;
        cropX = 0;
        // Bias portrait crop upwards (0.18 rather than 0.25) to keep full face and head centered
        cropY = Math.max(0, (srcH - cropH) * 0.18);
      }

      // Compute CSS filter string for canvas
      const brightness = 100 + adjustments.exposure;
      const contrast = 100 + adjustments.contrast;
      const grayscale = adjustments.isBlackAndWhite ? 100 : 0;
      const sepia = adjustments.warmth > 0 ? adjustments.warmth * 0.4 : 0;
      const bgBlur = adjustments.backgroundBlur || 0;

      if (bgBlur > 0) {
        // Aperture Simulation: 1. Draw blurred background
        const blurPx = (bgBlur / 100) * (Math.max(targetWidth, targetHeight) * 0.02);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blurPx}px)`;
        const bleedX = targetWidth * 0.035;
        const bleedY = targetHeight * 0.035;
        ctx.drawImage(img, cropX, cropY, cropW, cropH, -bleedX, -bleedY, targetWidth + bleedX * 2, targetHeight + bleedY * 2);

        // 2. Draw Sharp Subject In-Focus using feathered elliptical mask
        const sharpCanvas = document.createElement('canvas');
        sharpCanvas.width = targetWidth;
        sharpCanvas.height = targetHeight;
        const sharpCtx = sharpCanvas.getContext('2d');
        if (sharpCtx) {
          sharpCtx.imageSmoothingEnabled = true;
          sharpCtx.imageSmoothingQuality = 'high';
          sharpCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
          sharpCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);

          sharpCtx.globalCompositeOperation = 'destination-in';
          const maskGrad = sharpCtx.createRadialGradient(
            targetWidth * 0.5,
            targetHeight * 0.43,
            Math.min(targetWidth, targetHeight) * 0.18,
            targetWidth * 0.5,
            targetHeight * 0.43,
            Math.max(targetWidth, targetHeight) * 0.48
          );
          maskGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
          maskGrad.addColorStop(0.48, 'rgba(0, 0, 0, 1)');
          maskGrad.addColorStop(0.78, 'rgba(0, 0, 0, 0.7)');
          maskGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          sharpCtx.fillStyle = maskGrad;
          sharpCtx.fillRect(0, 0, targetWidth, targetHeight);

          ctx.filter = 'none';
          ctx.drawImage(sharpCanvas, 0, 0);
        }
      } else {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);
      }

      // AI Enhance Skin pass
      if (adjustments.skinEnhance) {
        applySkinSmoothingPass(
          ctx,
          img,
          targetWidth,
          targetHeight,
          `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`,
          { sx: cropX, sy: cropY, sw: cropW, sh: cropH }
        );
      }

      // If warmth < 0 (cooler), apply a gentle blue wash
      if (adjustments.warmth < 0) {
        ctx.fillStyle = `rgba(30, 64, 175, ${Math.abs(adjustments.warmth) * 0.003})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Apply vignette if > 0
      if (adjustments.vignette > 0) {
        const maxR = Math.max(canvas.width, canvas.height) * 0.7;
        const vigGrad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          maxR * 0.4,
          canvas.width / 2,
          canvas.height / 2,
          maxR
        );
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${adjustments.vignette * 0.007})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      resolve(canvas.toDataURL(mimeType, format === 'jpeg' ? 0.96 : 1.0));
    };
    img.onerror = (e) => reject(e);
    img.src = sourceUrl;
  });
}

