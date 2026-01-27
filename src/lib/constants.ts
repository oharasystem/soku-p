export const SUPPORTED_INPUTS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic'];
export const SUPPORTED_OUTPUTS = ['jpg', 'jpeg', 'png', 'webp'];

export const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  heic: 'image/heic',
};

export function isValidFormat(source: string, target: string): boolean {
  if (!source || !target) return false;

  const cleanSource = source.toLowerCase();
  const cleanTarget = target.toLowerCase();

  // 1. Source must be supported
  if (!SUPPORTED_INPUTS.includes(cleanSource)) {
    return false;
  }

  // 2. Target must be supported
  if (!SUPPORTED_OUTPUTS.includes(cleanTarget)) {
    return false;
  }

  // 3. Source and target should be different
  if (cleanSource === cleanTarget) {
    return false;
  }

  return true;
}
