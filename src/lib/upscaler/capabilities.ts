/** Browser capability detection for the image upscaler */

export interface Capabilities {
  webgpu: boolean;
  workers: boolean;
  offscreenCanvas: boolean;
  cacheApi: boolean;
}

/** Check if WebGPU is available */
export function hasWebGPU(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/** Check if Web Workers are available */
export function hasWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/** Check if OffscreenCanvas is available */
export function hasOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}

/** Check if Cache API is available */
export function hasCacheApi(): boolean {
  return typeof caches !== 'undefined';
}

/** Get all capabilities at once */
export function getCapabilities(): Capabilities {
  return {
    webgpu: hasWebGPU(),
    workers: hasWorkers(),
    offscreenCanvas: hasOffscreenCanvas(),
    cacheApi: hasCacheApi(),
  };
}

/** Check if the browser supports all required features for the upscaler */
export function isSupported(): boolean {
  return hasWebGPU() && hasWorkers();
}

/** Get a human-readable reason why the browser is unsupported */
export function getUnsupportedReason(): string | null {
  if (!hasWebGPU()) {
    return 'Your browser does not support WebGPU, which is required for AI image processing. Please try Chrome 113+, Edge 113+, or Safari 18+.';
  }
  if (!hasWorkers()) {
    return 'Your browser does not support Web Workers, which are required for background processing.';
  }
  return null;
}
