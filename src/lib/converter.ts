import init, { PhotonImage } from '@silvia-odwyer/photon';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export interface ConversionResult {
  url: string;
  size: number;
}

// Singleton promise to ensure init() is called exactly once
let wasmInit: Promise<any> | null = null;

async function ensureWasmLoaded() {
  if (!wasmInit) {
    // Initialize the WASM module.
    // The default export 'init' from the package loads the WASM file.
    // Vite handles the new URL(...) inside the package if configured correctly.
    wasmInit = init();
  }
  await wasmInit;
}

// Helper to convert Blob to WebP using Canvas for quality control
function convertBlobToWebP(blob: Blob, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (resultBlob) => {
          if (resultBlob) {
            resolve(resultBlob);
          } else {
            reject(new Error('Canvas conversion to WebP failed'));
          }
        },
        'image/webp',
        quality / 100 // Convert 0-100 scale to 0.0-1.0 scale
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for WebP conversion'));
    };
    img.src = URL.createObjectURL(blob);
  });
}

export async function convertImage(
  file: File,
  format: OutputFormat,
  quality: number = 80
): Promise<ConversionResult> {
  // 1. Ensure WASM is loaded before doing anything
  // Even if using Canvas for WebP, we ensure consistent initialization
  await ensureWasmLoaded();

  let inputBlob: Blob = file;

  // 2. Handle HEIC inputs
  if (
    file.name.toLowerCase().endsWith('.heic') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  ) {
    console.log('Detected HEIC image, converting to PNG intermediate...');
    try {
      const heic2any = (await import('heic2any')).default;
      const result = await heic2any({
        blob: file,
        toType: 'image/png',
      });
      inputBlob = Array.isArray(result) ? result[0] : result;
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      throw new Error('Failed to process HEIC image.');
    }
  }

  // Special handling for WebP to support quality control via Canvas
  if (format === 'webp') {
    try {
      const webpBlob = await convertBlobToWebP(inputBlob, quality);
      return {
        url: URL.createObjectURL(webpBlob),
        size: webpBlob.size,
      };
    } catch (err) {
      console.error('WebP conversion failed:', err);
      throw new Error('Failed to convert image to WebP.');
    }
  }

  // 3. Read image data
  const buffer = await inputBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 4. Create PhotonImage
  let image: PhotonImage | null = null;
  try {
    image = PhotonImage.new_from_byteslice(bytes);
  } catch (err) {
    console.error('Photon failed to decode image:', err);
    throw new Error('Failed to decode image data. The format might not be supported.');
  }

  // 5. Convert/Encode to target format
  let outputBytes: Uint8Array;
  let mimeType: string;

  try {
    switch (format) {
      case 'png':
        // get_bytes() returns PNG by default as per type definitions
        outputBytes = image.get_bytes();
        mimeType = 'image/png';
        break;
      case 'jpeg':
        outputBytes = image.get_bytes_jpeg(quality);
        mimeType = 'image/jpeg';
        break;
      // WebP is handled above, but keeping case for completeness if we ever remove the block above
      case 'webp':
        outputBytes = image.get_bytes_webp();
        mimeType = 'image/webp';
        break;
      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  } catch (err) {
    console.error('Photon failed to encode image:', err);
    throw new Error('Failed to convert image.');
  } finally {
    // 6. Memory Cleanup
    // Always free the image instance to prevent memory leaks in WASM memory
    if (image) {
      image.free();
    }
  }

  // 7. Return Blob URL
  const blob = new Blob([outputBytes], { type: mimeType });
  return {
    url: URL.createObjectURL(blob),
    size: blob.size,
  };
}
