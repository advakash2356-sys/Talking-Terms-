/**
 * Web Audio API & Zero-Trace Audio Streaming Utilities
 */

// Convert 32-bit Float Audio Buffer to 16-bit PCM for Multimodal Live / WebSocket streams
export function convertFloat32ToPCM16(inputData: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(inputData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < inputData.length; i++) {
    // Clamp to [-1, 1]
    const s = Math.max(-1, Math.min(1, inputData[i]));
    // Convert to 16-bit signed integer
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

// Compute RMS (Root Mean Square) Volume Level 0-100 from Float32 PCM chunk
export function calculateRMSVolume(inputData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < inputData.length; i++) {
    sum += inputData[i] * inputData[i];
  }
  const rms = Math.sqrt(sum / inputData.length);
  // Normalize to 0-100 with perceptual scaling
  return Math.min(100, Math.round(rms * 400));
}

// Zero-Trace In-Memory Buffer Wiping
export function zeroizeAudioBuffer(buffer: Float32Array | Uint8Array | ArrayBuffer | null) {
  if (!buffer) return;
  if (buffer instanceof ArrayBuffer) {
    new Uint8Array(buffer).fill(0);
  } else if ('fill' in buffer) {
    (buffer as any).fill(0);
  }
}

// Purge all client-side audio caches and indexed state upon disconnect
export function purgeClientAudioCaches() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  // Clear any web audio blobs or temporary audio contexts
  try {
    sessionStorage.removeItem('tt_active_audio_cache');
    localStorage.removeItem('tt_transient_snippet');
  } catch (_) {}
}
