import init, { PhotonImage } from '@silvia-odwyer/photon';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

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

export async function convertImage(
  file: File,
  format: OutputFormat,
  quality: number = 90
): Promise<string> {
  // 1. Ensure WASM is loaded before doing anything
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
  return URL.createObjectURL(blob);
}
