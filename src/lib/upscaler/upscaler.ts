/**
 * Main upscaler orchestrator.
 * Manages UI state, binds DOM events, and coordinates with the web worker.
 */

import type { UpscalerState, LoadedImageInfo, UpscaleResult } from './types';
import { isSupported, getUnsupportedReason } from './capabilities';
import { validateFile, decodeImage, imageDataToObjectUrl, imageDataToPngBlob, formatFileSize, downloadBlob } from './image-utils';
import { UpscaleWorkerClient } from './worker-client';
import { initComparisonSlider } from './comparison-slider';
import { MODEL_SIZE_MB } from './constants';

let state: UpscalerState = 'empty';
let loadedInfo: LoadedImageInfo | null = null;
let result: UpscaleResult | null = null;
let workerClient: UpscaleWorkerClient | null = null;
let cleanupSlider: (() => void) | null = null;
let objectUrls: string[] = [];
let selectedScale: 2 | 4 = 2;
let isZoomed = false;
let cleanupLoupe: (() => void) | null = null;

// DOM references
function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function announce(text: string) {
  const el = $('status-announce');
  el.textContent = '';
  // Force re-announce by clearing then setting
  requestAnimationFrame(() => {
    el.textContent = text;
  });
}

function showState(newState: UpscalerState) {
  state = newState;
  const states: UpscalerState[] = ['empty', 'loaded', 'loading-model', 'processing', 'result', 'error'];
  for (const s of states) {
    const el = document.getElementById(`state-${s}`);
    if (el) el.style.display = s === newState ? '' : 'none';
  }

  // Show/hide the workspace vs the unsupported notice
  const workspace = $('upscaler-workspace');
  const notice = $('browser-support-notice');

  if (newState === 'unsupported') {
    workspace.style.display = 'none';
    notice.style.display = '';
    const reason = getUnsupportedReason();
    if (reason) $('unsupported-reason').textContent = reason;
  } else {
    workspace.style.display = '';
    notice.style.display = 'none';
  }
}

function trackUrl(url: string): string {
  objectUrls.push(url);
  return url;
}

function revokeUrls() {
  for (const url of objectUrls) {
    URL.revokeObjectURL(url);
  }
  objectUrls = [];
}

async function handleFile(file: File) {
  const validation = validateFile(file);
  if (!validation.valid) {
    showError(validation.error!);
    return;
  }

  try {
    const decoded = await decodeImage(file);
    loadedInfo = {
      file,
      name: file.name,
      width: decoded.width,
      height: decoded.height,
      size: file.size,
      imageData: decoded.imageData,
      objectUrl: trackUrl(decoded.objectUrl),
    };

    // Update UI
    ($('preview-image') as HTMLImageElement).src = loadedInfo.objectUrl;
    $('loaded-filename').textContent = loadedInfo.name;
    $('loaded-meta').textContent = `${loadedInfo.width} × ${loadedInfo.height} · ${formatFileSize(loadedInfo.size)}`;

    showState('loaded');
    announce(`Image loaded: ${loadedInfo.name}, ${loadedInfo.width} by ${loadedInfo.height} pixels`);
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to load image');
  }
}

function showError(message: string) {
  $('error-text').textContent = message;
  showState('error');
  announce(`Error: ${message}`);
}

async function startUpscale() {
  if (!loadedInfo) return;

  // Lazy-init worker
  if (!workerClient) {
    workerClient = new UpscaleWorkerClient();

    showState('loading-model');
    announce(`Downloading AI model, approximately ${MODEL_SIZE_MB} megabytes`);

    try {
      await workerClient.init({
        onModelProgress(loaded, total) {
          if (total > 0) {
            const pct = Math.round((loaded / total) * 100);
            ($('model-progress-bar') as HTMLElement).style.width = `${pct}%`;
            $('model-progress-text').textContent =
              `${formatFileSize(loaded)} / ${formatFileSize(total)}`;
          }
        },
        onModelLoaded() {
          $('model-progress-text').textContent = 'Initializing model...';
        },
        onError(error) {
          showError(error);
        },
      });
    } catch {
      // Error already shown via callback
      workerClient = null;
      return;
    }
  }

  // Start upscaling
  const passes = selectedScale === 4 ? 2 : 1;
  showState('processing');
  announce(`Upscaling image ${selectedScale}x`);

  try {
    const upscaleResult = await workerClient.upscale(loadedInfo, {
      onTileProgress(current, total, pass, totalPasses) {
        // For multi-pass, show overall progress across all passes
        const overallPct = totalPasses > 1
          ? Math.round(((pass - 1) / totalPasses + (current / total) / totalPasses) * 100)
          : Math.round((current / total) * 100);
        ($('tile-progress-bar') as HTMLElement).style.width = `${overallPct}%`;
        const passLabel = totalPasses > 1 ? ` (pass ${pass}/${totalPasses})` : '';
        $('tile-progress-text').textContent = `Upscaling tile ${current} of ${total}${passLabel}`;
      },
      onError(error) {
        showError(error);
      },
      onCancelled() {
        showState('loaded');
        announce('Upscaling cancelled');
      },
    }, passes);

    // Create display URL for the upscaled image
    const upscaledUrl = trackUrl(await imageDataToObjectUrl(upscaleResult.upscaledImageData));
    upscaleResult.upscaledObjectUrl = upscaledUrl;
    result = upscaleResult;

    // Set up result display
    ($('result-before') as HTMLImageElement).src = loadedInfo.objectUrl;
    ($('result-after') as HTMLImageElement).src = upscaledUrl;
    $('result-dimensions').textContent =
      `${loadedInfo.width}×${loadedInfo.height} → ${upscaleResult.upscaledWidth}×${upscaleResult.upscaledHeight}`;
    $('result-time').textContent = `${(upscaleResult.elapsed / 1000).toFixed(1)}s`;

    showState('result');
    announce(
      `Upscaling complete. Image upscaled from ${loadedInfo.width} by ${loadedInfo.height} to ${upscaleResult.upscaledWidth} by ${upscaleResult.upscaledHeight} in ${(upscaleResult.elapsed / 1000).toFixed(1)} seconds.`
    );

    // Init comparison slider
    if (cleanupSlider) cleanupSlider();
    cleanupSlider = initComparisonSlider(
      $('comparison-slider'),
      $('comparison-after-wrapper'),
      $('comparison-divider')
    );

    // Init magnifying loupe
    setupLoupe(
      loadedInfo.objectUrl,
      upscaledUrl,
      loadedInfo.width,
      loadedInfo.height,
      upscaleResult.upscaledWidth,
      upscaleResult.upscaledHeight
    );
  } catch {
    // Error or cancellation already handled via callbacks
  }
}

function setupLoupe(beforeSrc: string, afterSrc: string, beforeW: number, beforeH: number, afterW: number, afterH: number) {
  if (cleanupLoupe) cleanupLoupe();

  const slider = $('comparison-slider');
  const loupe = $('comparison-loupe');
  const loupeBefore = $('loupe-before') as HTMLElement;
  const loupeAfter = $('loupe-after') as HTMLElement;

  // The zoom ratio: how much bigger the native image is vs the displayed size
  // We want to show native pixels, so background-size = natural image dimensions
  loupeBefore.style.backgroundImage = `url(${beforeSrc})`;
  loupeAfter.style.backgroundImage = `url(${afterSrc})`;

  function onMouseMove(e: MouseEvent) {
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Position loupe
    loupe.style.left = `${x}px`;
    loupe.style.top = `${y}px`;
    loupe.style.display = 'block';

    // Calculate relative position (0-1)
    const relX = x / rect.width;
    const relY = y / rect.height;

    const loupeRadius = 100; // half of 200px

    // Before image: show at the upscaled resolution using pixelated rendering
    // so the user sees blocky pixels vs smooth AI output
    const beforeBgW = afterW; // stretch before to after dimensions for fair comparison
    const beforeBgH = afterH;
    const beforeBgX = relX * beforeBgW - loupeRadius;
    const beforeBgY = relY * beforeBgH - loupeRadius;
    loupeBefore.style.backgroundSize = `${beforeBgW}px ${beforeBgH}px`;
    loupeBefore.style.backgroundPosition = `-${beforeBgX}px -${beforeBgY}px`;

    // After image: show at native resolution
    const afterBgX = relX * afterW - loupeRadius;
    const afterBgY = relY * afterH - loupeRadius;
    loupeAfter.style.backgroundSize = `${afterW}px ${afterH}px`;
    loupeAfter.style.backgroundPosition = `-${afterBgX}px -${afterBgY}px`;
  }

  function onMouseLeave() {
    loupe.style.display = 'none';
  }

  slider.addEventListener('mousemove', onMouseMove);
  slider.addEventListener('mouseleave', onMouseLeave);

  cleanupLoupe = () => {
    slider.removeEventListener('mousemove', onMouseMove);
    slider.removeEventListener('mouseleave', onMouseLeave);
    loupe.style.display = 'none';
  };
}

function cancelUpscale() {
  workerClient?.cancel();
}

async function downloadResult() {
  if (!result || !loadedInfo) return;

  try {
    const blob = await imageDataToPngBlob(result.upscaledImageData);
    const dot = loadedInfo.name.lastIndexOf('.');
    const base = dot > 0 ? loadedInfo.name.slice(0, dot) : loadedInfo.name;
    const scale = result.upscaledWidth / loadedInfo.width;
    downloadBlob(blob, `${base}-${scale}x.png`);
  } catch {
    showError('Failed to export image');
  }
}

function reset() {
  revokeUrls();
  loadedInfo = null;
  result = null;
  if (cleanupSlider) {
    cleanupSlider();
    cleanupSlider = null;
  }
  if (cleanupLoupe) {
    cleanupLoupe();
    cleanupLoupe = null;
  }
  isZoomed = false;
  showState('empty');
}

export function initUpscaler() {
  // Check browser support
  if (!isSupported()) {
    showState('unsupported');
    return;
  }

  showState('empty');

  // --- Drop zone ---
  const dropzone = $('dropzone');
  const fileInput = $('file-input') as HTMLInputElement;

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = (e as DragEvent).dataTransfer?.files;
    if (files?.length) handleFile(files[0]);
  });

  // Keyboard: Enter/Space on the dropzone triggers file picker
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) {
      handleFile(fileInput.files[0]);
      fileInput.value = ''; // Allow re-selecting same file
    }
  });

  // --- Scale toggle ---
  const scale2xBtn = $('scale-2x');
  const scale4xBtn = $('scale-4x');

  function setScale(scale: 2 | 4) {
    selectedScale = scale;
    scale2xBtn.classList.toggle('active', scale === 2);
    scale4xBtn.classList.toggle('active', scale === 4);
    scale2xBtn.setAttribute('aria-checked', String(scale === 2));
    scale4xBtn.setAttribute('aria-checked', String(scale === 4));
    $('btn-upscale-label').textContent = `Upscale ${scale}x`;
  }

  scale2xBtn.addEventListener('click', () => setScale(2));
  scale4xBtn.addEventListener('click', () => setScale(4));

  // --- Loaded state buttons ---
  $('btn-upscale').addEventListener('click', startUpscale);
  $('btn-clear').addEventListener('click', reset);

  // --- Processing state ---
  $('btn-cancel').addEventListener('click', cancelUpscale);

  // --- Result state ---
  $('btn-zoom').addEventListener('click', () => {
    isZoomed = !isZoomed;
    const slider = $('comparison-slider');
    const btn = $('btn-zoom');
    slider.classList.toggle('zoomed', isZoomed);
    btn.setAttribute('aria-pressed', String(isZoomed));
    $('btn-zoom-label').textContent = isZoomed ? 'Fit to view' : 'Zoom 100%';

    if (isZoomed && result) {
      // Size the after wrapper to match the before image's natural size
      const beforeImg = $('result-before') as HTMLImageElement;
      const afterWrapper = $('comparison-after-wrapper') as HTMLElement;
      const afterImg = $('result-after') as HTMLImageElement;

      // The before image renders at native (upscaled) size in zoomed mode
      // via image-rendering: pixelated. The after wrapper must match.
      afterWrapper.style.width = `${beforeImg.naturalWidth}px`;
      afterWrapper.style.height = `${beforeImg.naturalHeight}px`;
      afterImg.style.width = `${beforeImg.naturalWidth}px`;
      afterImg.style.height = `${beforeImg.naturalHeight}px`;

      // Scroll to center
      slider.scrollLeft = (slider.scrollWidth - slider.clientWidth) / 2;
      slider.scrollTop = (slider.scrollHeight - slider.clientHeight) / 2;
    } else {
      // Reset inline styles
      const afterWrapper = $('comparison-after-wrapper') as HTMLElement;
      const afterImg = $('result-after') as HTMLImageElement;
      afterWrapper.style.width = '';
      afterWrapper.style.height = '';
      afterImg.style.width = '';
      afterImg.style.height = '';
    }
  });

  $('btn-download').addEventListener('click', downloadResult);
  $('btn-new').addEventListener('click', reset);

  // --- Error state ---
  $('btn-retry').addEventListener('click', () => {
    if (loadedInfo) {
      showState('loaded');
    } else {
      reset();
    }
  });

  // --- Paste support ---
  document.addEventListener('paste', (e) => {
    // Only handle paste when on the upscaler page and in a relevant state
    if (state !== 'empty' && state !== 'loaded') return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleFile(file);
        return;
      }
    }
  });
}
