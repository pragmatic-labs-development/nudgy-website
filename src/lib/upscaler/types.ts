/** Shared types for the image upscaler worker and main thread */

// --- Worker message types (main → worker) ---

export interface InitMessage {
  type: 'INIT';
}

export interface UpscaleMessage {
  type: 'UPSCALE';
  imageData: ImageData;
  tileSize: number;
  overlap: number;
  passes: number; // 1 = 2x, 2 = 4x (runs the 2x model twice)
}

export interface CancelMessage {
  type: 'CANCEL';
}

export type WorkerInMessage = InitMessage | UpscaleMessage | CancelMessage;

// --- Worker message types (worker → main) ---

export interface ReadyMessage {
  type: 'READY';
}

export interface ModelProgressMessage {
  type: 'MODEL_PROGRESS';
  loaded: number;
  total: number;
}

export interface ModelLoadedMessage {
  type: 'MODEL_LOADED';
}

export interface TileProgressMessage {
  type: 'TILE_PROGRESS';
  current: number;
  total: number;
  pass: number;
  totalPasses: number;
}

export interface UpscaleCompleteMessage {
  type: 'UPSCALE_COMPLETE';
  imageData: ImageData;
  width: number;
  height: number;
  elapsed: number;
}

export interface ErrorMessage {
  type: 'ERROR';
  error: string;
  recoverable: boolean;
}

export interface CancelledMessage {
  type: 'CANCELLED';
}

export type WorkerOutMessage =
  | ReadyMessage
  | ModelProgressMessage
  | ModelLoadedMessage
  | TileProgressMessage
  | UpscaleCompleteMessage
  | ErrorMessage
  | CancelledMessage;

// --- UI state ---

export type UpscalerState =
  | 'empty'
  | 'loaded'
  | 'loading-model'
  | 'processing'
  | 'result'
  | 'error'
  | 'unsupported';

export interface LoadedImageInfo {
  file: File;
  name: string;
  width: number;
  height: number;
  size: number;
  imageData: ImageData;
  objectUrl: string;
}

export interface UpscaleResult {
  originalInfo: LoadedImageInfo;
  upscaledImageData: ImageData;
  upscaledObjectUrl: string;
  upscaledWidth: number;
  upscaledHeight: number;
  elapsed: number;
}
