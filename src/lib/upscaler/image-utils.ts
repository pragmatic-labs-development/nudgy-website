/**
 * Image utility functions: decode, validate, and export.
 */

import {
  MAX_FILE_SIZE,
  MAX_DIMENSION,
  MAX_PIXELS,
  ACCEPTED_MIME_TYPES,
  ACCEPTED_FORMATS,
} from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate a file before processing */
export function validateFile(file: File): ValidationResult {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `Unsupported format. Please use ${ACCEPTED_FORMATS}.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
    };
  }

  return { valid: true };
}

/** Validate image dimensions after decoding */
export function validateDimensions(width: number, height: number): ValidationResult {
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    return {
      valid: false,
      error: `Image is too large (${width}x${height}). Maximum dimension is ${MAX_DIMENSION}px.`,
    };
  }

  if (width * height > MAX_PIXELS) {
    const mp = ((width * height) / 1_000_000).toFixed(1);
    return {
      valid: false,
      error: `Image is too large (${mp} MP). Maximum is ${MAX_PIXELS / 1_000_000} MP.`,
    };
  }

  return { valid: true };
}

/** Decode an image file into ImageData */
export async function decodeImage(file: File): Promise<{
  imageData: ImageData;
  width: number;
  height: number;
  objectUrl: string;
}> {
  const objectUrl = URL.createObjectURL(file);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = objectUrl;
  });

  const { naturalWidth: width, naturalHeight: height } = img;
  const dimCheck = validateDimensions(width, height);
  if (!dimCheck.valid) {
    URL.revokeObjectURL(objectUrl);
    throw new Error(dimCheck.error);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);

  return { imageData, width, height, objectUrl };
}

/** Convert ImageData to a PNG blob */
export function imageDataToPngBlob(imageData: ImageData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export PNG'));
      },
      'image/png'
    );
  });
}

/** Create an object URL from ImageData for display */
export async function imageDataToObjectUrl(imageData: ImageData): Promise<string> {
  const blob = await imageDataToPngBlob(imageData);
  return URL.createObjectURL(blob);
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Trigger a file download */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Generate output filename from input */
export function getOutputFilename(inputName: string): string {
  const dot = inputName.lastIndexOf('.');
  const base = dot > 0 ? inputName.slice(0, dot) : inputName;
  return `${base}-2x.png`;
}
