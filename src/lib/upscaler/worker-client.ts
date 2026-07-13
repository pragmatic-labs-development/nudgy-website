/**
 * Typed wrapper around the upscale Web Worker.
 * Provides a promise-based API with progress callbacks.
 */

import type {
  WorkerInMessage,
  WorkerOutMessage,
  LoadedImageInfo,
  UpscaleResult,
} from './types';
import { DEFAULT_TILE_SIZE, DEFAULT_OVERLAP } from './constants';

export interface WorkerCallbacks {
  onModelProgress?: (loaded: number, total: number) => void;
  onModelLoaded?: () => void;
  onTileProgress?: (current: number, total: number, pass: number, totalPasses: number) => void;
  onError?: (error: string, recoverable: boolean) => void;
  onCancelled?: () => void;
}

export class UpscaleWorkerClient {
  private worker: Worker | null = null;
  private initialized = false;

  /** Create and initialize the worker. Resolves when model is loaded. */
  async init(callbacks: WorkerCallbacks): Promise<void> {
    if (this.initialized && this.worker) return;

    this.worker = new Worker(
      new URL('./upscale.worker.ts', import.meta.url),
      { type: 'module' }
    );

    return new Promise<void>((resolve, reject) => {
      this.worker!.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        const msg = e.data;
        switch (msg.type) {
          case 'MODEL_PROGRESS':
            callbacks.onModelProgress?.(msg.loaded, msg.total);
            break;
          case 'MODEL_LOADED':
            callbacks.onModelLoaded?.();
            break;
          case 'READY':
            this.initialized = true;
            resolve();
            break;
          case 'ERROR':
            callbacks.onError?.(msg.error, msg.recoverable);
            reject(new Error(msg.error));
            break;
        }
      };

      this.worker!.onerror = (e) => {
        reject(new Error(`Worker error: ${e.message}`));
      };

      this.send({ type: 'INIT' });
    });
  }

  /** Upscale an image. passes=1 for 2x, passes=2 for 4x. */
  async upscale(
    info: LoadedImageInfo,
    callbacks: WorkerCallbacks,
    passes: number = 1
  ): Promise<UpscaleResult> {
    if (!this.worker || !this.initialized) {
      throw new Error('Worker not initialized');
    }

    return new Promise<UpscaleResult>((resolve, reject) => {
      let rejected = false;

      this.worker!.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        const msg = e.data;
        switch (msg.type) {
          case 'TILE_PROGRESS':
            callbacks.onTileProgress?.(msg.current, msg.total, msg.pass, msg.totalPasses);
            break;
          case 'UPSCALE_COMPLETE':
            resolve({
              originalInfo: info,
              upscaledImageData: msg.imageData,
              upscaledObjectUrl: '', // Will be set by caller
              upscaledWidth: msg.width,
              upscaledHeight: msg.height,
              elapsed: msg.elapsed,
            });
            break;
          case 'ERROR':
            if (!rejected) {
              rejected = true;
              callbacks.onError?.(msg.error, msg.recoverable);
              reject(new Error(msg.error));
            }
            break;
          case 'CANCELLED':
            callbacks.onCancelled?.();
            reject(new Error('Cancelled'));
            break;
        }
      };

      this.send({
        type: 'UPSCALE',
        imageData: info.imageData,
        tileSize: DEFAULT_TILE_SIZE,
        overlap: DEFAULT_OVERLAP,
        passes,
      });
    });
  }

  /** Cancel an in-progress upscale */
  cancel() {
    this.send({ type: 'CANCEL' });
  }

  /** Dispose the worker */
  dispose() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }

  private send(msg: WorkerInMessage) {
    this.worker?.postMessage(msg);
  }
}
