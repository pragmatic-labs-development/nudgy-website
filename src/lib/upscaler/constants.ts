/** Constants for the image upscaler */

/** Scale factor for upscaling */
export const SCALE_FACTOR = 2;

/**
 * Fixed tile size required by the model.
 * The ONNX export has fixed spatial dims [1, 3, 64, 64].
 */
export const MODEL_TILE_SIZE = 64;

/** Default tile size in pixels (must equal MODEL_TILE_SIZE for this model) */
export const DEFAULT_TILE_SIZE = MODEL_TILE_SIZE;

/** Overlap between tiles in pixels (blended to avoid seams) */
export const DEFAULT_OVERLAP = 8;

/** Maximum input file size in bytes (15 MB) */
export const MAX_FILE_SIZE = 15 * 1024 * 1024;

/** Maximum input dimension in pixels (width or height) */
export const MAX_DIMENSION = 5000;

/** Maximum total pixel count (16 megapixels) */
export const MAX_PIXELS = 16_000_000;

/** Accepted MIME types for input images */
export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Human-readable accepted formats */
export const ACCEPTED_FORMATS = 'PNG, JPEG, WebP';

/** Real-ESRGAN x2plus model URL (Hugging Face CDN) */
export const MODEL_URL =
  'https://huggingface.co/tidus2102/Real-ESRGAN/resolve/main/Real-ESRGAN_x2plus.onnx';

/** Cache name for the model file in Cache API */
export const MODEL_CACHE_NAME = 'nudgy-upscaler-model-v1';

/** Approximate model file size for UI display */
export const MODEL_SIZE_MB = 67;

/** ONNX Runtime WASM CDN base (pinned version) */
export const ORT_WASM_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/';
