/**
 * Web Worker for Real-ESRGAN image upscaling via ONNX Runtime WebGPU.
 *
 * Protocol:
 *   Main → Worker: INIT | UPSCALE { imageData, tileSize, overlap } | CANCEL
 *   Worker → Main: READY | MODEL_PROGRESS | MODEL_LOADED | TILE_PROGRESS | UPSCALE_COMPLETE | ERROR | CANCELLED
 */

import {
  MODEL_URL,
  MODEL_CACHE_NAME,
  SCALE_FACTOR,
  MODEL_TILE_SIZE,
} from './constants';
import type { WorkerInMessage, WorkerOutMessage } from './types';

// We'll dynamically import onnxruntime-web/webgpu to avoid bundling issues
let ort: typeof import('onnxruntime-web');
let session: InstanceType<typeof import('onnxruntime-web').InferenceSession> | null = null;
let cancelled = false;

function post(msg: WorkerOutMessage) {
  self.postMessage(msg);
}

/** Fetch model with progress, using Cache API when available */
async function fetchModelWithProgress(): Promise<ArrayBuffer> {
  // Try cache first
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(MODEL_CACHE_NAME);
      const cached = await cache.match(MODEL_URL);
      if (cached) {
        const buf = await cached.arrayBuffer();
        post({ type: 'MODEL_PROGRESS', loaded: buf.byteLength, total: buf.byteLength });
        return buf;
      }
    } catch {
      // Cache API might fail in some contexts, continue to fetch
    }
  }

  const response = await fetch(MODEL_URL);
  if (!response.ok) {
    throw new Error(`Failed to download model: HTTP ${response.status}`);
  }

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;

  if (!response.body) {
    // Fallback: no streaming, just read the whole thing
    const buf = await response.arrayBuffer();
    post({ type: 'MODEL_PROGRESS', loaded: buf.byteLength, total: buf.byteLength });
    return buf;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    post({ type: 'MODEL_PROGRESS', loaded, total: total || loaded });
  }

  // Combine chunks
  const buf = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }

  // Store in cache for next time
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(MODEL_CACHE_NAME);
      await cache.put(MODEL_URL, new Response(buf.buffer, {
        headers: { 'Content-Type': 'application/octet-stream' },
      }));
    } catch {
      // Cache storage might be full or unavailable
    }
  }

  return buf.buffer;
}

/** Initialize ONNX Runtime and load the model */
async function init() {
  // Dynamic import to avoid bundling the full ONNX Runtime
  ort = await import('onnxruntime-web/webgpu');

  // Download model with progress reporting
  post({ type: 'MODEL_PROGRESS', loaded: 0, total: 0 });
  const modelBuffer = await fetchModelWithProgress();
  post({ type: 'MODEL_LOADED' });

  // Create inference session with WebGPU
  try {
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['webgpu'],
      graphOptimizationLevel: 'all',
    });
  } catch {
    // Fallback to WASM if WebGPU session creation fails
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
  }

  post({ type: 'READY' });
}

/**
 * Split an image into tiles with overlap.
 * Returns array of { x, y, w, h } describing each tile's position in the source.
 */
function computeTiles(
  imgW: number,
  imgH: number,
  tileSize: number,
  overlap: number
): Array<{ x: number; y: number; w: number; h: number }> {
  const tiles: Array<{ x: number; y: number; w: number; h: number }> = [];
  const step = tileSize - overlap;

  for (let y = 0; y < imgH; y += step) {
    for (let x = 0; x < imgW; x += step) {
      const tx = Math.min(x, Math.max(0, imgW - tileSize));
      const ty = Math.min(y, Math.max(0, imgH - tileSize));
      const tw = Math.min(tileSize, imgW - tx);
      const th = Math.min(tileSize, imgH - ty);
      tiles.push({ x: tx, y: ty, w: tw, h: th });
    }
  }

  // Deduplicate tiles at the same position
  const seen = new Set<string>();
  return tiles.filter((t) => {
    const key = `${t.x},${t.y},${t.w},${t.h}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Extract a tile from RGBA ImageData and convert to float32 NCHW RGB [1, 3, MODEL_TILE_SIZE, MODEL_TILE_SIZE].
 * Always produces a tensor of the model's fixed input size, padding with edge pixels if needed.
 */
function extractTileTensor(
  imageData: ImageData,
  tx: number,
  ty: number,
  tw: number,
  th: number
): Float32Array {
  const { data, width } = imageData;
  const ts = MODEL_TILE_SIZE;
  const tensor = new Float32Array(3 * ts * ts);

  for (let y = 0; y < ts; y++) {
    for (let x = 0; x < ts; x++) {
      // Clamp to tile bounds (edge-replicate padding)
      const sx = Math.min(x, tw - 1);
      const sy = Math.min(y, th - 1);
      const srcIdx = ((ty + sy) * width + (tx + sx)) * 4;
      const dstIdx = y * ts + x;
      tensor[0 * ts * ts + dstIdx] = data[srcIdx] / 255;     // R
      tensor[1 * ts * ts + dstIdx] = data[srcIdx + 1] / 255; // G
      tensor[2 * ts * ts + dstIdx] = data[srcIdx + 2] / 255; // B
    }
  }

  return tensor;
}

/**
 * Convert float32 NCHW [1, 3, H, W] output to RGBA Uint8ClampedArray.
 * Preserves alpha from the original tile.
 */
function tensorToRGBA(
  tensor: Float32Array,
  h: number,
  w: number,
  originalImageData: ImageData,
  origTx: number,
  origTy: number,
  origTw: number,
  origTh: number
): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(h * w * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = y * w + x;
      const dstIdx = (y * w + x) * 4;
      rgba[dstIdx] = Math.round(Math.min(1, Math.max(0, tensor[0 * h * w + srcIdx])) * 255);
      rgba[dstIdx + 1] = Math.round(Math.min(1, Math.max(0, tensor[1 * h * w + srcIdx])) * 255);
      rgba[dstIdx + 2] = Math.round(Math.min(1, Math.max(0, tensor[2 * h * w + srcIdx])) * 255);

      // Sample alpha from original image (nearest-neighbor from source tile)
      const origX = Math.min(Math.floor(x / SCALE_FACTOR), origTw - 1);
      const origY = Math.min(Math.floor(y / SCALE_FACTOR), origTh - 1);
      const origIdx = ((origTy + origY) * originalImageData.width + (origTx + origX)) * 4;
      rgba[dstIdx + 3] = originalImageData.data[origIdx + 3];
    }
  }

  return rgba;
}

/**
 * Blend an upscaled tile into the output buffer, using linear blending in overlap regions.
 */
function blendTileIntoOutput(
  output: Uint8ClampedArray,
  outW: number,
  tileRGBA: Uint8ClampedArray,
  tileOutW: number,
  tileOutH: number,
  outX: number,
  outY: number,
  overlap: number,
  imgOutW: number,
  imgOutH: number
) {
  const scaledOverlap = overlap * SCALE_FACTOR;

  for (let y = 0; y < tileOutH; y++) {
    for (let x = 0; x < tileOutW; x++) {
      const globalX = outX + x;
      const globalY = outY + y;
      if (globalX >= imgOutW || globalY >= imgOutH) continue;

      const srcIdx = (y * tileOutW + x) * 4;
      const dstIdx = (globalY * outW + globalX) * 4;

      // Compute blend weight for overlap regions
      let weight = 1;
      if (outX > 0 && x < scaledOverlap) {
        weight = Math.min(weight, x / scaledOverlap);
      }
      if (outY > 0 && y < scaledOverlap) {
        weight = Math.min(weight, y / scaledOverlap);
      }

      if (weight < 1 && output[dstIdx + 3] > 0) {
        // Blend with existing pixel
        output[dstIdx] = Math.round(output[dstIdx] * (1 - weight) + tileRGBA[srcIdx] * weight);
        output[dstIdx + 1] = Math.round(output[dstIdx + 1] * (1 - weight) + tileRGBA[srcIdx + 1] * weight);
        output[dstIdx + 2] = Math.round(output[dstIdx + 2] * (1 - weight) + tileRGBA[srcIdx + 2] * weight);
        output[dstIdx + 3] = Math.round(output[dstIdx + 3] * (1 - weight) + tileRGBA[srcIdx + 3] * weight);
      } else {
        output[dstIdx] = tileRGBA[srcIdx];
        output[dstIdx + 1] = tileRGBA[srcIdx + 1];
        output[dstIdx + 2] = tileRGBA[srcIdx + 2];
        output[dstIdx + 3] = tileRGBA[srcIdx + 3];
      }
    }
  }
}

/** Run a single tile through the model, padding to MODEL_TILE_SIZE and cropping output */
async function runTile(
  imageData: ImageData,
  tx: number,
  ty: number,
  tw: number,
  th: number
): Promise<{ rgba: Uint8ClampedArray; outW: number; outH: number }> {
  if (!session || !ort) throw new Error('Session not initialized');

  const ts = MODEL_TILE_SIZE;

  // Always create a MODEL_TILE_SIZE x MODEL_TILE_SIZE input tensor
  const inputData = extractTileTensor(imageData, tx, ty, tw, th);
  const inputTensor = new ort.Tensor('float32', inputData, [1, 3, ts, ts]);

  const feeds: Record<string, InstanceType<typeof ort.Tensor>> = {};
  const inputName = session.inputNames[0];
  feeds[inputName] = inputTensor;

  const results = await session.run(feeds);
  const outputName = session.outputNames[0];
  const outputTensor = results[outputName];

  // Model output is always MODEL_TILE_SIZE*2 x MODEL_TILE_SIZE*2
  const fullOutH = ts * SCALE_FACTOR;
  const fullOutW = ts * SCALE_FACTOR;
  const fullRGBA = tensorToRGBA(
    outputTensor.data as Float32Array,
    fullOutH,
    fullOutW,
    imageData,
    tx,
    ty,
    tw,
    th
  );

  // Crop to actual tile output size (remove padding)
  const cropW = tw * SCALE_FACTOR;
  const cropH = th * SCALE_FACTOR;

  if (cropW === fullOutW && cropH === fullOutH) {
    return { rgba: fullRGBA, outW: cropW, outH: cropH };
  }

  // Crop the padded output
  const cropped = new Uint8ClampedArray(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    const srcOff = (y * fullOutW) * 4;
    const dstOff = (y * cropW) * 4;
    cropped.set(fullRGBA.subarray(srcOff, srcOff + cropW * 4), dstOff);
  }

  return { rgba: cropped, outW: cropW, outH: cropH };
}

/** Run a single 2x pass over an ImageData, returning the 2x result */
async function runSinglePass(
  imageData: ImageData,
  tileSize: number,
  overlap: number,
  pass: number,
  totalPasses: number
): Promise<ImageData | null> {
  const { width: imgW, height: imgH } = imageData;
  const outW = imgW * SCALE_FACTOR;
  const outH = imgH * SCALE_FACTOR;

  const tiles = computeTiles(imgW, imgH, tileSize, overlap);
  const output = new Uint8ClampedArray(outW * outH * 4);

  let completed = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (cancelled) {
      post({ type: 'CANCELLED' });
      return null;
    }

    const tile = tiles[i];

    try {
      const result = await runTile(imageData, tile.x, tile.y, tile.w, tile.h);
      blendTileIntoOutput(
        output,
        outW,
        result.rgba,
        result.outW,
        result.outH,
        tile.x * SCALE_FACTOR,
        tile.y * SCALE_FACTOR,
        overlap,
        outW,
        outH
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      post({
        type: 'ERROR',
        error: `Processing failed: ${errorMsg}`,
        recoverable: true,
      });
      return null;
    }

    completed++;
    post({ type: 'TILE_PROGRESS', current: completed, total: tiles.length, pass, totalPasses });
  }

  if (cancelled) {
    post({ type: 'CANCELLED' });
    return null;
  }

  return new ImageData(output, outW, outH);
}

/** Main upscale routine: runs 1 or 2 passes of the 2x model */
async function upscale(imageData: ImageData, tileSize: number, overlap: number, passes: number) {
  if (!session) throw new Error('Model not loaded');
  cancelled = false;

  const startTime = performance.now();
  let current = imageData;

  for (let pass = 1; pass <= passes; pass++) {
    const result = await runSinglePass(current, tileSize, overlap, pass, passes);
    if (!result) return; // Cancelled or errored
    current = result;
  }

  const elapsed = Math.round(performance.now() - startTime);

  post({
    type: 'UPSCALE_COMPLETE',
    imageData: current,
    width: current.width,
    height: current.height,
    elapsed,
  });
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT':
      try {
        await init();
      } catch (err: unknown) {
        post({
          type: 'ERROR',
          error: `Failed to initialize: ${err instanceof Error ? err.message : String(err)}`,
          recoverable: false,
        });
      }
      break;

    case 'UPSCALE':
      try {
        await upscale(msg.imageData, msg.tileSize, msg.overlap, msg.passes);
      } catch (err: unknown) {
        post({
          type: 'ERROR',
          error: `Upscale failed: ${err instanceof Error ? err.message : String(err)}`,
          recoverable: true,
        });
      }
      break;

    case 'CANCEL':
      cancelled = true;
      break;
  }
};
