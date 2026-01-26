import { PhotonImage } from '@silvia-odwyer/photon';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export async function convertImage(
  file: File,
  format: OutputFormat,
  quality: number = 90
): Promise<string> {
  let inputBlob: Blob = file;

  // 1. Handle HEIC inputs by converting them to PNG first using heic2any
  if (
    file.name.toLowerCase().endsWith('.heic') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  ) {
    console.log('Detected HEIC image, converting to PNG intermediate...');
    try {
      // Dynamic import to keep bundle size optimized if not needed
      const heic2any = (await import('heic2any')).default;
      const result = await heic2any({
        blob: file,
        toType: 'image/png',
      });
      // heic2any can return a single Blob or an array of Blobs (for animations)
      // We take the first one for now.
      inputBlob = Array.isArray(result) ? result[0] : result;
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      throw new Error('Failed to process HEIC image.');
    }
  }

  // 2. Read image data into a Uint8Array
  const buffer = await inputBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 3. Create a PhotonImage from the raw bytes
  // Photon supports PNG, JPEG, WEBP, GIF, BMP, ICO, TIFF depending on features,
  // but standard build usually supports common web formats.
  let image: PhotonImage;
  try {
    image = PhotonImage.new_from_byteslice(bytes);
  } catch (err) {
    console.error('Photon failed to decode image:', err);
    throw new Error('Failed to decode image data. The format might not be supported.');
  }

  // 4. Convert/Encode to the target format
  let outputBytes: Uint8Array;
  let mimeType: string;

  try {
    switch (format) {
      case 'png':
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
        // Fallback or error
        image.free();
        throw new Error(`Unsupported output format: ${format}`);
    }
  } catch (err) {
    image.free();
    console.error('Photon failed to encode image:', err);
    throw new Error('Failed to convert image.');
  }

  // Clean up WASM memory for the image
  image.free();

  // 5. Return a Blob URL for the result
  const blob = new Blob([outputBytes], { type: mimeType });
  return URL.createObjectURL(blob);
}
